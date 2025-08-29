
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { PageHeader } from '@/components/ui/page-header';
import PageLayout from '@/components/layouts/PageLayout';
import { loadOptimizedModels } from '@/services/face-recognition/OptimizedModelService';
import AttendanceCapture from '@/components/attendance/AttendanceCapture';
import MultipleAttendanceCapture from '@/components/attendance/MultipleAttendanceCapture';
import AttendanceInstructions from '@/components/attendance/AttendanceInstructions';
import AttendanceSidebar from '@/components/attendance/AttendanceSidebar';
import AttendanceResult from '@/components/attendance/AttendanceResult';
import AttendanceToday from '@/components/attendance/AttendanceToday';
import AttendanceStats from '@/components/attendance/AttendanceStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Users, BarChart3, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Attendance = () => {
  const [activeTab, setActiveTab] = useState('single');
  const { toast } = useToast();
  
  useEffect(() => {
    const initModels = async () => {
      try {
        await loadOptimizedModels();
      } catch (err) {
        console.error('Error loading face recognition models:', err);
        toast({
          title: "Model Loading Error",
          description: "Failed to load face recognition models. Please try again later.",
          variant: "destructive",
        });
      }
    };
    
    initModels();
  }, [toast]);
  
  return (
    <PageLayout className="school-gradient-bg">
      <PageHeader 
        title="Face Recognition Attendance" 
        description="Advanced facial recognition system with multiple face detection and optimized performance"
        className="animate-slide-in-down"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Single Face
          </TabsTrigger>
          <TabsTrigger value="multiple" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Multiple Faces
            <Badge variant="secondary" className="text-xs">New</Badge>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Help
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <AttendanceCapture />
              {/* <AttendanceResult /> */}
            </div>
            <div className="space-y-6">
              <AttendanceSidebar />
              <AttendanceToday />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="multiple" className="space-y-6">
          <MultipleAttendanceCapture />
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
