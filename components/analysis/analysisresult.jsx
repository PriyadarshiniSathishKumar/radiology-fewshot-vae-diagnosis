import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    AlertTriangle, 
    CheckCircle, 
    MapPin, 
    Star, 
    FileText,
    Download,
    Clock,
    Plus
} from "lucide-react";

const getSeverityColor = (severity) => {
    const colors = {
        mild: "bg-green-100 text-green-800",
        moderate: "bg-yellow-100 text-yellow-800", 
        severe: "bg-orange-100 text-orange-800",
        critical: "bg-red-100 text-red-800"
    };
    return colors[severity] || "bg-gray-100 text-gray-800";
};

const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-orange-600";
};

const getQualityColor = (quality) => {
    const colors = {
        excellent: "bg-green-100 text-green-800",
        good: "bg-blue-100 text-blue-800",
        fair: "bg-yellow-100 text-yellow-800",
        poor: "bg-red-100 text-red-800"
    };
    return colors[quality] || "bg-gray-100 text-gray-800";
};

export default function AnalysisResults({ analysis, onNewAnalysis }) {
    const downloadReport = () => {
        const reportData = {
            analysis_id: analysis.id,
            patient_id: analysis.patient_id,
            image_type: analysis.image_type,
            analysis_date: analysis.created_date,
            findings: analysis.findings,
            summary: analysis.summary,
            recommendations: analysis.recommendations,
            quality_assessment: analysis.quality_assessment
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `radiology_analysis_${analysis.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <FileText className="w-6 h-6 text-teal-600" />
                                Analysis Results
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-600">
                                <span>Type: <span className="font-medium">{analysis.image_type.replace('_', ' ')}</span></span>
                                {analysis.patient_id && <span>Patient: <span className="font-medium">{analysis.patient_id}</span></span>}
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{analysis.processing_time?.toFixed(2)}s processing</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={downloadReport}>
                                <Download className="w-4 h-4 mr-1" />
                                JSON Report
                            </Button>
                            <Button size="sm" onClick={onNewAnalysis} className="bg-teal-600 hover:bg-teal-700">
                                <Plus className="w-4 h-4 mr-1" />
                                New Analysis
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                    <CardContent className="p-6 flex items-center justify-center">
                        <img 
                            src={analysis.image_url} 
                            alt="Analyzed Medical Image"
                            className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-md"
                        />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {analysis.summary && (
                        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Clinical Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
                            </CardContent>
                        </Card>
                    )}
                    {analysis.quality_assessment && (
                        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Image Quality Assessment</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-600 mb-1">Quality</p>
                                    <Badge className={`${getQualityColor(analysis.quality_assessment.image_quality)} text-sm`}>
                                        {analysis.quality_assessment.image_quality}
                                    </Badge>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg text-center">
                                    <p className="text-xs text-slate-600 mb-1">Positioning</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {analysis.quality_assessment.positioning}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg text-center">
                                    <p className="text-xs text-slate-600 mb-1">Factors</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {analysis.quality_assessment.technical_factors}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {analysis.findings && analysis.findings.length > 0 ? (
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Detailed Findings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {analysis.findings.map((finding, index) => (
                            <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                    <h4 className="font-semibold text-slate-900 text-base">
                                        {finding.condition}
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        {finding.confidence && (
                                            <div className="flex items-center gap-1" title="AI Confidence">
                                                <Star className={`w-4 h-4 ${getConfidenceColor(finding.confidence)}`} />
                                                <span className={`font-medium text-sm ${getConfidenceColor(finding.confidence)}`}>
                                                    {(finding.confidence * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        )}
                                        {finding.severity && (
                                            <Badge className={getSeverityColor(finding.severity)}>
                                                {finding.severity}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                
                                {finding.location && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        <span>{finding.location}</span>
                                    </div>
                                )}
                                
                                {finding.description && (
                                    <p className="text-sm text-slate-700">
                                        {finding.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ) : (
                 <Card className="border-0 shadow-lg bg-green-50/70 backdrop-blur-sm border-green-200">
                    <CardContent className="p-6 text-center">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-green-800 mb-2">
                            No Significant Abnormalities Detected
                        </h3>
                        <p className="text-green-700">
                            The AI analysis did not detect any major pathological findings. Clinical correlation is always recommended.
                        </p>
                    </CardContent>
                </Card>
            )}

            {analysis.recommendations && analysis.recommendations.length > 0 && (
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                            Clinical Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 list-disc list-inside">
                            {analysis.recommendations.map((recommendation, index) => (
                                <li key={index} className="text-slate-700">{recommendation}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}