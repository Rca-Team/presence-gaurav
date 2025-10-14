import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PageLayout from '@/components/layouts/PageLayout';
import { Webcam } from '@/components/ui/webcam';
import { AboutMe } from '@/components/AboutMe';
import { cn } from '@/lib/utils';
import { BookOpen, CalendarCheck2, FileSpreadsheet, GraduationCap, PieChart, Smartphone, UserCheck } from 'lucide-react';
const Index = () => {
  return <PageLayout className="school-gradient-bg">
      {/* Hero Section */}
      <section className="py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6 animate-slide-in-left">
            <div className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/30 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 mr-2 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
              <span className="text-cyan-400">Introducing PRESENCE</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-balance">
              Attendance Made <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Simple</span> and <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Secure</span>
            </h1>
            
            <p className="text-base md:text-lg lg:text-xl text-slate-400 max-w-xl text-balance">
              Transform your school's attendance process with advanced facial recognition technology. Fast, accurate, and designed for modern education.
            </p>
            
            <div className="flex flex-wrap gap-3 md:gap-4 pt-2">
              <Link to="/register">
                <Button size="lg" className="rounded-full px-6 md:px-8 text-sm md:text-base bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white hover:opacity-90 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                  Get Started
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="rounded-full px-6 md:px-8 text-sm md:text-base border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                  Mark Attendance
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative mt-4 md:mt-0 animate-slide-in-right">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
            <Card className="backdrop-panel overflow-hidden relative z-10 border-cyan-500/20">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
              <Webcam className="w-full max-h-[400px] md:max-h-none" autoStart={false} overlayClassName="border-cyan-500/30" />
            </Card>
            
            {/* Decorative neon elements */}
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-cyan-500/20 rounded-full backdrop-blur-md z-0 animate-pulse"></div>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-purple-500/20 rounded-full backdrop-blur-md z-0 animate-pulse" style={{
            animationDelay: '1s'
          }}></div>
          </div>
        </div>
      </section>
      
      {/* About Me Section */}
      <section className="py-8 md:py-16">
        <AboutMe />
      </section>
      
      {/* Features Section */}
      <section className="py-12 md:py-24">
        <div className="text-center mb-10 md:mb-16 animate-slide-in-up">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">How It Works in Your School</h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-balance px-4 md:px-0">
            Our platform makes attendance tracking effortless with cutting-edge facial recognition technology specifically designed for educational environments.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0">
          {[{
          title: "Register Students",
          description: "Easily enroll students by capturing their facial data securely.",
          icon: <UserCheck className="h-6 w-6 text-[hsl(var(--school-blue))]" />,
          delay: "0ms",
          color: "from-[hsl(var(--school-blue))]/10 to-[hsl(var(--school-blue))]/5"
        }, {
          title: "Take Attendance",
          description: "One glance is all it takes to mark attendance in real-time.",
          icon: <CalendarCheck2 className="h-6 w-6 text-[hsl(var(--school-green))]" />,
          delay: "100ms",
          color: "from-[hsl(var(--school-green))]/10 to-[hsl(var(--school-green))]/5"
        }, {
          title: "Generate Reports",
          description: "Access comprehensive attendance reports and analytics instantly.",
          icon: <PieChart className="h-6 w-6 text-[hsl(var(--school-purple))]" />,
          delay: "200ms",
          color: "from-[hsl(var(--school-purple))]/10 to-[hsl(var(--school-purple))]/5"
        }].map((feature, index) => <Card key={index} className="p-5 md:p-6 hover-lift animate-slide-in-up school-card animate-float-shadow iso-card" style={{
          animationDelay: feature.delay
        }}>
              <div className={cn("h-12 w-12 rounded-lg bg-gradient-to-b flex items-center justify-center mb-4", feature.color)}>
                {feature.icon}
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground">{feature.description}</p>
            </Card>)}
        </div>
      </section>
      
      {/* Advanced Features Section */}
      <section className="py-12 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-0">
          <div className="text-center mb-10 md:mb-16 animate-slide-in-up">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Advanced School Features</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Explore the powerful capabilities that make Presence the leading solution for school attendance management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {[{
            title: "Secure Data Storage",
            description: "Student facial recognition data and attendance records are securely stored with enterprise-grade encryption.",
            icon: <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--school-blue))]" />,
            delay: "0ms",
            color: "from-[hsl(var(--school-blue))]/10 to-transparent"
          }, {
            title: "Comprehensive Reports",
            description: "Generate daily, weekly, and monthly attendance reports for classes, grades, or individual students.",
            icon: <FileSpreadsheet className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--school-green))]" />,
            delay: "100ms",
            color: "from-[hsl(var(--school-green))]/10 to-transparent"
          }, {
            title: "School-specific Features",
            description: "Customize attendance tracking for class periods, after-school activities, and special events.",
            icon: <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--school-yellow))]" />,
            delay: "200ms",
            color: "from-[hsl(var(--school-yellow))]/10 to-transparent"
          }, {
            title: "Mobile Access for Teachers",
            description: "Teachers can access attendance data from anywhere with our responsive interface optimized for both desktop and mobile.",
            icon: <Smartphone className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--school-purple))]" />,
            delay: "300ms",
            color: "from-[hsl(var(--school-purple))]/10 to-transparent"
          }].map((feature, index) => <Card key={index} className="p-5 md:p-6 hover-lift backdrop-panel animate-slide-in-up school-card overflow-hidden iso-card" style={{
            animationDelay: feature.delay
          }}>
                <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center mb-4 relative", "before:absolute before:inset-0 before:bg-gradient-to-br", feature.color)}>
                  {feature.icon}
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground">{feature.description}</p>
                
                {/* Decorative school element */}
                <div className="absolute bottom-0 right-0 w-24 h-24 rounded-tl-[100px] bg-gradient-to-tl opacity-5"></div>
              </Card>)}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 md:py-24 px-4 md:px-0">
        <div className="backdrop-panel p-6 md:p-12 rounded-3xl animate-fade-in animate-float-shadow school-card">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 animate-smooth-enter">Ready to transform your school's attendance system?</h2>
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 animate-smooth-enter" style={{
            animationDelay: '100ms'
          }}>
              Join hundreds of schools that trust Presence for reliable, secure attendance tracking.
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 animate-smooth-enter" style={{
            animationDelay: '200ms'
          }}>
              <Link to="/register">
                <Button size="lg" className="rounded-full px-6 md:px-8 text-sm md:text-base bg-[hsl(var(--school-blue))] hover:bg-[hsl(var(--school-blue))]/90 animate-subtle-pulse">
                  Get Started
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="rounded-full px-6 md:px-8 text-sm md:text-base border-[hsl(var(--school-blue))] text-[hsl(var(--school-blue))] iso-button">
                  Contact Us
                </Button>
              </Link>
            </div>
            
            {/* School decoration elements */}
            <div className="flex justify-center mt-8 space-x-8 opacity-70">
              <GraduationCap className="h-6 w-6 text-[hsl(var(--school-blue))] animate-float" />
              <BookOpen className="h-6 w-6 text-[hsl(var(--school-green))] animate-float" style={{
              animationDelay: '0.5s'
            }} />
              <CalendarCheck2 className="h-6 w-6 text-[hsl(var(--school-yellow))] animate-float" style={{
              animationDelay: '1s'
            }} />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>;
};
export default Index;