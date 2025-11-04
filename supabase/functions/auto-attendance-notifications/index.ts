import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0"

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get cutoff time setting
    const { data: cutoffData } = await supabaseClient
      .from('attendance_settings')
      .select('value')
      .eq('key', 'cutoff_time')
      .single();

    if (!cutoffData) {
      throw new Error('Cutoff time not configured');
    }

    const cutoffTime = cutoffData.value;
    const today = new Date().toISOString().split('T')[0];

    // Get all registered users
    const { data: registeredUsers } = await supabaseClient
      .from('attendance_records')
      .select('user_id, device_info')
      .eq('status', 'registered');

    if (!registeredUsers || registeredUsers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No registered users found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get today's attendance records
    const { data: todayAttendance } = await supabaseClient
      .from('attendance_records')
      .select('user_id, status, timestamp')
      .gte('timestamp', `${today}T00:00:00`)
      .lte('timestamp', `${today}T23:59:59`);

    const notificationResults = [];

    for (const user of registeredUsers) {
      const userId = user.user_id;
      const deviceInfo = user.device_info as any;
      const studentName = deviceInfo?.metadata?.name || 'Student';

      // Find user's attendance record for today
      const userAttendance = todayAttendance?.find(a => a.user_id === userId);

      // Get parent contact info
      let profile = null;
      if (userId) {
        const { data } = await supabaseClient
          .from('profiles')
          .select('parent_email, parent_name')
          .eq('user_id', userId)
          .maybeSingle();
        profile = data;
      }

      if (!profile?.parent_email) {
        console.log(`No parent email for ${studentName}`);
        continue;
      }

      let emailSubject = '';
      let emailBody = '';
      let attendanceTime = '';

      if (!userAttendance) {
        // Absent - no record for today
        emailSubject = `Absence Alert - ${studentName}`;
        emailBody = `Dear ${profile.parent_name || 'Parent/Guardian'},\n\nThis is to inform you that ${studentName} was marked absent today.\n\nDate: ${new Date().toLocaleDateString()}\n\nIf this is unexpected, please contact the school immediately.\n\nBest regards,\nSchool Administration`;
      } else if (userAttendance.status === 'late') {
        // Late arrival
        attendanceTime = new Date(userAttendance.timestamp).toLocaleTimeString();
        emailSubject = `Late Arrival Notification - ${studentName}`;
        emailBody = `Dear ${profile.parent_name || 'Parent/Guardian'},\n\nThis is to inform you that ${studentName} arrived late to school today.\n\nTime: ${attendanceTime}\nDate: ${new Date().toLocaleDateString()}\n\nPlease ensure punctuality in the future.\n\nBest regards,\nSchool Administration`;
      } else if (userAttendance.status === 'present') {
        // Present - on time
        attendanceTime = new Date(userAttendance.timestamp).toLocaleTimeString();
        emailSubject = `Attendance Confirmation - ${studentName}`;
        emailBody = `Dear ${profile.parent_name || 'Parent/Guardian'},\n\nThis is to inform you that ${studentName} has arrived at school safely today.\n\nTime: ${attendanceTime}\nDate: ${new Date().toLocaleDateString()}\n\nBest regards,\nSchool Administration`;
      }

      if (emailBody) {
        try {
          const emailResponse = await resend.emails.send({
            from: 'School Attendance <presence@electronicgaurav.me>',
            to: [profile.parent_email],
            subject: emailSubject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">School Attendance System</h1>
                </div>
                
                <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid ${userAttendance?.status === 'present' ? '#28a745' : userAttendance?.status === 'late' ? '#ffc107' : '#dc3545'}; margin: 20px 0;">
                  <h2 style="color: #333; margin-top: 0;">Daily Attendance Report</h2>
                  <div style="color: #555; line-height: 1.6; font-size: 16px;">
                    ${emailBody.replace(/\n/g, '<br>')}
                  </div>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">Student Information</h3>
                  <p style="margin: 5px 0;"><strong>Name:</strong> ${studentName}</p>
                  <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${userAttendance?.status === 'present' ? '#28a745' : userAttendance?.status === 'late' ? '#ffc107' : '#dc3545'}; font-weight: bold; text-transform: capitalize;">${userAttendance?.status || 'Absent'}</span></p>
                  ${attendanceTime ? `<p style="margin: 5px 0;"><strong>Time:</strong> ${attendanceTime}</p>` : ''}
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #666; font-size: 14px; text-align: center; margin: 0;">
                  This is an automated daily attendance notification.<br>
                  Please do not reply to this email.
                </p>
              </div>
            `,
          });

          notificationResults.push({
            student: studentName,
            status: userAttendance?.status || 'absent',
            emailSent: !emailResponse.error,
            error: emailResponse.error?.message
          });

        } catch (error) {
          console.error(`Failed to send email for ${studentName}:`, error);
          notificationResults.push({
            student: studentName,
            status: userAttendance?.status || 'absent',
            emailSent: false,
            error: error.message
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Automatic notifications processed',
        results: notificationResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in auto-notifications:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process automatic notifications',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})