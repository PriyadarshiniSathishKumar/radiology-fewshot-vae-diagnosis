import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { 
    Upload, 
    FileText, 
    Loader2, 
    CheckCircle,
    AlertTriangle,
    Eye,
    Brain
} from "lucide-react";
import { motion } from "framer-motion";

const IMAGE_TYPES = [
    { value: "chest_xray", label: "Chest X-Ray" },
    { value: "ct_scan", label: "CT Scan" },
    { value: "mri", label: "MRI" },
    { value: "dermoscopy", label: "Dermoscopy" },
    { value: "mammography", label: "Mammography" },
    { value: "retinal", label: "Retinal Imaging" }
];

export default function ImageUploadAnalyzer({ onAnalysisComplete }) {
    const [file, setFile] = useState(null);
    const [imageType, setImageType] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const { data: patients = [] } = useQuery({
        queryKey: ['patients'],
        queryFn: () => base44.entities.Patient.list('-created_date'),
    });

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFiles = Array.from(e.dataTransfer.files).filter(
            file => file.type.startsWith("image/")
        );

        if (droppedFiles.length > 0) {
            handleFileSelect(droppedFiles[0]);
        }
    }, []);

    const handleFileSelect = (selectedFile) => {
        if (!selectedFile.type.startsWith("image/")) {
            setError("Please upload an image file (JPEG, PNG, etc.)");
            return;
        }

        setFile(selectedFile);
        setError(null);
        
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
    };

    const handleFileInput = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };

    const analyzeImage = async () => {
        if (!file || !imageType || !selectedPatientId) {
            setError("Please select an image, specify image type, and select a patient");
            return;
        }
        
        const startTime = Date.now();
        setUploading(true);
        setProgress(20);

        try {
            // Upload file
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setProgress(40);

            setUploading(false);
            setAnalyzing(true);
            setProgress(50);

            // Enhanced analysis prompt
            const analysisPrompt = `
You are an expert radiologist AI with specialty in ${imageType.replace('_', ' ')}. 
Analyze this medical image with extreme precision and provide:

1. **Primary Diagnosis**: Most likely condition with confidence level
2. **Detailed Findings**: List ALL abnormalities, lesions, or pathological features
3. **Anatomical Locations**: Exact locations using medical terminology
4. **Severity Assessment**: Classify each finding as mild/moderate/severe/critical
5. **Differential Diagnoses**: Alternative possible conditions
6. **Clinical Recommendations**: Specific next steps (urgent/routine follow-up, additional tests)
7. **Image Quality**: Technical assessment of image quality

Be extremely detailed and precise. Each finding should include:
- Condition name
- Exact anatomical location
- Size/extent if applicable
- Confidence score (0.0-1.0)
- Severity level
- Visual characteristics

For confidence scores:
- 0.9-1.0: Highly confident, characteristic findings
- 0.7-0.89: Confident, typical presentation
- 0.5-0.69: Moderate confidence, requires clinical correlation
- < 0.5: Low confidence, needs further investigation
`;

            const analysisSchema = {
                type: "object",
                properties: {
                    primary_diagnosis: {
                        type: "object",
                        properties: {
                            condition: { type: "string" },
                            confidence: { type: "number" },
                            description: { type: "string" }
                        },
                        required: ["condition", "confidence", "description"]
                    },
                    findings: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                condition: { type: "string" },
                                confidence: { type: "number", minimum: 0, maximum: 1 },
                                location: { type: "string" },
                                severity: { 
                                    type: "string",
                                    enum: ["mild", "moderate", "severe", "critical"]
                                },
                                description: { type: "string" },
                                size_description: { type: "string" }
                            },
                            required: ["condition", "confidence", "location", "severity", "description"]
                        }
                    },
                    differential_diagnoses: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                condition: { type: "string" },
                                likelihood: { type: "string" }
                            }
                        }
                    },
                    summary: { type: "string" },
                    recommendations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                priority: { 
                                    type: "string", 
                                    enum: ["urgent", "high", "medium", "routine"]
                                },
                                recommendation: { type: "string" }
                            }
                        }
                    },
                    quality_assessment: {
                        type: "object",
                        properties: {
                            image_quality: {
                                type: "string",
                                enum: ["excellent", "good", "fair", "poor"]
                            },
                            positioning: { type: "string" },
                            technical_factors: { type: "string" },
                            diagnostic_adequacy: { type: "string" }
                        },
                        required: ["image_quality", "positioning", "technical_factors"]
                    }
                },
                required: ["primary_diagnosis", "findings", "summary", "recommendations", "quality_assessment"]
            };

            setProgress(70);

            const analysis = await base44.integrations.Core.InvokeLLM({
                prompt: analysisPrompt,
                file_urls: [file_url],
                response_json_schema: analysisSchema
            });

            setProgress(90);

            const endTime = Date.now();
            const processingTime = (endTime - startTime) / 1000;

            // Get patient info
            const patient = patients.find(p => p.id === selectedPatientId);

            // Create analysis record
            const analysisRecord = await base44.entities.ImageAnalysis.create({
                patient_id: patient?.patient_id || 'unknown',
                image_url: file_url,
                image_type: imageType,
                findings: analysis.findings || [],
                summary: analysis.summary || 'No summary provided.',
                recommendations: analysis.recommendations?.map(r => 
                    `[${r.priority.toUpperCase()}] ${r.recommendation}`
                ) || [],
                quality_assessment: analysis.quality_assessment || {},
                status: 'completed',
                processing_time: processingTime
            });

            // Update patient's analysis count
            if (patient) {
                await base44.entities.Patient.update(patient.id, {
                    total_analyses: (patient.total_analyses || 0) + 1,
                    last_visit: new Date().toISOString()
                });
            }

            setProgress(100);
            
            if (onAnalysisComplete) {
                onAnalysisComplete(analysisRecord);
            }

        } catch (err) {
            console.error("Error analyzing image:", err);
            setError("Failed to analyze the image. Please try again.");
        } finally {
            setUploading(false);
            setAnalyzing(false);
            setProgress(0);
        }
    };

    const reset = () => {
        setFile(null);
        setImageType('');
        setSelectedPatientId('');
        setError(null);
        setProgress(0);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    return (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-teal-600" />
                    AI Radiology Analysis
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Patient Selection */}
                <div>
                    <Label htmlFor="patient">Select Patient *</Label>
                    <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose patient" />
                        </SelectTrigger>
                        <SelectContent>
                            {patients.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id}>
                                    {patient.full_name} ({patient.patient_id})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <motion.div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                        dragActive 
                            ? "border-teal-400 bg-teal-50/50 scale-105" 
                            : "border-slate-300 hover:border-slate-400"
                    }`}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                        id="image-upload"
                    />
                    
                    {!file ? (
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                                <Upload className="w-8 h-8 text-teal-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Upload Medical Image</h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Drag & drop an image or click to browse
                            </p>
                            <label
                                htmlFor="image-upload"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer transition-colors"
                            >
                                <FileText className="w-4 h-4" />
                                Choose Image
                            </label>
                        </div>
                    ) : (
                        <div className="text-center">
                            {previewUrl && (
                                <div className="mb-4">
                                    <img 
                                        src={previewUrl} 
                                        alt="Preview" 
                                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                                    />
                                </div>
                            )}
                            <div className="flex items-center justify-center gap-2 text-slate-700">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="font-medium">{file.name}</span>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={reset}
                                    className="ml-2"
                                >
                                    Change
                                </Button>
                            </div>
                        </div>
                    )}
                </motion.div>

                <div>
                    <Label htmlFor="imageType">Image Type *</Label>
                    <Select value={imageType} onValueChange={setImageType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select image type" />
                        </SelectTrigger>
                        <SelectContent>
                            {IMAGE_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {(uploading || analyzing) && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">
                                {uploading ? "Uploading image..." : "Analyzing with AI..."}
                            </span>
                            <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                )}

                <Button
                    onClick={analyzeImage}
                    disabled={!file || !imageType || !selectedPatientId || uploading || analyzing}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                >
                    {uploading || analyzing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {uploading ? "Uploading..." : "Analyzing..."}
                        </>
                    ) : (
                        <>
                            <Eye className="w-4 h-4 mr-2" />
                            Analyze Image
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}