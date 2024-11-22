import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const SUPABASE_URL = 'https://bdkcdyxshdaxpezlhlne.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJka2NkeXhzaGRheHBlemxobG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5Mjc5NzksImV4cCI6MjA0NjUwMzk3OX0.VB8mZOjzeH-gZv4OKZj9n21HtPPkfkEB8PoTmisIrHM';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
