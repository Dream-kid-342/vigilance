// keep-alive/index.ts
// Simple Edge Function that keeps the Supabase project alive.
// Called by a pg_cron job twice a week.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (_req: Request) => {
  const timestamp = new Date().toISOString();

  console.log(`[keep-alive] Heartbeat ping received at ${timestamp}`);

  return new Response(
    JSON.stringify({
      status: "alive",
      message: "Vigilance service is running",
      timestamp,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
});
