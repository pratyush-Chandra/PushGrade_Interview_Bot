// Gemini API utility
// (Replace with your actual Gemini API integration)

// Generate interview questions based on user profile
export async function generateInterviewQuestions({ role, experience, technologies, count = 5, roles = [], projects = [] }: {
  role: string;
  experience: string;
  technologies: string[];
  count?: number;
  roles?: string[];
  projects?: string[];
}) {
  // Simulate Gemini API call
  let extra = "";
  if (roles.length > 0) {
    extra += `\nThe candidate has held these roles: ${roles.join(", ")}.`;
  }
  if (projects.length > 0) {
    extra += `\nThe candidate has worked on these projects: ${projects.join(", ")}. Please include at least 2 questions specifically about their projects.`;
  }
  const prompt = `Generate ${count} realistic mock interview questions for a ${role} with ${experience} experience. Focus on these technologies: ${technologies.join(", ")}.${extra}\nFormat as a numbered list.`;
  // Replace with actual Gemini API call
  return [
    "1. Tell me about a challenging project you worked on.",
    "2. How did you use your skills in one of your listed projects?",
    "3. What technologies did you use in your last role?",
    "4. How do you approach problem-solving in a team?",
    "5. Can you describe a time you overcame a technical obstacle?"
  ];
}

// Analyze interview transcript for feedback
export async function analyzeInterviewFeedback({ transcript }: { transcript: string }) {
  // Simulate Gemini feedback
  return `Technical Knowledge: 8/10\nCommunication: 7/10\nConfidence: 8/10\nProblem Solving: 9/10\n\nGreat job! You demonstrated strong technical skills and clear communication. Keep practicing for even more confidence!`;
} 