import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    ArrowLeft, 
    User, 
    Calendar, 
    Phone, 
    Mail, 
    FileText, 
    Activity,
    AlertTriangle,
    Pill
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function PatientDetailsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('id');

    const { data: patient, isLoading: patientLoading } = useQuery({
        queryKey: ['patient', patientId],
        queryFn: async () => {
            const patients = await base44.entities.Patient.list();
            return patients.find(p => p.id === patientId);
        },
        enabled: !!patientId
    });

    const { data: analyses = [] } = useQuery({
        queryKey: ['patient-analyses', patient?.patient_id],
        queryFn: () => base44.entities.ImageAnalysis.filter({
            patient_id: patient.patient_id
        }, '-created_date'),
        enabled: !!patient
    });

    if (patientLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Patient Not Found</h2>
                <Link to={createPageUrl("Patients")}>
                    <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Patients
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="max-w-7xl mx-auto">
                <Link to={createPageUrl("Patients")}>
                    <Button variant="outline" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Patients
                    </Button>
                </Link>

                {/* Patient Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-6">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                                        <User className="w-10 h-10 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-slate-900">{patient.full_name}</h1>
                                        <p className="text-slate-600">Patient ID: {patient.patient_id}</p>
                                    </div>
                                </div>
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-slate-500" />
                                    <div>
                                        <p className="text-sm text-slate-500">Age</p>
                                        <p className="font-semibold">{patient.age} years</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-slate-500" />
                                    <div>
                                        <p className="text-sm text-slate-500">Gender</p>
                                        <p className="font-semibold capitalize">{patient.gender}</p>
                                    </div>
                                </div>
                                {patient.contact_phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-slate-500" />
                                        <div>
                                            <p className="text-sm text-slate-500">Phone</p>
                                            <p className="font-semibold">{patient.contact_phone}</p>
                                        </div>
                                    </div>
                                )}
                                {patient.contact_email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-slate-500" />
                                        <div>
                                            <p className="text-sm text-slate-500">Email</p>
                                            <p className="font-semibold text-sm">{patient.contact_email}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Tabs */}
                <Tabs defaultValue="analyses" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="analyses">
                            <FileText className="w-4 h-4 mr-2" />
                            Analyses ({analyses.length})
                        </TabsTrigger>
                        <TabsTrigger value="history">
                            <Activity className="w-4 h-4 mr-2" />
                            Medical History
                        </TabsTrigger>
                        <TabsTrigger value="allergies">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Allergies
                        </TabsTrigger>
                        <TabsTrigger value="medications">
                            <Pill className="w-4 h-4 mr-2" />
                            Medications
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="analyses" className="space-y-4 mt-6">
                        {analyses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {analyses.map((analysis) => (
                                    <Card key={analysis.id} className="border-0 shadow-lg bg-white/80">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-lg capitalize">
                                                        {analysis.image_type.replace('_', ' ')}
                                                    </CardTitle>
                                                    <p className="text-sm text-slate-500">
                                                        {format(new Date(analysis.created_date), 'PPP')}
                                                    </p>
                                                </div>
                                                <Badge className={
                                                    analysis.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }>
                                                    {analysis.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-slate-600 mb-3">{analysis.summary}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-500">
                                                    {analysis.findings?.length || 0} findings
                                                </span>
                                                <Link to={`${createPageUrl("AnalysisDetails")}?id=${analysis.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        View Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="border-0 shadow-lg bg-white/80">
                                <CardContent className="p-12 text-center">
                                    <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                    <p className="text-slate-500">No analyses yet</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        <Card className="border-0 shadow-lg bg-white/80">
                            <CardContent className="p-6">
                                {patient.medical_history && patient.medical_history.length > 0 ? (
                                    <div className="space-y-4">
                                        {patient.medical_history.map((item, idx) => (
                                            <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                                                <h4 className="font-semibold text-slate-900">{item.condition}</h4>
                                                {item.diagnosed_date && (
                                                    <p className="text-sm text-slate-600">
                                                        Diagnosed: {format(new Date(item.diagnosed_date), 'PPP')}
                                                    </p>
                                                )}
                                                {item.notes && (
                                                    <p className="text-sm text-slate-600 mt-2">{item.notes}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 py-8">No medical history recorded</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="allergies" className="mt-6">
                        <Card className="border-0 shadow-lg bg-white/80">
                            <CardContent className="p-6">
                                {patient.allergies && patient.allergies.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {patient.allergies.map((allergy, idx) => (
                                            <Badge key={idx} className="bg-red-100 text-red-800">
                                                <AlertTriangle className="w-3 h-3 mr-1" />
                                                {allergy}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 py-8">No known allergies</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="medications" className="mt-6">
                        <Card className="border-0 shadow-lg bg-white/80">
                            <CardContent className="p-6">
                                {patient.current_medications && patient.current_medications.length > 0 ? (
                                    <div className="space-y-2">
                                        {patient.current_medications.map((med, idx) => (
                                            <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                                                <Pill className="w-5 h-5 text-teal-600" />
                                                <span className="font-medium">{med}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 py-8">No current medications</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}