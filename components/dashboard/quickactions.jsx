import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Upload, Brain, BarChart3 } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Upload Dataset",
      description: "Add new medical imaging dataset",
      icon: Upload,
      href: createPageUrl("Datasets"),
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Create Project",
      description: "Start new AI training project",
      icon: Brain,
      href: createPageUrl("Training"),
      color: "bg-teal-600 hover:bg-teal-700"
    },
    {
      title: "View Results",
      description: "Analyze model performance",
      icon: BarChart3,
      href: createPageUrl("Results"),
      color: "bg-emerald-600 hover:bg-emerald-700"
    }
  ];

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Plus className="w-5 h-5 text-teal-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <Link key={action.title} to={action.href}>
            <Button 
              variant="outline" 
              className="w-full justify-start h-auto p-4 border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all duration-200"
            >
              <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                <action.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-900">{action.title}</p>
                <p className="text-xs text-slate-600 mt-1">{action.description}</p>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}