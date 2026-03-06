import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, Database, Brain, BarChart3 } from "lucide-react";

const getActivityIcon = (type) => {
  switch (type) {
    case 'dataset': return Database;
    case 'project': return Brain;
    case 'training': return BarChart3;
    default: return Clock;
  }
};

const getActivityColor = (type) => {
  switch (type) {
    case 'dataset': return 'bg-blue-100 text-blue-800';
    case 'project': return 'bg-teal-100 text-teal-800';
    case 'training': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function RecentActivity({ datasets, projects }) {
  // Combine and sort recent activity
  const activities = [
    ...(datasets || []).map(d => ({
      id: d.id,
      type: 'dataset',
      title: `Dataset "${d.name}" uploaded`,
      timestamp: d.created_date,
      status: d.status
    })),
    ...(projects || []).map(p => ({
      id: p.id,
      type: 'project',
      title: `Project "${p.name}" created`,
      timestamp: p.created_date,
      status: p.status
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8);

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Clock className="w-5 h-5 text-teal-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Icon className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {activity.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-500">
                      {format(new Date(activity.timestamp), 'MMM d, HH:mm')}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getActivityColor(activity.type)}`}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}