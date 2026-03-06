import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { UploadFile } from "@/integrations/Core";
import { Dataset } from "@/entities/all";

const DATASET_TYPES = [
  { value: "chest_xray", label: "Chest X-Ray" },
  { value: "ct_scan", label: "CT Scan" },
  { value: "mri", label: "MRI" },
  { value: "dermoscopy", label: "Dermoscopy" },
  { value: "mammography", label: "Mammography" },
  { value: "retinal", label: "Retinal Imaging" }
];

const DATASET_SOURCES = [
  { value: "medmnist", label: "MedMNIST" },
  { value: "chestx_ray14", label: "ChestX-ray14" },
  { value: "covidx", label: "COVIDx" },
  { value: "isic2018", label: "ISIC 2018" },
  { value: "custom_upload", label: "Custom Upload" }
];

export default function UploadDataset({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    source: '',
    description: '',
    total_samples: '',
    classes: ''
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Upload files if any
      let fileUrls = [];
      if (files.length > 0) {
        for (const file of files) {
          const { file_url } = await UploadFile({ file });
          fileUrls.push(file_url);
        }
      }

      // Create dataset
      await Dataset.create({
        ...formData,
        total_samples: parseInt(formData.total_samples) || 0,
        classes: formData.classes ? formData.classes.split(',').map(c => c.trim()) : [],
        file_urls: fileUrls,
        status: 'uploaded'
      });

      onSuccess();
    } catch (error) {
      console.error('Error uploading dataset:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-teal-600" />
          Upload New Dataset
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Dataset Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., COVID-19 Chest X-rays"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="total_samples">Total Samples</Label>
              <Input
                id="total_samples"
                type="number"
                value={formData.total_samples}
                onChange={(e) => setFormData({...formData, total_samples: e.target.value})}
                placeholder="1000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Dataset Type</Label>
              <Select onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {DATASET_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="source">Source</Label>
              <Select onValueChange={(value) => setFormData({...formData, source: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {DATASET_SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="classes">Classes (comma-separated)</Label>
            <Input
              id="classes"
              value={formData.classes}
              onChange={(e) => setFormData({...formData, classes: e.target.value})}
              placeholder="normal, pneumonia, covid-19"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the dataset, its purpose, and any relevant details..."
              rows={3}
            />
          </div>

          <div>
            <Label>Upload Files (optional)</Label>
            <div className="mt-2 space-y-3">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".zip,.tar,.gz,.csv,.json"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-teal-400 transition-colors"
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Click to upload files</p>
                  <p className="text-xs text-slate-500">ZIP, TAR, CSV, JSON supported</p>
                </div>
              </label>

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="flex-1 text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading || !formData.name || !formData.type || !formData.source}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Create Dataset'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}