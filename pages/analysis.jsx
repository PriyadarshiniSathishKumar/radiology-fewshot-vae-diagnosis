import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ImageUploadAnalyzer from "../components/analysis/ImageUploadAnalyzer";
import AnalysisResults from "../components/analysis/AnalysisResults";
import AnalysisHistory from "../components/analysis/AnalysisHistory";
import AIAssistantChatbot from "../components/analysis/AIAssistantChatbot";
import GradCAMVisualization from "../components/analysis/GradCAMVisualization";
import SyntheticComparison from "../components/analysis/SyntheticComparison";

export default function Analysis() {
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const [currentPatient, setCurrentPatient] = useState(null);
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("upload");

    useEffect(() => {
        loadAnalyses();
    }, []);

    const loadAnalyses = async () => {
        try {
            const data = await base44.entities.ImageAnalysis.list("-created_date");
            setAnalyses(data);
        } catch (error) {
            console.error("Error loading analyses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalysisComplete = async (analysis) => {
        setCurrentAnalysis(analysis);
        
        // Load patient data
        if (analysis.patient_id) {
            try {
                const patients = await base44.entities.Patient.list();
                const patient = patients.find(p => p.patient_id === analysis.patient_id);
                setCurrentPatient(patient);
            } catch (error) {
                console.error("Error loading patient:", error);
            }
        }
        
        setActiveTab("results");
        loadAnalyses(); // Refresh the history
    };

    const handleViewAnalysis = async (analysis) => {
        setCurrentAnalysis(analysis);
        
        // Load patient data
        if (analysis.patient_id) {
            try {
                const patients = await base44.entities.Patient.list();
                const patient = patients.find(p => p.patient_id === analysis.patient_id);
                setCurrentPatient(patient);
            } catch (error) {
                console.error("Error loading patient:", error);
            }
        }
        
        setActiveTab("results");
    };

    const handleNewAnalysis = () => {
        setCurrentAnalysis(null);
        setCurrentPatient(null);
        setActiveTab("upload");
    };

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        AI Radiology Analysis
                    </h1>
                    <p className="text-slate-600">
                        Upload medical images for instant AI-powered diagnostic analysis with expert assistant
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
                        <TabsTrigger value="results" disabled={!currentAnalysis}>
                            Results & Assistant
                        </TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="space-y-6">
                        <div className="max-w-4xl mx-auto">
                            <ImageUploadAnalyzer onAnalysisComplete={handleAnalysisComplete} />
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="results" className="space-y-6">
                        {currentAnalysis ? (
                            <div className="space-y-6">
                                {/* Main Results */}
                                <div className="max-w-5xl mx-auto">
                                    <AnalysisResults 
                                        analysis={currentAnalysis}
                                        onNewAnalysis={handleNewAnalysis}
                                    />
                                </div>

                                {/* Grad-CAM Visualization */}
                                <div className="max-w-5xl mx-auto">
                                    <GradCAMVisualization 
                                        originalImage={currentAnalysis.image_url}
                                        findings={currentAnalysis.findings}
                                    />
                                </div>

                                {/* Synthetic Comparison */}
                                <div className="max-w-5xl mx-auto">
                                    <SyntheticComparison 
                                        realImage={currentAnalysis.image_url}
                                        syntheticImage={currentAnalysis.synthetic_comparison?.synthetic_image_url}
                                        similarityScore={currentAnalysis.synthetic_comparison?.similarity_score || 0.85}
                                    />
                                </div>

                                {/* AI Chatbot Assistant */}
                                <div className="max-w-5xl mx-auto">
                                    <AIAssistantChatbot 
                                        analysis={currentAnalysis}
                                        patient={currentPatient}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-slate-500">No analysis selected</p>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setActiveTab("upload")}
                                    className="mt-4"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Go to Upload
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                    
                    <TabsContent value="history" className="space-y-6">
                        <div className="max-w-5xl mx-auto">
                            <AnalysisHistory 
                                analyses={analyses}
                                onViewAnalysis={handleViewAnalysis}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}