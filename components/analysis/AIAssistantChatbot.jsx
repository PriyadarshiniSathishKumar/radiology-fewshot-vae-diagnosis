import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";
import { 
    MessageCircle, 
    Send, 
    Mic, 
    MicOff, 
    Bot, 
    User, 
    Volume2,
    VolumeX,
    Stethoscope,
    Heart,
    Trash2,
    Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Predefined questions for different user types
const PATIENT_QUESTIONS = [
    { q: "What does this diagnosis mean?", category: "understanding" },
    { q: "How serious is my condition?", category: "severity" },
    { q: "What should I do next?", category: "treatment" },
    { q: "Can this be treated?", category: "prognosis" },
    { q: "What caused this?", category: "causes" },
    { q: "Will I need surgery?", category: "treatment" },
    { q: "How long will recovery take?", category: "recovery" },
    { q: "Are there any lifestyle changes I should make?", category: "lifestyle" },
];

const RADIOLOGIST_QUESTIONS = [
    { q: "What are the key radiological findings?", category: "findings" },
    { q: "What is the differential diagnosis?", category: "diagnosis" },
    { q: "Which imaging protocol was used?", category: "technical" },
    { q: "What are the confidence scores for each finding?", category: "metrics" },
    { q: "Are there any artifacts or image quality issues?", category: "quality" },
    { q: "What follow-up imaging is recommended?", category: "followup" },
    { q: "How does this compare to previous studies?", category: "comparison" },
    { q: "What are the ICD-10 codes for these findings?", category: "coding" },
];

export default function AIAssistantChatbot({ analysis, patient }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I\'m your AI medical assistant. I can help explain the diagnosis and answer questions. Choose Patient Mode for simple explanations or Radiologist Mode for technical details.',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('patient'); // 'patient' or 'radiologist'
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            // Stop any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-speech not supported in this browser.');
        }
    };

    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const handleSend = async (question = input) => {
        if (!question.trim()) return;

        const userMessage = {
            role: 'user',
            content: question,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Build context from analysis
            const findingsText = analysis.findings?.map(f => 
                `${f.condition} (${(f.confidence * 100).toFixed(0)}% confidence, ${f.severity} severity) located at ${f.location}`
            ).join('; ') || 'No specific findings detected';

            const context = `
Patient Information:
- Name: ${patient?.full_name || 'Unknown'}
- Age: ${patient?.age || 'Unknown'} years
- Gender: ${patient?.gender || 'Unknown'}
- Medical History: ${patient?.medical_history?.map(h => h.condition).join(', ') || 'None recorded'}
- Allergies: ${patient?.allergies?.join(', ') || 'None'}

Analysis Results:
- Image Type: ${analysis.image_type.replace('_', ' ').toUpperCase()}
- Findings: ${findingsText}
- Summary: ${analysis.summary || 'No summary available'}
- Recommendations: ${analysis.recommendations?.join('; ') || 'No recommendations'}
- Image Quality: ${analysis.quality_assessment?.image_quality || 'Good'}
- Processing Time: ${analysis.processing_time?.toFixed(2)}s
`;

            let prompt;
            if (mode === 'patient') {
                prompt = `You are a compassionate medical AI assistant speaking to a patient.

${context}

Patient Question: ${question}

Instructions:
- Use simple, non-technical language that a non-medical person can understand
- Be empathetic and reassuring while being honest
- Avoid medical jargon; explain terms in plain English
- Focus on actionable next steps and what the patient can do
- Always emphasize the importance of discussing with their doctor
- If the finding is serious, be sensitive but clear
- Keep responses concise (2-3 paragraphs max)

Provide a clear, compassionate explanation:`;
            } else {
                prompt = `You are an expert radiologist AI assistant providing technical consultation.

${context}

Radiologist Question: ${question}

Instructions:
- Use proper medical terminology and anatomical references
- Provide detailed technical analysis
- Include relevant differential diagnoses
- Reference imaging characteristics (Hounsfield units, signal intensity, etc.)
- Suggest appropriate follow-up protocols
- Include ICD-10 codes if relevant
- Cite relevant medical literature or guidelines when applicable
- Be precise and comprehensive

Provide detailed radiological analysis:`;
            }

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: prompt,
                add_context_from_internet: false
            });

            const assistantMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Auto-speak if voice is enabled
            if (voiceEnabled) {
                speak(response);
            }

        } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMessage = {
                role: 'assistant',
                content: 'I apologize, but I encountered an error processing your question. Please try again or contact support if the issue persists.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickQuestion = (question) => {
        handleSend(question);
    };

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            content: `Chat cleared. I'm ready to answer your ${mode === 'patient' ? 'questions about the diagnosis' : 'radiological consultation questions'}.`,
            timestamp: new Date()
        }]);
        stopSpeaking();
    };

    const exportChat = () => {
        const chatText = messages.map(msg => 
            `[${msg.timestamp.toLocaleTimeString()}] ${msg.role.toUpperCase()}: ${msg.content}`
        ).join('\n\n');
        
        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat_${patient?.patient_id || 'unknown'}_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const currentQuestions = mode === 'patient' ? PATIENT_QUESTIONS : RADIOLOGIST_QUESTIONS;

    return (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-teal-600" />
                            AI Medical Assistant
                        </CardTitle>
                        <p className="text-sm text-slate-600 mt-2">
                            Ask questions about the diagnosis. Voice input and output supported!
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className={voiceEnabled ? 'bg-teal-50 border-teal-500' : ''}
                        >
                            {voiceEnabled ? (
                                <>
                                    <Volume2 className="w-4 h-4 mr-1" />
                                    Voice On
                                </>
                            ) : (
                                <>
                                    <VolumeX className="w-4 h-4 mr-1" />
                                    Voice Off
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Mode Selector */}
                <Tabs value={mode} onValueChange={(value) => {
                    setMode(value);
                    setMessages([{
                        role: 'assistant',
                        content: value === 'patient' 
                            ? "Switched to Patient Mode. I'll explain everything in simple terms."
                            : "Switched to Radiologist Mode. I'll provide technical medical details.",
                        timestamp: new Date()
                    }]);
                }}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="patient" className="flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            Patient Mode
                        </TabsTrigger>
                        <TabsTrigger value="radiologist" className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            Radiologist Mode
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="patient" className="mt-4">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                            <strong>Patient Mode:</strong> I'll explain medical terms in simple language and focus on what matters to you.
                        </div>
                    </TabsContent>

                    <TabsContent value="radiologist" className="mt-4">
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
                            <strong>Radiologist Mode:</strong> Technical analysis with proper medical terminology and clinical details.
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Quick Questions */}
                <div>
                    <h4 className="text-sm font-medium mb-2">Quick Questions:</h4>
                    <div className="flex flex-wrap gap-2">
                        {currentQuestions.slice(0, 6).map((item, idx) => (
                            <Button
                                key={idx}
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickQuestion(item.q)}
                                className="text-xs"
                                disabled={loading}
                            >
                                {item.q}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto bg-slate-50 rounded-lg p-4 space-y-4 border border-slate-200">
                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-6 h-6 text-white" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-lg p-4 ${
                                        msg.role === 'user'
                                            ? 'bg-teal-600 text-white'
                                            : 'bg-white border border-slate-200 shadow-sm'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-teal-100' : 'text-slate-400'}`}>
                                        {msg.timestamp.toLocaleTimeString()}
                                    </p>
                                    {msg.role === 'assistant' && (
                                        <div className="flex gap-2 mt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => isSpeaking ? stopSpeaking() : speak(msg.content)}
                                                className="h-7 text-xs"
                                            >
                                                {isSpeaking ? (
                                                    <>
                                                        <VolumeX className="w-3 h-3 mr-1" />
                                                        Stop
                                                    </>
                                                ) : (
                                                    <>
                                                        <Volume2 className="w-3 h-3 mr-1" />
                                                        Read Aloud
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder={mode === 'patient' ? "Type your question..." : "Enter radiological query..."}
                            disabled={loading}
                            className="flex-1"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleListening}
                            className={isListening ? 'bg-red-50 border-red-500 animate-pulse' : ''}
                            disabled={loading}
                        >
                            {isListening ? (
                                <MicOff className="w-5 h-5 text-red-600" />
                            ) : (
                                <Mic className="w-5 h-5" />
                            )}
                        </Button>
                        <Button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || loading}
                            className="bg-teal-600 hover:bg-teal-700"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                    
                    {isListening && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded"
                        >
                            <Mic className="w-4 h-4 animate-pulse" />
                            Listening... Speak now
                        </motion.div>
                    )}
                </div>

                {/* Chat Controls */}
                <div className="flex justify-between items-center pt-2 border-t">
                    <p className="text-xs text-slate-500">
                        {messages.length - 1} messages • {mode === 'patient' ? 'Simple language' : 'Technical terms'}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={exportChat}
                            className="text-xs"
                        >
                            <Download className="w-3 h-3 mr-1" />
                            Export
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearChat}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Clear
                        </Button>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    <strong>⚠️ Medical Disclaimer:</strong> This AI assistant provides information for educational purposes only. 
                    {mode === 'patient' ? ' Always consult your doctor before making any medical decisions.' : ' This is a clinical decision support tool. Final diagnosis and treatment decisions should be made by qualified healthcare professionals.'}
                </div>
            </CardContent>
        </Card>
    );
}