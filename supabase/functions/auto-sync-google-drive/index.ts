import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

async function refreshGoogleToken(refreshToken: string): Promise<string | null> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    console.error('Google OAuth credentials not configured');
    return null;
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    console.error('Failed to refresh token:', await response.text());
    return null;
  }

  const data: GoogleTokenResponse = await response.json();
  return data.access_token;
}

async function syncEventPhotos(
  supabase: any,
  event: any,
  accessToken: string
): Promise<{ newPhotos: number; errors: number }> {
  let newPhotos = 0;
  let errors = 0;

  try {
    const driveApiUrl = `https://www.googleapis.com/drive/v3/files?q='${event.google_drive_folder_id}'+in+parents+and+mimeType+contains+'image/'+and+trashed=false&fields=files(id,name,mimeType,modifiedTime)&pageSize=1000`;

    const driveResponse = await fetch(driveApiUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!driveResponse.ok) {
      console.error(`Failed to fetch Drive files for event ${event.id}`);
      return { newPhotos, errors: errors + 1 };
    }

    const driveData = await driveResponse.json();
    const files = driveData.files || [];

    const { data: existingPhotos } = await supabase
      .from('photos')
      .select('google_drive_file_id')
      .eq('event_id', event.id);

    const existingFileIds = new Set(
      existingPhotos?.map((p: any) => p.google_drive_file_id) || []
    );

    const photosToInsert = [];

    for (const file of files) {
      if (existingFileIds.has(file.id)) continue;

      try {
        const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
        const imageResponse = await fetch(downloadUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!imageResponse.ok) {
          console.error(`Failed to download file ${file.id}`);
          errors++;
          continue;
        }

        const imageBlob = await imageResponse.blob();
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${event.id}/${file.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('event-photos')
          .upload(fileName, imageBlob, {
            contentType: file.mimeType,
            upsert: false,
          });

        if (uploadError) {
          console.error(`Failed to upload file ${file.id}:`, uploadError);
          errors++;
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('event-photos')
          .getPublicUrl(fileName);

        photosToInsert.push({
          event_id: event.id,
          image_url: publicUrlData.publicUrl,
          thumbnail_url: publicUrlData.publicUrl,
          original_filename: file.name,
          is_visible: event.auto_approve_photos,
          google_drive_file_id: file.id,
          taken_at: file.modifiedTime,
        });

        newPhotos++;
      } catch (error) {
        console.error(`Error processing file ${file.id}:`, error);
        errors++;
      }
    }

    if (photosToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('photos')
        .insert(photosToInsert);

      if (insertError) {
        console.error('Failed to insert photos:', insertError);
        errors++;
      }
    }

    await supabase
      .from('events')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', event.id);

  } catch (error) {
    console.error(`Error syncing event ${event.id}:`, error);
    errors++;
  }

  return { newPhotos, errors };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .not('google_drive_folder_id', 'is', null)
      .not('google_refresh_token', 'is', null);

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No events configured for auto-sync' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const event of events) {
      const lastSynced = event.last_synced_at ? new Date(event.last_synced_at) : null;
      const minutesSinceSync = lastSynced
        ? (now.getTime() - lastSynced.getTime()) / 1000 / 60
        : Infinity;

      if (minutesSinceSync < event.sync_interval_minutes) {
        continue;
      }

      const accessToken = await refreshGoogleToken(event.google_refresh_token);
      if (!accessToken) {
        results.push({
          eventId: event.id,
          eventName: event.display_name,
          status: 'error',
          message: 'Failed to refresh Google token',
        });
        continue;
      }

      const { newPhotos, errors } = await syncEventPhotos(supabase, event, accessToken);

      results.push({
        eventId: event.id,
        eventName: event.display_name,
        status: errors > 0 ? 'partial' : 'success',
        newPhotos,
        errors,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: now.toISOString(),
        eventsProcessed: results.length,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in auto-sync function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});