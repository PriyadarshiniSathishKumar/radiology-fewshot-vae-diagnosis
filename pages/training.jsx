import React, { useState, useEffect } from "react";
import { Dataset, Project } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Brain, Settings, Play, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Training() {
  const [datasets, setDatasets] = useState([]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dataset_id: '',
    vae_config: {
      latent_dim: 128,
      learning_rate: 0.001,
      epochs: 100,
      batch_size: 32,
      beta: 1.0
    },
    fsl_config: {
      method: 'prototypical',
      n_way: 5,
      k_shot: 1,
      episodes: 1000
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [datasetsData, projectsData] = await Promise.all([
        Dataset.list("-created_date"),
        Project.list("-created_date")
      ]);
      setDatasets(datasetsData.filter(d => d.status === 'ready'));
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    try {
      await Project.create({
        ...formData,
        status: 'created'
      });
      
      setShowCreateProject(false);
      setFormData({
        name: '',
        description: '',
        dataset_id: '',
        vae_config: {
          latent_dim: 128,
          learning_rate: 0.001,
          epochs: 100,
          batch_size: 32,
          beta: 1.0
        },
        fsl_config: {
          method: 'prototypical',
          n_way: 5,
          k_shot: 1,
          episodes: 1000
        }
      });
      
      loadData();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const updateVAEConfig = (field, value) => {
    setFormData(prev => ({
      ...prev,
      vae_config: {
        ...prev.vae_config,
        [field]: parseFloat(value) || value
      }
    }));
  };

  const updateFSLConfig = (field, value) => {
    setFormData(prev => ({
      ...prev,
      fsl_config: {
        ...prev.fsl_config,
        [field]: field === 'method' ? value : parseInt(value) || value
      }
    }));
  };

  if (showCreateProject) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowCreateProject(false)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Training
            </Button>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Create New AI Project
            </h1>
            <p className="text-slate-600">
              Configure your VAE and Few-Shot Learning parameters
            </p>
          </div>

          <form onSubmit={handleCreateProject}>
            <div className="space-y-8">
              {/* Basic Info */}
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-teal-600" />
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., COVID-19 Classification Model"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dataset">Dataset</Label>
                    <Select onValueChange={(value) => setFormData({...formData, dataset_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dataset" />
                      </SelectTrigger>
                      <SelectContent>
                        {datasets.map((dataset) => (
                          <SelectItem key={dataset.id} value={dataset.id}>
                            {dataset.name} ({dataset.total_samples} samples)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe your project goals and methodology..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Model Configuration */}
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-teal-600" />
                    Model Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="vae" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="vae">VAE Settings</TabsTrigger>
                      <TabsTrigger value="fsl">Few-Shot Learning</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="vae" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Latent Dimension</Label>
                          <Input
                            type="number"
                            value={formData.vae_config.latent_dim}
                            onChange={(e) => updateVAEConfig('latent_dim', e.target.value)}
                            min="16"
                            max="512"
                          />
                        </div>
                        
                        <div>
                          <Label>Learning Rate</Label>
                          <Input
                            type="number"
                            step="0.0001"
                            value={formData.vae_config.learning_rate}
                            onChange={(e) => updateVAEConfig('learning_rate', e.target.value)}
                            min="0.0001"
                            max="0.1"
                          />
                        </div>
                        
                        <div>
                          <Label>Epochs</Label>
                          <Input
                            type="number"
                            value={formData.vae_config.epochs}
                            onChange={(e) => updateVAEConfig('epochs', e.target.value)}
                            min="10"
                            max="1000"
                          />
                        </div>
                        
                        <div>
                          <Label>Batch Size</Label>
                          <Input
                            type="number"
                            value={formData.vae_config.batch_size}
                            onChange={(e) => updateVAEConfig('batch_size', e.target.value)}
                            min="1"
                            max="128"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <Label>Beta (KL Divergence Weight)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={formData.vae_config.beta}
                            onChange={(e) => updateVAEConfig('beta', e.target.value)}
                            min="0.1"
                            max="10"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Controls the trade-off between reconstruction and regularization
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="fsl" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>FSL Method</Label>
                          <Select 
                            value={formData.fsl_config.method}
                            onValueChange={(value) => updateFSLConfig('method', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="prototypical">Prototypical Networks</SelectItem>
                              <SelectItem value="matching">Matching Networks</SelectItem>
                              <SelectItem value="relation">Relation Networks</SelectItem>
                              <SelectItem value="maml">MAML</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>N-Way (Classes per Episode)</Label>
                          <Input
                            type="number"
                            value={formData.fsl_config.n_way}
                            onChange={(e) => updateFSLConfig('n_way', e.target.value)}
                            min="2"
                            max="20"
                          />
                        </div>
                        
                        <div>
                          <Label>K-Shot (Samples per Class)</Label>
                          <Input
                            type="number"
                            value={formData.fsl_config.k_shot}
                            onChange={(e) => updateFSLConfig('k_shot', e.target.value)}
                            min="1"
                            max="10"
                          />
                        </div>
                        
                        <div>
                          <Label>Training Episodes</Label>
                          <Input
                            type="number"
                            value={formData.fsl_config.episodes}
                            onChange={(e) => updateFSLConfig('episodes', e.target.value)}
                            min="100"
                            max="10000"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateProject(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-teal-600 hover:bg-teal-700"
                  disabled={!formData.name || !formData.dataset_id}
                >
                  Create Project
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              AI Training Projects
            </h1>
            <p className="text-slate-600">
              Create and manage your Few-Shot Learning experiments
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateProject(true)}
            className="bg-teal-600 hover:bg-teal-700"
            disabled={datasets.length === 0}
          >
            <Play className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {datasets.length === 0 && !loading && (
          <Card className="border-0 shadow-lg bg-amber-50/70 backdrop-blur-sm border-amber-200">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">
                  No Datasets Available
                </h3>
                <p className="text-amber-700 mb-4">
                  You need to upload and prepare at least one dataset before creating training projects.
                </p>
                <Link to={createPageUrl("Datasets")}>
                  <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
                    Upload Dataset
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects List */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900">
                        {project.name}
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        {project.description}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'vae_training' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'fsl_training' ? 'bg-purple-100 text-purple-800' :
                      project.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">FSL Method</p>
                      <p className="font-medium">{project.fsl_config?.method || 'prototypical'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">N-Way K-Shot</p>
                      <p className="font-medium">
                        {project.fsl_config?.n_way || 5}-way {project.fsl_config?.k_shot || 1}-shot
                      </p>
                    </div>
                  </div>
                  
                  {project.results && (
                    <div>
                      <Separator className="my-3" />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Accuracy</p>
                          <p className="font-bold text-emerald-600">
                            {(project.results.accuracy * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">F1 Score</p>
                          <p className="font-bold text-blue-600">
                            {(project.results.f1_score * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !loading && datasets.length > 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                No Training Projects Yet
              </h2>
              <p className="text-slate-600 mb-8">
                Create your first AI training project to start experimenting with Few-Shot Learning
              </p>
              <Button 
                onClick={() => setShowCreateProject(true)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}