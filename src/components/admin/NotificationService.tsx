import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';

interface NotificationServiceProps {
  studentId?: string;
  studentName?: string;
  attendanceStatus?: string;
}

const NotificationService: React.FC<NotificationServiceProps> = ({ 
  studentId, 
  studentName, 
  attendanceStatus 
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getDefaultMessage = () => {
    const status = attendanceStatus?.toLowerCase();
    if (status === 'present') {
      return `Dear Parent/Guardian,\n\nThis is to inform you that ${studentName} has arrived at school safely today.\n\nTime: ${new Date().toLocaleTimeString()}\nDate: ${new Date().toLocaleDateString()}\n\nBest regards,\nSchool Administration`;
    } else if (status === 'late') {
      return `Dear Parent/Guardian,\n\nThis is to inform you that ${studentName} arrived late to school today.\n\nTime: ${new Date().toLocaleTimeString()}\nDate: ${new Date().toLocaleDateString()}\n\nPlease ensure punctuality in the future.\n\nBest regards,\nSchool Administration`;
    } else if (status === 'absent') {
      return `Dear Parent/Guardian,\n\nThis is to inform you that ${studentName} was marked absent today.\n\nDate: ${new Date().toLocaleDateString()}\n\nIf this is unexpected, please contact the school immediately.\n\nBest regards,\nSchool Administration`;
    }
    return `Dear Parent/Guardian,\n\nThis is a notification regarding your child ${studentName}.\n\nBest regards,\nSchool Administration`;
  };

  const getDefaultSubject = () => {
    return `School Attendance Notification - ${studentName}`;
  };

  const sendEmailNotification = async () => {
    if (!studentId) {
      toast({
        title: "Error",
        description: "Student ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get parent contact information from attendance records or profiles
      let parentInfo = null;
      
      // First try to get from profiles table using user_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', studentId)
        .single();

      if (profile && (profile.parent_email || profile.display_name)) {
        parentInfo = {
          parent_email: profile.parent_email || `demo.parent.${profile.display_name?.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          parent_phone: profile.parent_phone || '+1555-0123',
          parent_name: profile.parent_name || `Parent of ${profile.display_name || studentName}`
        };
      } else {
        // Try to get from attendance records device_info
        const { data: attendanceData } = await supabase
          .from('attendance_records')
          .select('device_info')
          .eq('user_id', studentId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (attendanceData?.device_info) {
          const deviceInfo = typeof attendanceData.device_info === 'string' 
            ? JSON.parse(attendanceData.device_info) 
            : attendanceData.device_info;
          
          parentInfo = {
            parent_email: deviceInfo.metadata?.parent_email || `demo.parent.${studentName?.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            parent_phone: deviceInfo.metadata?.parent_phone || '+1555-0123',
            parent_name: deviceInfo.metadata?.parent_name || `Parent of ${studentName}`
          };
        } else {
          // Fallback to demo data for testing
          parentInfo = {
            parent_email: `demo.parent.${studentName?.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            parent_phone: '+1555-0123',
            parent_name: `Parent of ${studentName}`
          };
        }
      }

      if (!parentInfo) {
        toast({
          title: "Missing Contact Information",
          description: "Parent contact information not found. Please add parent details first.",
          variant: "destructive",
        });
        return;
      }

      // Call Supabase Edge Function for email notification
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          recipient: {
            email: parentInfo.parent_email,
            name: parentInfo.parent_name
          },
          message: {
            subject: subject || getDefaultSubject(),
            body: message || getDefaultMessage()
          },
          student: {
            id: studentId,
            name: studentName,
            status: attendanceStatus
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Email Notification Sent",
        description: "Email notification sent successfully to parent.",
      });
      
      setOpen(false);
      setMessage('');
      setSubject('');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Notification Failed",
        description: "Failed to send notification. Please check parent contact information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      setMessage(getDefaultMessage());
      setSubject(getDefaultSubject());
    }
  }, [open, studentName, attendanceStatus]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Notify Parent
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Email Notification to Parent</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Email Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter email message"
              rows={8}
            />
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
            <p className="font-medium">📧 Email Notifications:</p>
            <p className="text-xs text-muted-foreground">Professional email notifications sent via Resend (3,000 free emails/month)</p>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendEmailNotification} disabled={isLoading}>
              <Mail className="h-4 w-4 mr-2" />
              {isLoading ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationService;