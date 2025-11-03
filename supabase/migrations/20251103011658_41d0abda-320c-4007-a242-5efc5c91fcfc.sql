-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop the extension from public schema
DROP EXTENSION IF EXISTS pg_net CASCADE;

-- Create the extension in the extensions schema
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;