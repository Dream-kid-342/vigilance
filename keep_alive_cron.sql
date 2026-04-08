-- =============================================================
-- keep_alive_cron.sql
-- Sets up a pg_cron job that pings the keep-alive Edge Function
-- twice a week (Monday & Thursday at 08:00 UTC) to prevent
-- the Supabase project from being suspended due to inactivity.
-- =============================================================

-- 1. Enable the pg_cron extension (run once per project).
-- If already enabled, this line is a no-op.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Grant usage on the cron schema to postgres role.
GRANT USAGE ON SCHEMA cron TO postgres;

-- 3. Schedule the keep-alive job.
--    Cron expression: "0 8 * * 1,4"
--      ┌── minute  (0)
--      │ ┌── hour   (8 = 08:00 UTC)
--      │ │ ┌── day of month (* = any)
--      │ │ │ ┌── month (* = any)
--      │ │ │ │ ┌── day of week (1=Monday, 4=Thursday)
--      0 8 * * 1,4
--
--    Replace <YOUR_PROJECT_REF> with your actual Supabase project ref
--    (found in Settings → General, e.g. "aybhwtpxkmjuheqiyidk").
--    Replace <YOUR_ANON_KEY> with your project's anon/public key.

SELECT cron.schedule(
  'keep-alive-twice-a-week',           -- job name (unique)
  '0 8 * * 1,4',                       -- every Monday & Thursday at 08:00 UTC
  $$
    SELECT
      net.http_get(
        url    := 'https://aybhwtpxkmjuheqiyidk.supabase.co/functions/v1/keep-alive',
        headers := jsonb_build_object(
          'Content-Type',  'application/json',
          'Authorization', 'Bearer ' || current_setting('app.anon_key', true)
        )
      )
    AS request_id;
  $$
);

-- 4. Store the anon key as a runtime setting so the cron job can read it.
--    Run this separately in the SQL editor (or add to your secrets):
--
--    ALTER DATABASE postgres SET "app.anon_key" = '<YOUR_ANON_KEY>';
--
--    After running it, reconnect / run: SELECT pg_reload_conf();

-- 5. Verify the job was created:
--    SELECT * FROM cron.job WHERE jobname = 'keep-alive-twice-a-week';

-- =============================================================
-- ALTERNATIVE: If pg_net is not available, use a plain SQL ping
-- instead of an HTTP call. Uncomment the block below and comment
-- out the SELECT above.
-- =============================================================
-- SELECT cron.schedule(
--   'keep-alive-twice-a-week',
--   '0 8 * * 1,4',
--   $$ SELECT 1; $$   -- lightweight no-op query to keep DB warm
-- );
