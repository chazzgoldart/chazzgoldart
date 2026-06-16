# Deployment Guide for Netlify

## Step 1: Connect Your GitHub Repository to Netlify

1. Go to [Netlify](https://app.netlify.com/) and sign in (or create a free account)
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Authorize Netlify to access your GitHub account
5. Select your repository from the list
6. Netlify will auto-detect your build settings (they're configured in `netlify.toml`)

## Step 2: Configure Environment Variables

Before deploying, add your Supabase environment variables:

1. In your Netlify site dashboard, go to "Site configuration" → "Environment variables"
2. Add the following variables:
   - `VITE_SUPABASE_URL` = `https://lspkvjygoanyfwtxnows.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcGt2anlnb2FueWZ3dHhub3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTcxNDksImV4cCI6MjA3NTY3MzE0OX0.vYK6pIWzCjXyXcapoCu6yz75uB1gtwxCrlhGiOLdMkQ`

## Step 3: Deploy

1. Click "Deploy site"
2. Netlify will build and deploy your site (takes 2-3 minutes)
3. You'll get a temporary URL like `random-name-123.netlify.app`

## Step 4: Add Your Custom Domain (chazzgold.art)

1. In your Netlify site dashboard, go to "Domain management"
2. Click "Add a domain"
3. Enter `chazzgold.art`
4. Netlify will provide DNS records to add

### DNS Configuration at Your Domain Registrar:

Add these records where you manage chazzgold.art (likely at grt.art):

**For root domain (chazzgold.art):**
- Type: `A`
- Name: `@` or leave blank
- Value: `75.2.60.5` (Netlify's load balancer)

**Alternative (CNAME method):**
- Type: `CNAME`
- Name: `@` or `www`
- Value: `your-site-name.netlify.app`

## Step 5: Add Subdomain for Events (events.chazzgold.art)

1. In Netlify "Domain management", click "Add domain alias"
2. Enter `events.chazzgold.art`
3. Add this DNS record at your domain registrar:
   - Type: `CNAME`
   - Name: `events`
   - Value: `your-site-name.netlify.app`

The subdomain routing is already built into your app - it will automatically show event galleries when someone visits events.chazzgold.art!

## Step 6: Enable HTTPS

Netlify automatically provisions free SSL certificates via Let's Encrypt. This happens automatically after your domain is verified (usually within a few minutes).

## That's It!

Your site will be live at:
- `chazzgold.art` (main site)
- `events.chazzgold.art` (events subdomain)

Every time you push changes to your GitHub repository, Netlify will automatically rebuild and deploy your site.
