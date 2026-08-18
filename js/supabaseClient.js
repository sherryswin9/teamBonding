// Supabase project connection.
// The key below is the "anon / publishable" key — safe to expose in
// client-side code by design (Supabase enforces access via RLS policies,
// see sql/schema.sql). Never put the "service_role" secret key here.
const SUPABASE_URL = 'https://rbluwyfnwxxrcrttalfx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2b3AwPccr_2pdDOmP-ONEw_LESBt1DC';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
