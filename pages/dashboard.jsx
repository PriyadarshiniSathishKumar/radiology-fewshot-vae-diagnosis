import React, { useState, useEffect } from "react";
import { Dataset, Project } from "@/entities/all";
import { motion } from "framer-motion";
import StatsGrid from "../components/dashboard/StatsGrid";
import RecentActivity from "../components/dashboard/RecentActivity";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [datasets, setDatasets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [datasetsData, projectsData] = await Promise.all([
        Dataset.list("-created_date"),
        Project.list("-created_date")
      ]);
      setDatasets(datasetsData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeTrainingCount = projects.filter(p => typeof p.status === 'string' && p.status.includes('training')).length;

  return (
    <div className="p-6 md:p-8 space-y-8 relative">
      <div className="max-w-7xl mx-auto z-10 relative">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome to RadiologyAI
          </h1>
          <p className="text-slate-600 text-lg">
            Advanced Few-Shot Learning for Medical Image Diagnosis
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <StatsGrid 
            datasets={datasets}
            projects={projects}
            activeTraining={activeTrainingCount}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <RecentActivity 
              datasets={datasets}
              projects={projects}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <QuickActions />
          </motion.div>
        </div>

        {/* Welcome Message for Empty State */}
        {!loading && datasets.length === 0 && projects.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">AI</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Let's Get Started
              </h2>
              <p className="text-slate-600 mb-8">
                Upload your first medical imaging dataset to begin training AI models with few-shot learning techniques.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}