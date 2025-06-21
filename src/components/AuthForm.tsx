"use client";
import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 border rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">{isLogin ? "Sign In" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
        </button>
        <button type="button" className="btn btn-outline" onClick={handleGoogle} disabled={loading}>
          Continue with Google
        </button>
        {error && <div className="text-red-500">{error}</div>}
      </form>
      <div className="mt-4 text-center">
        {isLogin ? (
          <>
            Don't have an account?{" "}
            <button className="text-blue-600 underline" onClick={() => setIsLogin(false)}>
              Sign Up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button className="text-blue-600 underline" onClick={() => setIsLogin(true)}>
              Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
} 