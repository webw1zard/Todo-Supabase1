import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jyighudlgmskjajoquce.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5aWdodWRsZ21za2pham9xdWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MDY5NDEsImV4cCI6MjA1MzM4Mjk0MX0.MX9NDGh7taEIiIihoAgQS5MMDwwd8Q8cMjqX5qo0inc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
