import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  studentId?: string;
  phoneNumber?: string;
  message: string;
  studentName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentId, phoneNumber, message, studentName }: SMSRequest = await req.json();
    
    console.log("SMS Request received:", { studentId, phoneNumber, studentName });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let recipientPhone = phoneNumber;

    // If phone not provided but studentId is, fetch from database
    if (!recipientPhone && studentId) {
      // First try to get phone from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("parent_phone")
        .eq("user_id", studentId)
        .single();

      if (profile?.parent_phone) {
        recipientPhone = profile.parent_phone;
      } else {
        // Try to get from attendance_records
        const { data: attendance } = await supabase
          .from("attendance_records")
          .select("device_info")
          .eq("user_id", studentId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (attendance?.device_info) {
          const deviceInfo = JSON.parse(attendance.device_info);
          recipientPhone = deviceInfo.phone_number;
        }
      }
    }

    if (!recipientPhone) {
      console.error("No phone number found for student");
      return new Response(
        JSON.stringify({ error: "No phone number found for this student" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Clean phone number (remove +91 if present, Fast2SMS adds it automatically)
    const cleanPhone = recipientPhone.replace(/^\+91/, "").replace(/\s+/g, "");
    
    // Validate Indian phone number (10 digits)
    if (!/^\d{10}$/.test(cleanPhone)) {
      console.error("Invalid phone number format:", cleanPhone);
      return new Response(
        JSON.stringify({ error: "Invalid phone number format. Must be 10 digits for Indian numbers." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending SMS to:", cleanPhone);

    // Send SMS using Fast2SMS API
    const fast2smsApiKey = Deno.env.get("FAST2SMS_API_KEY");
    
    if (!fast2smsApiKey) {
      console.error("Fast2SMS API key not configured");
      return new Response(
        JSON.stringify({ error: "SMS service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const fast2smsUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsApiKey}&route=q&message=${encodeURIComponent(message)}&language=english&flash=0&numbers=${cleanPhone}`;

    const smsResponse = await fetch(fast2smsUrl, {
      method: "GET",
    });

    const smsData = await smsResponse.json();
    
    console.log("Fast2SMS Response:", smsData);

    if (!smsData.return || smsData.return === false) {
      console.error("Fast2SMS API Error:", smsData);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send SMS", 
          details: smsData.message || "Unknown error" 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "SMS sent successfully",
        phone: cleanPhone,
        response: smsData 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-sms function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
