import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const SUPABASE_URL = 'https://jspaqzezkogsbpxcqqfg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcGFxemV6a29nc2JweGNxcWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNTY5MDUsImV4cCI6MjA0NzgzMjkwNX0.T_HhP6JEpNpDWYh9Kjk6c22s6znK-K5eluSjUQX1YWI';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
