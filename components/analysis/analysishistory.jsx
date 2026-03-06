import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
    Clock, 
    Eye, 
    FileText, 
    User,
    AlertTriangle,
    CheckCircle
} from "lucide-react";

const getStatusColor = (status) => {
    const colors = {
        completed: "bg-green-100 text-green-800",
        processing: "bg-blue-100 text-blue-800",
        error: "bg-red-100 text-red-800",
        review_required: "bg-yellow-100 text-yellow-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
};

const getSeverityIcon = (findings) => {
    if (!findings || findings.length === 0) {
        return <CheckCircle className="w-4 h-4 text-green-600" title="No findings" />;
    }
    
    const hasCritical = findings.some(f => f.severity === 'critical');
    const hasSevere = findings.some(f => f.severity === 'severe');
    
    if (hasCritical) {
        return <AlertTriangle className="w-4 h-4 text-red-600" title="Critical finding" />;
    }
    if (hasSevere) {
        return <AlertTriangle className="w-4 h-4 text-orange-500" title="Severe finding" />;
    }
    
    return <FileText className="w-4 h-4 text-blue-600" title="Findings present" />;
};

export default function AnalysisHistory({ analyses, onViewAnalysis }) {
    return (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-600" />
                    Analysis History
                </CardTitle>
            </CardHeader>
            <CardContent>
                {analyses && analyses.length > 0 ? (
                    <div className="space-y-4">
                        {analyses.map((analysis) => (
                            <div 
                                key={analysis.id} 
                                className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {analysis.image_url ? (
                                            <img 
                                                src={analysis.image_url} 
                                                alt="Analysis thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FileText className="w-6 h-6 text-slate-500" />
                                        )}
                                    </div>
                                    
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {getSeverityIcon(analysis.findings)}
                                            <h4 className="font-medium text-slate-900">
                                                {analysis.image_type.replace('_', ' ')} Analysis
                                            </h4>
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                                            <span>{format(new Date(analysis.created_date), 'MMM d, yyyy HH:mm')}</span>
                                            {analysis.patient_id && (
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    <span>{analysis.patient_id}</span>
                                                </div>
                                            )}
                                            {analysis.findings && (
                                                <span>{analysis.findings.length} findings</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <Badge className={getStatusColor(analysis.status)}>
                                        {analysis.status.replace('_', ' ')}
                                    </Badge>
                                    
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => onViewAnalysis(analysis)}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No analysis history found</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}