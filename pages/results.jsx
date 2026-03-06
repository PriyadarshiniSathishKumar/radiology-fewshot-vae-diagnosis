import React, { useState, useEffect } from "react";
import { Project, TrainingRun } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Award, Target, Brain } from "lucide-react";

export default function Results() {
  const [projects, setProjects] = useState([]);
  const [trainingRuns, setTrainingRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsData, runsData] = await Promise.all([
        Project.list("-created_date"),
        TrainingRun.list("-created_date")
      ]);
      setProjects(projectsData);
      setTrainingRuns(runsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const performanceData = projects
    .filter(p => p.results)
    .map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      accuracy: (p.results.accuracy * 100).toFixed(1),
      precision: (p.results.precision * 100).toFixed(1),
      recall: (p.results.recall * 100).toFixed(1),
      f1_score: (p.results.f1_score * 100).toFixed(1)
    }));

  const methodDistribution = projects.reduce((acc, p) => {
    const method = p.fsl_config?.method || 'prototypical';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(methodDistribution).map(([method, count]) => ({
    name: method,
    value: count,
    color: {
      'prototypical': '#0f766e',
      'matching': '#1d4ed8',
      'relation': '#9333ea',
      'maml': '#ea580c'
    }[method] || '#64748b'
  }));

  const completedProjects = projects.filter(p => p.status === 'completed');
  const avgAccuracy = completedProjects.length > 0 
    ? completedProjects.reduce((sum, p) => sum + (p.results?.accuracy || 0), 0) / completedProjects.length 
    : 0;

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Training Results & Analytics
          </h1>
          <p className="text-slate-600">
            Monitor your AI model performance and training metrics
          </p>
        </div>

        {projects.length === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                No Results Available
              </h2>
              <p className="text-slate-600">
                Create and train some AI projects to see performance analytics here
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Projects</p>
                      <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
                    </div>
                    <Brain className="w-8 h-8 text-teal-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Completed</p>
                      <p className="text-2xl font-bold text-slate-900">{completedProjects.length}</p>
                    </div>
                    <Award className="w-8 h-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Avg Accuracy</p>
                      <p className="text-2xl font-bold text-slate-900">{(avgAccuracy * 100).toFixed(1)}%</p>
                    </div>
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Best Model</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {completedProjects.length > 0 ? Math.max(...completedProjects.map(p => (p.results?.accuracy || 0) * 100)).toFixed(1) : 0}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="performance">Model Performance</TabsTrigger>
                <TabsTrigger value="methods">Method Analysis</TabsTrigger>
                <TabsTrigger value="projects">Project Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="performance" className="space-y-6 mt-6">
                {performanceData.length > 0 ? (
                  <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Performance Metrics Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="accuracy" fill="#0f766e" name="Accuracy (%)" />
                          <Bar dataKey="f1_score" fill="#ea580c" name="F1 Score" />
                          <Bar dataKey="precision" fill="#1d4ed8" name="Precision" />
                          <Bar dataKey="recall" fill="#9333ea" name="Recall" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                      <p className="text-slate-500">No completed projects with results available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="methods" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>FSL Method Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-slate-500">
                          No data available
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Method Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(
                        projects.reduce((acc, p) => {
                          if (p.results) {
                            const method = p.fsl_config?.method || 'prototypical';
                            if (!acc[method]) acc[method] = { total: 0, count: 0 };
                            acc[method].total += p.results.accuracy;
                            acc[method].count += 1;
                          }
                          return acc;
                        }, {})
                      ).map(([method, stats]) => (
                        <div key={method} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium capitalize">{method} Networks</p>
                            <p className="text-sm text-slate-600">{stats.count} projects</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {((stats.total / stats.count) * 100).toFixed(1)}%
                            </p>
                            <p className="text-xs text-slate-500">Avg Accuracy</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="projects" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <Card key={project.id} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{project.name}</CardTitle>
                            <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                          </div>
                          <Badge className={
                            project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">FSL Method</p>
                            <p className="font-medium capitalize">{project.fsl_config?.method || 'prototypical'}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Configuration</p>
                            <p className="font-medium">
                              {project.fsl_config?.n_way || 5}-way {project.fsl_config?.k_shot || 1}-shot
                            </p>
                          </div>
                        </div>

                        {project.results && (
                          <div className="border-t pt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-emerald-600">
                                  {(project.results.accuracy * 100).toFixed(1)}%
                                </p>
                                <p className="text-xs text-slate-500">Accuracy</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">
                                  {(project.results.f1_score * 100).toFixed(1)}%
                                </p>
                                <p className="text-xs text-slate-500">F1 Score</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}