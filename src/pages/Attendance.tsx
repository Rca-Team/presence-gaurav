import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { PageHeader } from '@/components/ui/page-header';
import PageLayout from '@/components/layouts/PageLayout';
import AttendanceCapture from '@/components/attendance/AttendanceCapture';
import AttendanceInstructions from '@/components/attendance/AttendanceInstructions';
import AttendanceSidebar from '@/components/attendance/AttendanceSidebar';
import AttendanceToday from '@/components/attendance/AttendanceToday';
import AttendanceStats from '@/components/attendance/AttendanceStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, BarChart3, Info } from 'lucide-react';

const Attendance = () => {
  const [activeTab, setActiveTab] = useState('single');
  
  return (
    <PageLayout className="school-gradient-bg">
      <PageHeader 
        title="Face Recognition Attendance" 
        description="Advanced facial recognition system with MediaPipe detection and InsightFace ArcFace recognition"
        className="animate-slide-in-down"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-1 p-1">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span>Attendance</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Statistics</span>
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>Help</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <AttendanceCapture />
            </div>
            <div className="space-y-6">
              <AttendanceSidebar />
              <AttendanceToday />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AttendanceStats />
            </div>
            <div className="space-y-6">
              <AttendanceToday />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="help" className="space-y-6">
          <AttendanceInstructions />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Attendance;
