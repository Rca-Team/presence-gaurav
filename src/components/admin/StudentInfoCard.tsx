
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaceInfo } from './utils/attendanceUtils';
import NotificationService from './NotificationService';
import { User } from 'lucide-react';

interface StudentInfoCardProps {
  selectedFace: FaceInfo | null;
  attendanceDays: Date[];
  lateAttendanceDays: Date[];
}

const StudentInfoCard: React.FC<StudentInfoCardProps> = ({ 
  selectedFace, 
  attendanceDays, 
  lateAttendanceDays 
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <img 
            src={selectedFace?.image_url && selectedFace.image_url.startsWith('data:') 
              ? selectedFace.image_url 
              : selectedFace?.image_url
                ? `https://tegpyalokurixuvgeuks.supabase.co/storage/v1/object/public/face-images/${selectedFace.image_url}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedFace?.name || 'Student')}&background=random&size=64`
            } 
            alt={selectedFace?.name || 'Student'} 
            className="h-16 w-16 rounded-full object-cover border-2 border-border"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedFace?.name || 'Student')}&background=random&size=64`;
            }}
          />
          <CardTitle>{selectedFace?.name || 'Student'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-sm text-muted-foreground">ID:</span>
              <p>{selectedFace?.employee_id || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Department:</span>
              <p>{selectedFace?.department || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Position:</span>
              <p>{selectedFace?.position || 'Student'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Total Attendance:</span>
              <p>{attendanceDays.length + lateAttendanceDays.length} days</p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <NotificationService 
              studentId={selectedFace?.user_id}
              studentName={selectedFace?.name}
              attendanceStatus="present"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentInfoCard;
