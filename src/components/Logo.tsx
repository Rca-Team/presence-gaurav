
import React from 'react';
import { cn } from '@/lib/utils';
import { GraduationCap, BookOpen, Award } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={cn("font-semibold tracking-tight flex items-center gap-2", sizeClasses[size], className)}>
      <div className="relative w-12 h-12 rounded-lg overflow-hidden group">
        {/* Neon glow background matching splash animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-lg blur-xl animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        
        {/* Animated shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer bg-[length:200%_100%]"></div>
        
        {/* School icons that rotate */}
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-500">
          <GraduationCap className="w-6 h-6 text-cyan-400 animate-float z-10 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 opacity-0 group-hover:opacity-100">
          <BookOpen className="w-6 h-6 text-blue-400 animate-float z-10 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100">
          <Award className="w-6 h-6 text-purple-400 animate-float z-10 drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 animate-shimmer bg-[length:200%_100%] font-bold">PRESENCE</span>
        <span className="text-xs text-slate-400 mt-[-3px]">Smart Attendance</span>
      </div>
    </div>
  );
};

export default Logo;
