import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types';
import GoogleDriveConnect from './GoogleDriveConnect';
import { useSearchParams } from 'react-router-dom';

export default function GoogleDriveSyncManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchEvents();
    handleOAuthCallback();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = async () => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-oauth-callback`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, eventId: state }),
          }
        );

        if (response.ok) {
          setSearchParams({});
          fetchEvents();
          alert('Google Drive connected successfully!');
        } else {
          const error = await response.json();
          console.error('OAuth error:', error);
          alert('Failed to connect Google Drive');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        alert('Failed to connect Google Drive');
      }
    }
  };

  if (loading) {
    return <div className="text-white">Loading events...</div>;
  }

  const eventsWithFolder = events.filter(e => e.google_drive_folder_id);

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Google Drive Auto-Sync</h2>
        <p className="text-gray-400">
          Connect events to Google Drive folders for automatic photo syncing
        </p>
      </div>

      {eventsWithFolder.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">
            No events with Google Drive folders configured.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Add a Google Drive Folder ID to an event in Events Manager first.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {eventsWithFolder.map((event) => (
            <GoogleDriveConnect
              key={event.id}
              event={event}
              onConnected={fetchEvents}
            />
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-white font-semibold mb-2">How it works:</h3>
        <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
          <li>Create an event and add a Google Drive Folder ID</li>
          <li>Click "Connect Google Drive" and authorize access</li>
          <li>Photos from that folder will sync automatically every few minutes</li>
          <li>Enable "Auto-approve" to publish photos instantly, or review them first</li>
          <li>Photos appear on your public event gallery page in real-time</li>
        </ol>
      </div>
    </div>
  );
}
