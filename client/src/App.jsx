import { useState } from "react";
import { Outlet, useLoaderData } from "react-router-dom";
import NavBar from "./components/NavBar";

export default function App() {
  const initialUser = useLoaderData();
  const [user, setUser] = useState(initialUser);

  return (
    <div className="bg-[url('/src/assets/image.png')] bg-center bg-repeat">
      <NavBar user={user} setUser={setUser} />
      <main className="mx-auto mt-8 w-full max-w-6xl rounded-lg bg-white px-4 shadow-lg">
        <Outlet context={{ user, setUser }} />
      </main>
    </div>
  );
}
