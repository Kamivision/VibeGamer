import QuizForm from "../components/QuizForm";
import DisplayQuizResults from "../components/DisplayQuizResults";
import useQuiz from "../hooks/useQuiz";
import { questions } from "../data/quizData";
import { useState } from "react";
import { saveQuizResult } from "../utilities";

export default function QuizPage() {
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveError, setSaveError] = useState("");

  async function handleQuizComplete({ answers, vibe }) {
    setSaveStatus("saving");
    setSaveError("");

    try {
      await saveQuizResult({ personality: vibe.name, quizResults: answers });
      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("error");
      setSaveError("We couldn't save your quiz results to your profile.");
      console.error("Failed to save quiz results:", error);
    }
  }

  const quiz = useQuiz({ questions, onComplete: handleQuizComplete });

  function handleRestart() {
    setSaveStatus("idle");
    setSaveError("");
    quiz.restart();
  }

  return (
    <div className="quiz-page">
      <h1>Vibe Quiz</h1>
      {quiz.result ? (
        <DisplayQuizResults
          {...quiz}
          restart={handleRestart}
          saveError={saveError}
          saveStatus={saveStatus}
        />
      ) : (
        <QuizForm {...quiz} />
      )}
    </div>
  );
}
