import { useState } from "react";
import { handleSignIn } from "../utilities";

export default function SignInForm({ onSignIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    try {
      const authenticatedUser = await handleSignIn({ email, password });

      if (authenticatedUser) {
        onSignIn(authenticatedUser);
        return;
      }

      setErrorMessage("Unable to sign in.");
    } catch (error) {
      setErrorMessage("Invalid email or password.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Sign In</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        className="rounded border p-2"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        className="rounded border p-2"
      />

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <button type="submit" className="rounded bg-cyan-500 p-2 text-white">
        Sign In
      </button>
    </form>
  );
}
