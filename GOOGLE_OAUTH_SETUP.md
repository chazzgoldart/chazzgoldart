# Google OAuth Setup Instructions

## Required Configuration

To make the Google Drive photo sync work, you need to configure secrets in Supabase for the Edge Functions.

### 1. Set Supabase Edge Function Secrets

Run these commands in your terminal (or add them via the Supabase Dashboard):

```bash
# Navigate to your Supabase project
# Go to: Project Settings > Edge Functions > Secrets

# Add these three secrets:
GOOGLE_CLIENT_ID=678461176298-e7d992r4hul1ilisior94qi735irk6b4.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://chazzgold.art/admin
```

### 2. Verify Google Cloud Console Settings

Make sure in your Google Cloud Console (https://console.cloud.google.com):

1. **APIs & Services > Credentials**
   - Your OAuth 2.0 Client ID should have these authorized redirect URIs:
     - `https://chazzgold.art/admin`
     - `https://www.chazzgold.art/admin` (optional)

2. **APIs & Services > Library**
   - Ensure "Google Drive API" is enabled

3. **OAuth Consent Screen**
   - Must be configured with at least:
     - App name
     - User support email
     - Developer contact email
   - Scopes should include: `https://www.googleapis.com/auth/drive.readonly`

### 3. Deploy to Production

Once the above is configured:

1. Push your code to GitHub
2. Netlify will automatically deploy to chazzgold.art
3. Log into the admin panel at https://chazzgold.art/admin
4. Go to "Auto-Sync Setup" tab
5. Click "Connect Google Drive" for each event
6. Complete the OAuth flow

### 4. How the Photo Sync Works

Once connected:

1. **Automatic Sync**: Every X minutes (configurable per event), the system checks for new photos
2. **Photo Upload**: When you upload photos to the linked Google Drive folder, they're detected
3. **Moderation**: Photos appear in "Photo Moderation" tab for review
4. **Approval**: You can approve/reject photos
5. **Public Gallery**: Approved photos appear in the event gallery at events.chazzgold.art

### 5. Manual Sync

You can also trigger a manual sync anytime:
- Go to Admin > Auto-Sync Setup
- Click "Sync Now" for any connected event
- This immediately checks for new photos

### Troubleshooting

**"OAuth not configured" error:**
- Check that all three secrets are set in Supabase Edge Functions

**"No refresh token received" error:**
- Make sure you're using `prompt=consent` in the OAuth URL (already configured)
- Try disconnecting and reconnecting

**Photos not syncing:**
- Verify the Google Drive folder ID is correct
- Check the event's "last_synced_at" timestamp
- Look at the sync interval setting
- Try a manual sync to see error messages

**"Redirect URI mismatch" error:**
- Verify the redirect URI in Google Console matches exactly: https://chazzgold.art/admin
- No trailing slashes, must be exact match
