import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
const twilioFromNumber = Deno.env.get('TWILIO_FROM_NUMBER');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, recipient, message, student } = await req.json()

    // Email notification logic with Resend
    if (type === 'email' || type === 'both') {
      if (recipient.email) {
        try {
          const emailResponse = await resend.emails.send({
            from: 'School Attendance <noreply@resend.dev>',
            to: [recipient.email],
            subject: message.subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">School Attendance Notification</h2>
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  ${message.body.replace(/\n/g, '<br>')}
                </div>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">
                  This is an automated message from the school attendance system. 
                  Please do not reply to this email.
                </p>
              </div>
            `,
          });

          console.log('Email sent successfully via Resend:', emailResponse);
        } catch (emailError) {
          console.error('Failed to send email via Resend:', emailError);
          throw new Error(`Email sending failed: ${emailError.message}`);
        }
      }
    }

    // SMS notification logic with Twilio
    if (type === 'sms' || type === 'both') {
      if (recipient.phone) {
        try {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
          const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
          
          const response = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${twilioAuth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: twilioFromNumber || '+1234567890',
              To: recipient.phone,
              Body: `School Alert: ${message.body}`,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Twilio error: ${errorData.message}`);
          }

          const smsResponse = await response.json();
          console.log('SMS sent successfully via Twilio:', smsResponse);
        } catch (smsError) {
          console.error('Failed to send SMS via Twilio:', smsError);
          throw new Error(`SMS sending failed: ${smsError.message}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${type} notification sent successfully` 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error sending notification:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send notification',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})