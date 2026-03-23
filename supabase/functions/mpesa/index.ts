import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.pathname.split('/').pop() // "stkpush" or "callback"

    // Set up Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // ==========================================
    // 🪝 WEBHOOK CALLBACK (/mpesa/callback)
    // ==========================================
    if (action === 'callback') {
      const body = await req.json()
      console.log('--- M-PESA CALLBACK RECEIVED ---')

      const stkCallback = body?.Body?.stkCallback;
      if (!stkCallback) return new Response('Invalid Request', { status: 400 })

      const { CheckoutRequestID, ResultCode, CallbackMetadata } = stkCallback;

      if (ResultCode === 0) {
        // Payment successful! 
        const receiptItem = CallbackMetadata?.Item?.find((item: any) => item.Name === 'MpesaReceiptNumber');
        const mpesaReceipt = receiptItem ? receiptItem.Value : 'UNKNOWN';

        const { error } = await supabase
          .from('jobs')
          .update({ status: 'completed', payment_receipt: mpesaReceipt })
          .eq('payment_request_id', CheckoutRequestID);

        if (error) console.error('Error updating DB:', error);
        else console.log(`✓ Job completed! Receipt: ${mpesaReceipt}`);
      }

      // Safaricom expects a success response immediately
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Success" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // ==========================================
    // 💸 INITIATE STK PUSH (/mpesa/stkpush)
    // ==========================================
    if (action === 'stkpush') {
      const { phone, amount, jobId, accountReference = 'Vigilance' } = await req.json()

      if (!phone || !amount || !jobId) {
        return new Response(JSON.stringify({ error: 'phone, amount, jobId required' }), { status: 400, headers: corsHeaders })
      }

      let formattedPhone = phone.trim();
      if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.slice(1);
      else if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.slice(1);

      const mpesaEnv = Deno.env.get('MPESA_ENVIRONMENT') || 'sandbox';
      const isProd = mpesaEnv === 'production';

      const BASE_URL        = isProd ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
      const CONSUMER_KEY    = isProd ? Deno.env.get('PROD_MPESA_CONSUMER_KEY')    : Deno.env.get('SANDBOX_MPESA_CONSUMER_KEY');
      const CONSUMER_SECRET = isProd ? Deno.env.get('PROD_MPESA_CONSUMER_SECRET') : Deno.env.get('SANDBOX_MPESA_CONSUMER_SECRET');
      const SHORTCODE       = isProd ? Deno.env.get('PROD_MPESA_SHORTCODE')       : Deno.env.get('SANDBOX_MPESA_SHORTCODE');
      const PASSKEY         = isProd ? Deno.env.get('PROD_MPESA_PASSKEY')         : Deno.env.get('SANDBOX_MPESA_PASSKEY');
      const CALLBACK_URL    = isProd ? Deno.env.get('PROD_MPESA_CALLBACK_URL')    : Deno.env.get('SANDBOX_MPESA_CALLBACK_URL');

      if (!CONSUMER_KEY || !CONSUMER_SECRET) {
        return new Response(JSON.stringify({ error: 'Server missing MPESA credentials in Edge Secrets' }), { status: 500, headers: corsHeaders })
      }

      // 1. Generate Auth Token
      const auth = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
      const tokenRes = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${auth}` }
      })
      if (!tokenRes.ok) throw new Error('Failed to generate M-Pesa OAuth token')
      const tokenData = await tokenRes.json()
      const token = tokenData.access_token

      // 2. Format Timestamp & Password
      const date = new Date()
      const timestamp = date.getFullYear() +
        ('0' + (date.getMonth() + 1)).slice(-2) +
        ('0' + date.getDate()).slice(-2) +
        ('0' + date.getHours()).slice(-2) +
        ('0' + date.getMinutes()).slice(-2) +
        ('0' + date.getSeconds()).slice(-2)

      const password = btoa(`${SHORTCODE}${PASSKEY}${timestamp}`)

      // 3. Fire STK Push
      const payload = {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(Number(amount)),
        PartyA: formattedPhone,
        PartyB: SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: CALLBACK_URL || `https://${Deno.env.get('SUPABASE_DB_URL')?.split('.')[0]}.supabase.co/functions/v1/mpesa/callback`,
        AccountReference: accountReference,
        TransactionDesc: `Payment for Vigilance Job`
      }

      const pushRes = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const pushData = await pushRes.json()

      if (pushData.ResponseCode === "0") {
        await supabase.from('jobs')
          .update({ payment_request_id: pushData.CheckoutRequestID })
          .eq('id', jobId)
      }

      return new Response(JSON.stringify(pushData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})
