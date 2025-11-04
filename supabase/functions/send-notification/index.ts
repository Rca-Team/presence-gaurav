import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0"
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

console.log('Email notification function started');

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

console.log('Configuration check:', {
  hasResendKey: !!Deno.env.get('RESEND_API_KEY')
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const notificationSchema = z.object({
  recipient: z.object({
    email: z.string().email().max(255),
    name: z.string().max(100).optional()
  }),
  message: z.object({
    subject: z.string().min(1).max(200),
    body: z.string().min(1).max(5000)
  }),
  student: z.object({
    id: z.string().uuid(),
    name: z.string().max(100),
    status: z.enum(['present', 'late', 'absent'])
  }).optional()
});

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

serve(async (req) => {
  console.log('Received request:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! }
        }
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error('Authorization check failed:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('User authenticated and authorized:', user.id);
    
    const requestBody = await req.json();
    
    // Validate input
    const validationResult = notificationSchema.safeParse(requestBody);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error);
      return new Response(
        JSON.stringify({ error: "Invalid request data" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const { recipient, message, student } = validationResult.data;
    console.log("Notification request:", { recipient: recipient.email, hasStudent: !!student });
    
    if (!Deno.env.get('RESEND_API_KEY')) {
      console.error('RESEND_API_KEY not configured');
      throw new Error('Email service not configured');
    }

    try {
      console.log('Sending email to:', recipient.email);
      
      // Use verified domain for sending emails
      const fromAddress = 'School Attendance <presence@electronicgaurav.me>';
      
      const emailResponse = await resend.emails.send({
        from: fromAddress,
        to: [recipient.email],
        subject: message.subject || 'School Notification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 24px;">School Attendance System</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Notification</h2>
              <div style="color: #555; line-height: 1.6; font-size: 16px;">
                ${escapeHtml(message.body || '').replace(/\n/g, '<br>')}
              </div>
            </div>
            
            ${student ? `
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Student Information</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${escapeHtml(student.name)}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${student.status === 'present' ? '#28a745' : student.status === 'late' ? '#ffc107' : '#dc3545'}; font-weight: bold; text-transform: capitalize;">${escapeHtml(student.status)}</span></p>
              </div>
            ` : ''}
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 14px; text-align: center; margin: 0;">
              This is an automated message from the school attendance system.<br>
              Please do not reply to this email.
            </p>
          </div>
        `,
      });

      console.log('Email response:', emailResponse);
      
      // Check if there was an error in the response
      if (emailResponse.error) {
        console.error('Resend API error:', emailResponse.error);
        throw new Error(`Email service error: ${emailResponse.error.message || 'Unknown error'}`);
      }

      console.log('Email sent successfully');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email notification sent successfully',
          details: {
            emailSent: true,
            messageId: emailResponse.data?.id
          }
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
      
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      throw new Error(`Email sending failed: ${emailError.message}`);
    }

  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send notification. Please try again or contact support.',
        support_id: crypto.randomUUID()
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