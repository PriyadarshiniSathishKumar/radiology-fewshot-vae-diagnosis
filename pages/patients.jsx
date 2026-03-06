import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PatientCard from "../components/patients/PatientCard";
import AddPatientForm from "../components/patients/AddPatientForm";

export default function PatientsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const queryClient = useQueryClient();

    const { data: patients = [], isLoading } = useQuery({
        queryKey: ['patients'],
        queryFn: () => base44.entities.Patient.list('-last_visit'),
    });

    const createPatientMutation = useMutation({
        mutationFn: (patientData) => base44.entities.Patient.create(patientData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            setShowAddForm(false);
        },
    });

    const filteredPatients = patients.filter(patient => {
        const nameMatch = patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const idMatch = patient.patient_id?.toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch || idMatch;
    });

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            Patient Management
                        </h1>
                        <p className="text-slate-600">
                            Manage patient records and medical history
                        </p>
                    </div>
                    <Button 
                        onClick={() => setShowAddForm(true)}
                        className="bg-teal-600 hover:bg-teal-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Patient
                    </Button>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search patients by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-8"
                        >
                            <AddPatientForm
                                onSubmit={(data) => createPatientMutation.mutate(data)}
                                onCancel={() => setShowAddForm(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-48 bg-slate-200 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : filteredPatients.length > 0 ? (
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 }
                            }
                        }}
                    >
                        {filteredPatients.map((patient) => (
                            <motion.div
                                key={patient.id}
                                variants={{
                                    hidden: { opacity: 0, scale: 0.9 },
                                    visible: { opacity: 1, scale: 1 }
                                }}
                            >
                                <PatientCard patient={patient} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-16">
                        <User className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">
                            No Patients Found
                        </h3>
                        <p className="text-slate-500 mb-6">
                            {searchTerm ? "Try adjusting your search" : "Add your first patient to get started"}
                        </p>
                        {!searchTerm && (
                            <Button onClick={() => setShowAddForm(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Patient
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}