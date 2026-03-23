const url = 'https://aybhwtpxkmjuheqiyidk.supabase.co/functions/v1/mpesa/stkpush';
const anonKey = 'sb_publishable_FuqKzSfI63jNHmHCi3axWQ_blhBZSuU';

async function testMpesa() {
  console.log("Initiating test STK push to 0769976688 for KSh 1...");
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`
      },
      body: JSON.stringify({
        phone: '0769976688',
        amount: 1,
        // Using a random dummy UUID since it's just a test
        jobId: '123e4567-e89b-12d3-a456-426614174000', 
        accountReference: 'Vigilance-Test'
      })
    });
    
    const text = await res.text();
    console.log("HTTP Status:", res.status);
    console.log("Response Body:", text);
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

testMpesa();
