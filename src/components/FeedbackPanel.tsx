import React from "react";

export default function FeedbackPanel({ transcript }: { transcript: string }) {
  return (
    <div className="bg-gray-100 p-4 rounded shadow">
      <h3 className="font-semibold mb-2">Interview Feedback</h3>
      <pre className="whitespace-pre-wrap">{transcript}</pre>
    </div>
  );
} 