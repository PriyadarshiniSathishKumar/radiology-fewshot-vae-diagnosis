import React, { useState, useEffect } from "react";
import { Dataset } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import DatasetCard from "../components/datasets/DatasetCard";
import UploadDataset from "../components/datasets/UploadDataset";

export default function Datasets() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const data = await Dataset.list("-created_date");
      setDatasets(data);
    } catch (error) {
      console.error("Error loading datasets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    loadDatasets();
  };

  const handleView = (dataset) => {
    // TODO: Implement dataset detail view
    console.log("View dataset:", dataset);
  };

  const handleDelete = async (dataset) => {
    if (confirm(`Are you sure you want to delete "${dataset.name}"?`)) {
      try {
        await Dataset.delete(dataset.id);
        loadDatasets();
      } catch (error) {
        console.error("Error deleting dataset:", error);
      }
    }
  };

  const filteredDatasets = datasets.filter(dataset => {
    const nameMatch = dataset.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const descMatch = dataset.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesSearch = nameMatch || descMatch;
    const matchesType = filterType === "all" || dataset.type === filterType;
    return matchesSearch && matchesType;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (showUpload) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <UploadDataset 
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUpload(false)}
          />
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
              Medical Datasets
            </h1>
            <p className="text-slate-600">
              Manage your medical imaging datasets for AI training
            </p>
          </div>
          <Button 
            onClick={() => setShowUpload(true)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Dataset
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search datasets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">All Types</option>
            <option value="chest_xray">Chest X-Ray</option>
            <option value="ct_scan">CT Scan</option>
            <option value="mri">MRI</option>
            <option value="dermoscopy">Dermoscopy</option>
            <option value="mammography">Mammography</option>
            <option value="retinal">Retinal</option>
          </select>
        </div>

        {/* Datasets Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredDatasets.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredDatasets.map((dataset) => (
              <motion.div key={dataset.id} variants={itemVariants}>
                <DatasetCard
                  dataset={dataset}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                {searchTerm || filterType !== "all" ? "No datasets found" : "No datasets yet"}
              </h2>
              <p className="text-slate-600 mb-8">
                {searchTerm || filterType !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Upload your first medical imaging dataset to get started with AI training"
                }
              </p>
              {!searchTerm && filterType === "all" && (
                <Button 
                  onClick={() => setShowUpload(true)}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Dataset
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}