import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare, Send, Users } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface BulkNotificationServiceProps {
  availableFaces: { id: string; name: string; employee_id: string }[];
}

const BulkNotificationService: React.FC<BulkNotificationServiceProps> = ({ availableFaces }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [notificationType, setNotificationType] = useState<'email' | 'sms' | 'both'>('both');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const getDefaultMessage = () => {
    return `Dear Parent/Guardian,

This is a general notification from the school administration.

Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Please contact the school if you have any questions.

Best regards,
School Administration`;
  };

  const getDefaultSubject = () => {
    return `School Notification - ${new Date().toLocaleDateString()}`;
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedStudents(availableFaces.map(face => face.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleStudentToggle = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
      setSelectAll(false);
    }
  };

  const sendBulkNotification = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "No Students Selected",
        description: "Please select at least one student to send notifications.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const notificationPromises = selectedStudents.map(async (studentId) => {
        try {
          const selectedFace = availableFaces.find(face => face.id === studentId);
          
          // Mock parent info for demo - in production this would come from database
          const parentInfo = {
            parent_email: `parent.${selectedFace?.name?.toLowerCase().replace(' ', '.')}@example.com`,
            parent_phone: '+1234567890',
            parent_name: `Parent of ${selectedFace?.name}`
          };

          // Call Supabase Edge Function for notifications
          const { data, error } = await supabase.functions.invoke('send-notification', {
            body: {
              type: notificationType,
              recipient: {
                email: parentInfo.parent_email,
                phone: parentInfo.parent_phone,
                name: parentInfo.parent_name
              },
              message: {
                subject: subject || getDefaultSubject(),
                body: message || getDefaultMessage()
              },
              student: {
                id: studentId,
                name: selectedFace?.name,
                status: 'notification'
              }
            }
          });

          if (error) throw error;
          successCount++;
        } catch (error) {
          console.error(`Error sending notification to student ${studentId}:`, error);
          errorCount++;
        }
      });

      await Promise.all(notificationPromises);

      toast({
        title: "Bulk Notification Complete",
        description: `Successfully sent ${successCount} notifications. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
        variant: errorCount > 0 ? "destructive" : "default",
      });
      
      setOpen(false);
      setMessage('');
      setSubject('');
      setSelectedStudents([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      toast({
        title: "Bulk Notification Failed",
        description: "Failed to send bulk notifications. Please try again.",
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
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Bulk Notify
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Bulk Parent Notifications</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Notification Type</Label>
            <Select value={notificationType} onValueChange={(value: 'email' | 'sms' | 'both') => setNotificationType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Only
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    SMS Only
                  </div>
                </SelectItem>
                <SelectItem value="both">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Both Email & SMS
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(notificationType === 'email' || notificationType === 'both') && (
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              rows={6}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Students</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm">Select All ({availableFaces.length})</Label>
              </div>
            </div>
            
            <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
              {availableFaces.map((face) => (
                <div key={face.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={face.id}
                    checked={selectedStudents.includes(face.id)}
                    onCheckedChange={(checked) => handleStudentToggle(face.id, checked as boolean)}
                  />
                  <Label htmlFor={face.id} className="text-sm flex-1">
                    {face.name} (ID: {face.employee_id})
                  </Label>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {selectedStudents.length} of {availableFaces.length} students selected
            </p>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendBulkNotification} disabled={isLoading || selectedStudents.length === 0}>
              {isLoading ? "Sending..." : `Send to ${selectedStudents.length} Students`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkNotificationService;