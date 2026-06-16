import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SyncRequest {
  eventId: string;
  folderId: string;
  accessToken: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { eventId, folderId, accessToken }: SyncRequest = await req.json();

    if (!eventId || !folderId || !accessToken) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const driveApiUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType+contains+'image/'+and+trashed=false&fields=files(id,name,mimeType,modifiedTime)&pageSize=1000`;

    const driveResponse = await fetch(driveApiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!driveResponse.ok) {
      const error = await driveResponse.text();
      return new Response(
        JSON.stringify({ error: 'Failed to fetch from Google Drive', details: error }),
        {
          status: driveResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const driveData = await driveResponse.json();
    const files = driveData.files || [];

    const { data: existingPhotos } = await supabase
      .from('photos')
      .select('google_drive_file_id')
      .eq('event_id', eventId);

    const existingFileIds = new Set(
      existingPhotos?.map((p) => p.google_drive_file_id) || []
    );

    const newPhotos = [];

    for (const file of files) {
      if (existingFileIds.has(file.id)) {
        continue;
      }

      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
      const imageResponse = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!imageResponse.ok) {
        console.error(`Failed to download file ${file.id}`);
        continue;
      }

      const imageBlob = await imageResponse.blob();
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${eventId}/${file.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('event-photos')
        .upload(fileName, imageBlob, {
          contentType: file.mimeType,
          upsert: false,
        });

      if (uploadError) {
        console.error(`Failed to upload file ${file.id}:`, uploadError);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('event-photos')
        .getPublicUrl(fileName);

      newPhotos.push({
        event_id: eventId,
        image_url: publicUrlData.publicUrl,
        thumbnail_url: publicUrlData.publicUrl,
        original_filename: file.name,
        is_visible: false,
        google_drive_file_id: file.id,
        taken_at: file.modifiedTime,
      });
    }

    if (newPhotos.length > 0) {
      const { error: insertError } = await supabase
        .from('photos')
        .insert(newPhotos);

      if (insertError) {
        return new Response(
          JSON.stringify({ error: 'Failed to insert photos', details: insertError }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalFiles: files.length,
        newPhotos: newPhotos.length,
        existingPhotos: files.length - newPhotos.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in sync function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
