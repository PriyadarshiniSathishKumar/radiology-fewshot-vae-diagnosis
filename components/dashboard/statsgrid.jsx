import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Database, Brain, BarChart3, Zap } from "lucide-react";

export default function StatsGrid({ datasets, projects, activeTraining }) {
  const completedProjects = projects?.filter(p => p.results && typeof p.results.accuracy === 'number') || [];
  const avgAccuracy = completedProjects.length > 0
    ? `${(completedProjects.reduce((acc, p) => acc + p.results.accuracy, 0) / completedProjects.length * 100).toFixed(1)}%`
    : "0%";

  const stats = [
    {
      title: "Datasets",
      value: datasets?.length || 0,
      icon: Database,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      title: "Projects",
      value: projects?.length || 0,
      icon: Brain,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-700"
    },
    {
      title: "Active Training",
      value: activeTraining || 0,
      icon: Zap,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700"
    },
    {
      title: "Avg Accuracy",
      value: avgAccuracy,
      icon: BarChart3,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="relative overflow-hidden border-0 shadow-lg bg-white h-full">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2 text-slate-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}