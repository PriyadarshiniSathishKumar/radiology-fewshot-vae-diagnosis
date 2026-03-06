import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, Brain } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the main dashboard page
    navigate(createPageUrl('Dashboard'));
  }, [navigate]);

  // Display a loading indicator while redirecting
  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#f0f4f8] text-center">
      <div>
        <div className="relative w-24 h-24 mx-auto mb-6">
            <Brain className="absolute inset-0 w-full h-full text-teal-500/30 animate-pulse" />
            <Loader2 className="absolute inset-0 w-full h-full text-teal-600 animate-spin" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Loading RadiologyAI</h1>
        <p className="mt-2 text-slate-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}