import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

console.log('Send notification function started');

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
const twilioFromNumber = Deno.env.get('TWILIO_FROM_NUMBER');

console.log('Configuration check:', {
  hasResendKey: !!Deno.env.get('RESEND_API_KEY'),
  hasTwilioSid: !!twilioAccountSid,
  hasTwilioToken: !!twilioAuthToken,
  hasTwilioNumber: !!twilioFromNumber
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Received request:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json();
    console.log('Request body received:', JSON.stringify(requestBody, null, 2));
    
    const { type, recipient, message, student } = requestBody;

    // Validate required fields
    if (!type || !recipient || !message) {
      console.error('Missing required fields:', { type, recipient: !!recipient, message: !!message });
      throw new Error('Missing required fields: type, recipient, and message are required');
    }

    let emailSuccess = false;
    let smsSuccess = false;
    const results = [];

    // Email notification logic with Resend
    if (type === 'email' || type === 'both') {
      if (!recipient.email) {
        console.log('Email type requested but no email provided');
        throw new Error('Email address is required for email notifications');
      }
      
      if (!Deno.env.get('RESEND_API_KEY')) {
        console.error('RESEND_API_KEY not configured');
        throw new Error('Email service not configured');
      }

      try {
        console.log('Sending email to:', recipient.email);
        const emailResponse = await resend.emails.send({
          from: 'School Attendance <noreply@resend.dev>',
          to: [recipient.email],
          subject: message.subject || 'School Notification',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">School Attendance Notification</h2>
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                ${(message.body || '').replace(/\n/g, '<br>')}
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
        emailSuccess = true;
        results.push('Email sent successfully');
      } catch (emailError) {
        console.error('Failed to send email via Resend:', emailError);
        throw new Error(`Email sending failed: ${emailError.message}`);
      }
    }

    // SMS notification logic with Twilio
    if (type === 'sms' || type === 'both') {
      if (!recipient.phone) {
        console.log('SMS type requested but no phone provided');
        throw new Error('Phone number is required for SMS notifications');
      }
      
      if (!twilioAccountSid || !twilioAuthToken) {
        console.error('Twilio credentials not configured');
        throw new Error('SMS service not configured');
      }

      try {
        console.log('Sending SMS to:', recipient.phone);
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
            Body: `School Alert: ${message.body || 'Notification from school'}`,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Twilio API error:', response.status, errorText);
          throw new Error(`Twilio API error: ${response.status} - ${errorText}`);
        }

        const smsResponse = await response.json();
        console.log('SMS sent successfully via Twilio:', smsResponse);
        smsSuccess = true;
        results.push('SMS sent successfully');
      } catch (smsError) {
        console.error('Failed to send SMS via Twilio:', smsError);
        throw new Error(`SMS sending failed: ${smsError.message}`);
      }
    }

    const successMessage = results.join(' and ');
    console.log('Notification completed successfully:', successMessage);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: successMessage,
        details: {
          emailSent: emailSuccess,
          smsSent: smsSuccess
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error sending notification:', error);
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