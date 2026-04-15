import QuizForm from "../components/QuizForm";
import DisplayQuizResults from "../components/DisplayQuizResults";
import useQuiz from "../hooks/useQuiz";
import { questions } from "../data/quizData";

export default function QuizPage() {
  const quiz = useQuiz({ questions });

  return (
    <div className="quiz-page">
      <h1>Vibe Quiz</h1>
      {quiz.result ? (
        <DisplayQuizResults {...quiz} />
      ) : (
        <QuizForm {...quiz} />
      )}
    </div>
  );
}
