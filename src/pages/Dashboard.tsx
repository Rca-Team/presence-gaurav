
import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageLayout from '@/components/layouts/PageLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Layout, BarChart3 } from 'lucide-react';

// Import refactored components
import StatsOverview from '@/components/dashboard/StatsOverview';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import RecentActivity from '@/components/dashboard/RecentActivity';
import StatusChart from '@/components/dashboard/StatusChart';
import RegisteredFaces from '@/components/dashboard/RegisteredFaces';
import CutoffTimeDisplay from '@/components/dashboard/CutoffTimeDisplay';

// Import services
import { 
  fetchAttendanceStats, 
  fetchRegisteredFaces 
} from '@/services/dashboard/dashboardService';

const Dashboard = () => {
  // Fetch attendance data using react-query
  const { 
    data, 
    isLoading, 
    error,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchAttendanceStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Create a memoized refetch function
  const refetchDashboard = useCallback(() => {
    refetchStats();
    refetchFaces();
  }, [refetchStats]);
  
  // Fetch registered faces
  const { 
    data: registeredFaces, 
    isLoading: facesLoading, 
    error: facesError,
    refetch: refetchFaces
  } = useQuery({
    queryKey: ['registeredFaces'],
    queryFn: fetchRegisteredFaces,
    refetchInterval: 30000, // Updated to 30 seconds for efficient polling
  });
  
  // Check for error state
  if (error) {
    console.error('Error fetching dashboard data:', error);
  }
  
  if (facesError) {
    console.error('Error fetching registered faces:', facesError);
  }
  
  return (
    <PageLayout className="school-gradient-bg">
      <PageHeader
        title="School Dashboard"
        description="Real-time overview of your school attendance statistics and analytics"
        className="animate-slide-in-down"
        icon={<Layout className="h-8 w-8 text-[hsl(var(--school-blue))]" />}
      >
        <Link to="/attendance">
          <Button className="bg-[hsl(var(--school-green))] hover:bg-[hsl(var(--school-green))]/90">
            <BarChart3 className="h-4 w-4 mr-2" />
            Take Attendance
          </Button>
        </Link>
      </PageHeader>
      
      {/* School-themed decorative element */}
      <div className="flex justify-center gap-5 opacity-80 my-6">
        <div className="h-1 w-16 rounded-full bg-[hsl(var(--school-blue))]"></div>
        <div className="h-1 w-16 rounded-full bg-[hsl(var(--school-green))]"></div>
        <div className="h-1 w-16 rounded-full bg-[hsl(var(--school-yellow))]"></div>
      </div>
      
      {/* Cutoff Time Display */}
      <div className="mb-6">
        <CutoffTimeDisplay />
      </div>

      {/* Stats Overview */}
      <StatsOverview isLoading={isLoading} data={data} refetch={refetchDashboard} />
      
      {/* Charts */}
      <DashboardCharts 
        isLoading={isLoading} 
        weeklyData={data?.weeklyData} 
        departmentData={data?.departmentData} 
      />
      
      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <RecentActivity 
          isLoading={isLoading} 
          activityData={data?.recentActivity} 
        />
        
        <StatusChart 
          isLoading={isLoading} 
          statusData={data?.statusData} 
        />
      </div>
      
      {/* Registered Faces Section */}
      <RegisteredFaces 
        isLoading={facesLoading} 
        faces={registeredFaces} 
        refetchFaces={refetchFaces} 
      />
    </PageLayout>
  );
};

export default Dashboard;
