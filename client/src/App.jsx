import { useState } from 'react'
import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar'


export default function App() {
  return (
    <div className="bg-[url('/src/assets/image.png')] bg-center bg-repeat">
      <NavBar />
      <main className="mx-auto w-full max-w-6xl px-4 shadow-lg bg-white rounded-lg mt-8">
        <Outlet />
      </main>
    </div>
  );
}
