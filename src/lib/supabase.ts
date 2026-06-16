import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lspkvjygoanyfwtxnows.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcGt2anlnb2FueWZ3dHhub3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTcxNDksImV4cCI6MjA3NTY3MzE0OX0.vYK6pIWzCjXyXcapoCu6yz75uB1gtwxCrlhGiOLdMkQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
