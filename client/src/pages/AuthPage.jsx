import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { keepSession } from "../utilities";
import steamLogo from "../assets/steam_logo.png";

const steamEnabled = false;

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

  async function handleSteamLogin() {
    try {
      const response = await fetch("/api/v1/users/steam/login/");
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.redirect_url;
      }
    } catch (error) {
      console.error("Steam login failed:", error);
    }
  }

  async function handleGitHubLogin() {
    try {
      const frontendRedirectUri = `${window.location.origin}/auth`;
      const response = await fetch(
        `/api/v1/users/github/login/?redirect_uri=${encodeURIComponent(frontendRedirectUri)}`
      );

      if (!response.ok) {
        console.error("GitHub login could not start.");
        return;
      }

      const data = await response.json();
      window.location.href = data.redirect_url;
    } catch (error) {
      console.error("GitHub login failed:", error);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      const username = params.get("username") || params.get("steam_username") || "OAuth User";
      const email = params.get("email") || "";

      keepSession(token);
      setUser({ username, email });
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate("/");
    }
  }, [navigate, setUser]); 
      

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
      <p className="my-4 text-center text-gray-600">or</p>
      <button
        type="button"
        onClick={handleGitHubLogin}
        className="w-full rounded bg-gray-900 px-4 py-2 text-white font-semibold transition-opacity hover:opacity-90"
      >
        Sign In with GitHub
      </button>
      <button
        type="button"
        onClick={handleSteamLogin}
        disabled={!steamEnabled}
        className="mt-4 w-full rounded px-4 py-2 text-white font-semibold flex items-center justify-center gap-2 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: "linear-gradient(to bottom, #1c80a7, #182c42)",
        }}
      >
        <img src={steamLogo} alt="Steam" className="h-5 w-5" />
        Sign In with Steam
      </button>
      {!steamEnabled ? (
        <p className="mt-2 text-center text-sm text-gray-500">
          Steam sign-in is temporarily disabled in local development and will be enabled after deployment.
        </p>
      ) : null}
    </div>
  );
}
