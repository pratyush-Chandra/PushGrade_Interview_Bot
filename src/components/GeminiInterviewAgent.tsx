"use client";
import React, { useState, useRef, useEffect } from "react";
import { generateInterviewQuestions, analyzeInterviewFeedback } from "@/lib/gemini";

const INITIAL_PROMPT = `You are a senior software engineer conducting a technical interview. Ask the candidate one question at a time. Wait for their answer before asking the next. Be professional, encouraging, and adapt your questions based on their previous answers. Start with: 'Welcome! Let's begin your interview. First question: ...'`;

export default function GeminiInterviewAgent() {
  const [step, setStep] = useState<"setup" | "interview" | "feedback">("setup");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [transcript, setTranscript] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const maxQuestions = 5;
  const [resumeText, setResumeText] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uiStep, setUiStep] = useState<1 | 2 | 3>(1);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcriptValue, setTranscriptValue] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [voiceNavCommand, setVoiceNavCommand] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);

  // Stepper labels
  const steps = [
    "Upload Resume",
    "Confirm/Edit Info",
    "Interview Setup"
  ];

  // Helper: Extract roles and projects from resume text (simple regex-based for now)
  function extractResumeInfo(text: string) {
    const roleMatches = text.match(/(Role|Title|Position):?\s*(.+)/gi) || [];
    const projectMatches = text.match(/(Project|Project Name):?\s*(.+)/gi) || [];
    setRoles(roleMatches.map(r => r.replace(/(Role|Title|Position):?\s*/i, "")));
    setProjects(projectMatches.map(p => p.replace(/(Project|Project Name):?\s*/i, "")));
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;
    if (file.type === "text/plain") {
      const text = await file.text();
      setResumeText(text);
      extractResumeInfo(text);
    } else if (file.type === "application/pdf") {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          throw new Error("Failed to parse PDF");
        }
        const data = await res.json();
        setResumeText(data.text);
        extractResumeInfo(data.text);
      } catch (err) {
        setResumeText("");
        setRoles([]);
        setProjects([]);
        setUploadError("Failed to parse PDF. Please try a different file or use a .txt resume.");
      } finally {
        setUploading(false);
      }
    } else {
      setResumeText("Unsupported file type. Please upload a .txt or .pdf file.");
      setRoles([]);
      setProjects([]);
    }
  }

  // Helper: Allow editing of roles/projects
  function handleRoleEdit(idx: number, value: string) {
    setRoles(prev => prev.map((r, i) => (i === idx ? value : r)));
  }
  function handleProjectEdit(idx: number, value: string) {
    setProjects(prev => prev.map((p, i) => (i === idx ? value : p)));
  }
  function handleRemoveRole(idx: number) {
    setRoles(prev => prev.filter((_, i) => i !== idx));
  }
  function handleRemoveProject(idx: number) {
    setProjects(prev => prev.filter((_, i) => i !== idx));
  }
  function handleAddRole() {
    setRoles(prev => [...prev, ""]);
  }
  function handleAddProject() {
    setProjects(prev => [...prev, ""]);
  }

  // Start the interview
  async function handleStart() {
    setLoading(true);
    const questions = await generateInterviewQuestions({ role, experience, technologies, count: 1, roles, projects });
    setCurrentQuestion(questions[0]);
    setStep("interview");
    setLoading(false);
    setQuestionCount(1);
    setAnswers([]);
    setTranscript("");
    setFeedback("");
    setTimeout(() => {}, 500); // Placeholder for TTS
  }

  // Helper: Speak text using TTS
  function speak(text: string, onEnd?: () => void) {
    if (!window.speechSynthesis) return;
    setIsSpeaking(true);
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utter.onerror = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    window.speechSynthesis.speak(utter);
  }

  // Helper: Start listening for answer (STT)
  function startListening() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError("Speech recognition not supported in this browser.");
      return;
    }
    setIsListening(true);
    setInterimTranscript("");
    setTranscriptValue("");
    setError(null);
    setVoiceNavCommand(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(interim);
      if (final) {
        setTranscriptValue(final.trim());
        // Check for voice navigation commands
        const cmd = final.trim().toLowerCase();
        if (cmd.includes("repeat")) {
          setVoiceNavCommand("repeat");
        } else if (cmd.includes("next")) {
          setVoiceNavCommand("next");
        } else if (cmd.includes("finish")) {
          setVoiceNavCommand("finish");
        }
      }
    };
    recognition.onerror = (event: any) => {
      setError("Speech recognition error: " + event.error);
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
  }

  // Helper: Stop listening
  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }

  // Handle voice navigation commands
  useEffect(() => {
    if (!voiceNavCommand) return;
    if (voiceNavCommand === "repeat") {
      setVoiceNavCommand(null);
      speak(currentQuestion, () => startListening());
    } else if (voiceNavCommand === "next") {
      setVoiceNavCommand(null);
      handleSubmitAnswer(transcriptValue);
    } else if (voiceNavCommand === "finish") {
      setVoiceNavCommand(null);
      handleSubmitAnswer(transcriptValue, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceNavCommand]);

  // Handle answer submission (manual or via voice command)
  async function handleSubmitAnswer(answer: string, forceFinish = false) {
    stopListening();
    setManualMode(false);
    setTranscriptValue("");
    setInterimTranscript("");
    setError(null);
    setAnswers(prev => [...prev, answer]);
    setTranscript(prev => prev + `Q: ${currentQuestion}\nA: ${answer}\n`);
    if (questionCount >= maxQuestions || forceFinish) {
      setStep("feedback");
      setLoading(true);
      speak("Thank you. Generating your feedback now.");
      const fb = await analyzeInterviewFeedback({ transcript: transcript + `Q: ${currentQuestion}\nA: ${answer}\n` });
      setFeedback(fb);
      setLoading(false);
      speak(fb);
      return;
    }
    setLoading(true);
    const questions = await generateInterviewQuestions({ role, experience, technologies, count: 1, roles, projects });
    setCurrentQuestion(questions[0]);
    setQuestionCount(qc => qc + 1);
    setLoading(false);
    setTimeout(() => speak(questions[0], () => startListening()), 500);
  }

  // On interview start, speak the first question and start listening
  useEffect(() => {
    if (step === "interview" && currentQuestion) {
      speak(currentQuestion, () => startListening());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, currentQuestion]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  function handleRestart() {
    setStep("setup");
    setRole("");
    setExperience("");
    setTechnologies([]);
    setCurrentQuestion("");
    setAnswers([]);
    setTranscript("");
    setFeedback("");
    setQuestionCount(0);
  }

  return (
    <div className="max-w-lg mx-auto p-4 border rounded shadow mt-8">
      {/* Stepper/Progress Indicator */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((label, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div className={`rounded-full w-8 h-8 flex items-center justify-center text-white font-bold mb-1 transition-all duration-200 ${uiStep === idx + 1 ? 'bg-blue-600 scale-110' : idx + 1 < uiStep ? 'bg-green-500' : 'bg-gray-300'}`}>{idx + 1}</div>
            <span className={`text-xs text-center ${uiStep === idx + 1 ? 'font-semibold text-blue-700' : 'text-gray-500'}`}>{label}</span>
            {idx < steps.length - 1 && <div className="w-full h-1 bg-gray-200 mt-1 mb-1" />}
          </div>
        ))}
      </div>
      {/* Step 1: Upload Resume */}
      {uiStep === 1 && (
        <div className="mb-6 animate-fade-in">
          <h2 className="text-lg font-semibold mb-2">Step 1: Upload Your Resume</h2>
          <input
            type="file"
            accept=".txt,.pdf"
            ref={fileInputRef}
            onChange={handleResumeUpload}
            className="mb-2"
            disabled={uploading}
          />
          {uploading && <div className="text-blue-500 mb-2">Uploading and extracting text from PDF...</div>}
          {uploadError && <div className="text-red-500 mb-2">{uploadError}</div>}
          {resumeText && (
            <div className="bg-gray-50 p-2 rounded mb-2 text-xs max-h-32 overflow-auto">
              <strong>Extracted Text:</strong>
              <pre>{resumeText.slice(0, 1000)}{resumeText.length > 1000 ? "..." : ""}</pre>
            </div>
          )}
          <button
            className="btn w-full"
            disabled={roles.length === 0 && projects.length === 0 || uploading}
            onClick={() => setUiStep(2)}
          >
            Next: Confirm/Edit Extracted Info
          </button>
        </div>
      )}
      {/* Step 2: Confirm/Edit Roles & Projects */}
      {uiStep === 2 && (
        <div className="mb-6 animate-fade-in">
          <h2 className="text-lg font-semibold mb-2">Step 2: Confirm/Edit Roles & Projects</h2>
          <div className="mb-4">
            <strong>Roles:</strong>
            {roles.map((role, idx) => (
              <div key={idx} className="flex gap-2 mb-1">
                <input
                  className="input flex-1"
                  value={role}
                  onChange={e => handleRoleEdit(idx, e.target.value)}
                />
                <button className="btn btn-xs" onClick={() => handleRemoveRole(idx)}>Remove</button>
              </div>
            ))}
            <button className="btn btn-outline btn-xs mt-1" onClick={handleAddRole}>Add Role</button>
          </div>
          <div className="mb-4">
            <strong>Projects:</strong>
            {projects.map((project, idx) => (
              <div key={idx} className="flex gap-2 mb-1">
                <input
                  className="input flex-1"
                  value={project}
                  onChange={e => handleProjectEdit(idx, e.target.value)}
                />
                <button className="btn btn-xs" onClick={() => handleRemoveProject(idx)}>Remove</button>
              </div>
            ))}
            <button className="btn btn-outline btn-xs mt-1" onClick={handleAddProject}>Add Project</button>
          </div>
          <button className="btn w-full" onClick={() => setUiStep(3)}>
            Next: Interview Setup
          </button>
          <button className="btn btn-outline w-full mt-2" onClick={() => setUiStep(1)}>
            Back
          </button>
        </div>
      )}
      {/* Step 3: Interview Setup & Interview Flow */}
      {uiStep === 3 && (
        <>
          {/* Summary Card */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 animate-fade-in">
            <h3 className="font-semibold mb-2 text-blue-800">Summary Before Interview</h3>
            <div className="mb-1"><strong>Roles:</strong> {roles.length ? roles.join(", ") : <span className="text-gray-400">None</span>}</div>
            <div className="mb-1"><strong>Projects:</strong> {projects.length ? projects.join(", ") : <span className="text-gray-400">None</span>}</div>
            {resumeText && <div className="mb-1"><strong>Resume Snippet:</strong> <span className="text-xs text-gray-700">{resumeText.slice(0, 200)}{resumeText.length > 200 ? "..." : ""}</span></div>}
            <button className="btn btn-outline btn-xs mt-2" onClick={() => setUiStep(2)}>Edit Info</button>
          </div>
          {step === "setup" && (
            <div>
              <h2 className="text-xl font-bold mb-2">Start Voice Interview</h2>
              <input
                placeholder="Role"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="input w-full mb-2"
              />
              <input
                placeholder="Experience (e.g. 2 years)"
                value={experience}
                onChange={e => setExperience(e.target.value)}
                className="input w-full mb-2"
              />
              <input
                placeholder="Technologies (comma separated)"
                value={technologies.join(", ")}
                onChange={e => setTechnologies(e.target.value.split(",").map(t => t.trim()))}
                className="input w-full mb-2"
              />
              <button onClick={handleStart} disabled={loading} className="btn w-full mb-2">
                {loading ? "Starting..." : "Start Interview"}
              </button>
            </div>
          )}
          {step === "interview" && (
            <div>
              <h2 className="text-xl font-bold mb-2">Interview In Progress</h2>
              <div className="mb-4">
                <span className="font-semibold">Question {questionCount} of {maxQuestions}:</span>
                <div className="mt-2 mb-4 text-lg">{currentQuestion}</div>
                <button className="btn btn-outline mb-2" onClick={() => speak(currentQuestion)} disabled={isSpeaking || isListening}>🔊 Repeat Question</button>
              </div>
              <div className="mb-2">
                {isSpeaking && <div className="text-blue-600 font-semibold mb-2">Speaking...</div>}
                {isListening && <div className="text-green-600 font-semibold mb-2">Listening... (Say your answer or say 'repeat', 'next', or 'finish')</div>}
                {interimTranscript && <div className="bg-gray-100 p-2 rounded mb-2 text-sm">Transcribing: {interimTranscript}</div>}
                {error && <div className="text-red-500 mb-2">{error}</div>}
                <textarea
                  className="input w-full mb-2"
                  rows={2}
                  placeholder="Your answer will appear here..."
                  value={transcriptValue}
                  onChange={e => { setTranscriptValue(e.target.value); setManualMode(true); }}
                  disabled={isSpeaking}
                />
                <button
                  className="btn w-full"
                  onClick={() => handleSubmitAnswer(transcriptValue)}
                  disabled={isSpeaking || isListening || !transcriptValue.trim()}
                >
                  Submit Answer
                </button>
              </div>
            </div>
          )}
          {step === "feedback" && (
            <div>
              <h2 className="text-xl font-bold mb-2">Interview Feedback</h2>
              {loading ? (
                <div>Loading feedback...</div>
              ) : (
                <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">{feedback}</pre>
              )}
              <button onClick={handleRestart} className="btn w-full mt-4">Start New Interview</button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 