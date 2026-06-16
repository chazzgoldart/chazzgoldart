import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types';
import { Link, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface GoogleDriveConnectProps {
  event: Event;
  onConnected: () => void;
}

export default function GoogleDriveConnect({ event, onConnected }: GoogleDriveConnectProps) {
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (code && state === event.id) {
        setConnecting(true);
        setStatus('Processing OAuth callback...');

        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-oauth-callback`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({ code, eventId: event.id }),
            }
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'OAuth callback failed');
          }

          setStatus('Connected successfully!');
          window.history.replaceState({}, '', window.location.pathname);
          setTimeout(() => {
            onConnected();
          }, 100);
        } catch (error) {
          console.error('OAuth callback error:', error);
          setStatus(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setConnecting(false);
        }
      }
    };

    handleOAuthCallback();
  }, [event.id, onConnected]);

  const handleConnect = () => {
    const isProduction = window.location.hostname === 'chazzgold.art' ||
                        window.location.hostname === 'www.chazzgold.art';
    const redirectUri = 'https://chazzgold.art/admin';

    const scope = 'https://www.googleapis.com/auth/drive.readonly';
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '678461176298-e7d992r4hul1ilisior94qi735irk6b4.apps.googleusercontent.com';

    if (!isProduction) {
      setStatus('Google OAuth only works on production (chazzgold.art). Please deploy to production to connect.');
      return;
    }

    setStatus('Initiating OAuth flow...');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&access_type=offline` +
      `&prompt=consent` +
      `&state=${event.id}`;

    window.location.href = authUrl;
  };

  const handleManualSync = async () => {
    if (!event.google_refresh_token) {
      setStatus('Please connect Google Drive first');
      return;
    }

    setSyncing(true);
    setStatus('Syncing photos...');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-sync-google-drive`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const result = await response.json();
      const eventResult = result.results?.find((r: any) => r.eventId === event.id);

      if (eventResult) {
        setStatus(`Synced ${eventResult.newPhotos} new photos`);
      } else {
        setStatus('Sync completed');
      }

      onConnected();
    } catch (error) {
      console.error('Sync error:', error);
      setStatus('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const isConnected = !!event.google_refresh_token;
  const lastSynced = event.last_synced_at
    ? new Date(event.last_synced_at).toLocaleString()
    : 'Never';

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold mb-1">{event.display_name}</h3>
          <p className="text-gray-400 text-sm">
            {event.google_drive_folder_id ? (
              <>Drive Folder: {event.google_drive_folder_id}</>
            ) : (
              <>No folder configured</>
            )}
          </p>
        </div>

        {isConnected ? (
          <CheckCircle className="w-6 h-6 text-green-500" />
        ) : (
          <AlertCircle className="w-6 h-6 text-yellow-500" />
        )}
      </div>

      <div className="flex gap-2">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={!event.google_drive_folder_id || connecting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <Link className="w-4 h-4" />
            {connecting ? 'Connecting...' : 'Connect Google Drive'}
          </button>
        ) : (
          <>
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
            <button
              onClick={handleConnect}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Reconnect
            </button>
          </>
        )}
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>Last synced: {lastSynced}</p>
        <p>Sync interval: {event.sync_interval_minutes} minutes</p>
        <p>Auto-approve: {event.auto_approve_photos ? 'Yes' : 'No'}</p>
        {status && (
          <p className="text-cyan-400 font-medium">{status}</p>
        )}
      </div>
    </div>
  );
}
