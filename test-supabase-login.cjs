// test-supabase-login.cjs
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://testproject.supabase.co'; // Replace with your actual Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxamJmZGN5ZW5wenJ2amFzcm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwODU3ODEsImV4cCI6MjA5MTY2MTc4MX0.0GLFL5P5pyjKUQhZ_lCAOQNfdisShszsFenCMJnUBI0';

const email = 'meetpardeshi4@gmail.com';
const password = 'Meet@2807';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Login failed:', error.message);
  } else {
    console.log('Login successful:', data.user.email);
  }
})();
