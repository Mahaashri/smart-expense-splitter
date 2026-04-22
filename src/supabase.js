import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nqurhckkyjzstvkmxryy.supabase.co';      // paste your URL here
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xdXJoY2treWp6c3R2a214cnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODEwNjAsImV4cCI6MjA5MjM1NzA2MH0.HomDghz9_Xs5GraT5BGixLSNSrGLWVVReWdnk2IrLLs';         // paste your anon key here

export const supabase = createClient(supabaseUrl, supabaseKey);