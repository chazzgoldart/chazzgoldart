import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types';
import { Download, AlertCircle, CheckCircle } from 'lucide-react';

export default function GoogleDriveSync() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
      if (data && data.length > 0) {
        setSelectedEventId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleSync = async () => {
    if (!selectedEventId || !accessToken) {
      setResult({
        success: false,
        message: 'Please select an event and provide an access token',
      });
      return;
    }

    const selectedEvent = events.find((e) => e.id === selectedEventId);
    if (!selectedEvent?.google_drive_folder_id) {
      setResult({
        success: false,
        message: 'Selected event does not have a Google Drive folder ID',
      });
      return;
    }

    setSyncing(true);
    setResult(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-google-drive-photos`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: selectedEventId,
          folderId: selectedEvent.google_drive_folder_id,
          accessToken: accessToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({
          success: false,
          message: data.error || 'Failed to sync photos',
          details: data.details,
        });
      } else {
        setResult({
          success: true,
          message: `Successfully synced! Found ${data.totalFiles} files, added ${data.newPhotos} new photos.`,
          details: data,
        });
        setAccessToken('');
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error syncing photos',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Google Drive Photo Sync</h2>

      <div className="space-y-4 max-w-2xl">
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4 mb-6">
          <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            How to get Google Drive Access Token
          </h3>
          <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://developers.google.com/oauthplayground/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">OAuth 2.0 Playground</a></li>
            <li>Click the gear icon (top right) and check "Use your own OAuth credentials"</li>
            <li>Enter your OAuth Client ID and Secret (from Google Cloud Console)</li>
            <li>In Step 1, find "Drive API v3" and select "https://www.googleapis.com/auth/drive.readonly"</li>
            <li>Click "Authorize APIs" and sign in with Google</li>
            <li>In Step 2, click "Exchange authorization code for tokens"</li>
            <li>Copy the "Access token" and paste it below</li>
          </ol>
          <p className="text-xs text-gray-400 mt-2">
            Note: Access tokens expire after 1 hour. You'll need to generate a new one for each sync.
          </p>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-400">No events yet. Create an event with a Google Drive folder ID first.</p>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.display_name}
                    {event.google_drive_folder_id ? ` (${event.google_drive_folder_id})` : ' (No folder ID)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Google Drive Access Token
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Paste your access token here"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your token is never stored and only used for this sync operation
              </p>
            </div>

            <button
              onClick={handleSync}
              disabled={syncing || !accessToken || !selectedEventId}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              {syncing ? 'Syncing...' : 'Sync Photos from Google Drive'}
            </button>
          </>
        )}

        {result && (
          <div
            className={`rounded-lg p-4 ${
              result.success
                ? 'bg-green-900/20 border border-green-500/50'
                : 'bg-red-900/20 border border-red-500/50'
            }`}
          >
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-semibold ${
                    result.success ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {result.message}
                </p>
                {result.details && (
                  <pre className="text-xs text-gray-400 mt-2 overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
