import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AuthForm from "../components/AuthForm";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { setUser } = useOutletContext();
  const navigate = useNavigate();

  function handleAuthSuccess(authenticatedUser) {
    setUser(authenticatedUser);
    navigate("/");
  }

  function toggleForm() {
    setIsSignUp((current) => !current);
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <AuthForm 
      mode={isSignUp ? "signup" : "signin"} 
      onAuthSuccess={handleAuthSuccess} 
      />

      <button type="button" onClick={toggleForm} className="mt-4 text-sm underline">
        {isSignUp
          ? "Already have an account? Sign In"
          : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
}