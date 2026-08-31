"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Utensils, Lock, User, Sparkles, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🍕");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const emojis = ["🍕", "🍔", "🍛", "🥟", "🍜", "🌮", "🍣", "🍦", "☕", "🍗"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (isRegistering) {
      // Sign up flow
      try {
        const regRes = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.trim().toLowerCase(),
            password,
            displayName: displayName.trim(),
            avatarEmoji,
          }),
        });

        const regData = await regRes.json();
        if (!regRes.ok) {
          throw new Error(regData.error || "Failed to register account");
        }

        // Automatic sign in after successful registration
        const loginRes = await signIn("credentials", {
          redirect: false,
          username: username.trim().toLowerCase(),
          password,
        });

        if (loginRes?.error) {
          throw new Error("Account created! Please sign in with your credentials.");
        } else {
          router.push("/");
          router.refresh();
        }
      } catch (err: any) {
        setError(err.message || "Registration failed.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Login flow
      try {
        const res = await signIn("credentials", {
          redirect: false,
          username: username.trim().toLowerCase(),
          password,
        });

        if (res?.error) {
          setError("Invalid username or password.");
        } else {
          router.push("/");
          router.refresh();
        }
      } catch {
        setError("Failed to sign in. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#121212] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#C1432E] text-white font-display font-black text-3xl shadow-[0_4px_0_#802214]">
            OW
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-wider text-[#F5F2EC]">
            ORDERWARS
          </h1>
          <p className="font-mono-receipt text-xs text-neutral-400 uppercase tracking-widest">
            CANTEEN TALLY & FOOD ORDER RIVALRY
          </p>
        </div>

        {/* Canteen Punch Card Box */}
        <div className="bg-[#F5F2EC] text-[#1B1B1B] rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-[#1B1B1B] receipt-sawtooth-top">
          <div className="flex items-center justify-between border-b-2 border-dashed border-[#1B1B1B]/20 pb-3 mb-5">
            <h2 className="font-display font-black text-2xl uppercase tracking-wide text-[#1B1B1B]">
              {isRegistering ? "NEW SQUAD MEMBER" : "PUNCH CARD SIGN IN"}
            </h2>
            <span className="font-mono-receipt text-xs text-[#C1432E] font-bold">
              {isRegistering ? "STEP 1/1" : "MEMBER ACCESS"}
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border-l-4 border-[#C1432E] text-red-900 text-xs font-semibold rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider font-mono-receipt mb-1">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. rohan"
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-neutral-300 rounded-xl font-mono-receipt text-sm text-[#1B1B1B] focus:outline-none focus:border-[#1B1B1B]"
                />
              </div>
            </div>

            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider font-mono-receipt mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Rohan (Zomato Pro)"
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-neutral-300 rounded-xl font-sans-ui text-sm text-[#1B1B1B] focus:outline-none focus:border-[#1B1B1B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider font-mono-receipt mb-1.5">
                    Choose Food Avatar
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAvatarEmoji(emoji)}
                        className={`text-2xl p-2 rounded-xl border-2 transition ${
                          avatarEmoji === emoji
                            ? "bg-white border-[#1B1B1B] shadow-[0_2px_0_#1B1B1B] scale-110"
                            : "border-transparent hover:bg-neutral-200"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider font-mono-receipt mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-white border-2 border-neutral-300 rounded-xl font-mono-receipt text-sm text-[#1B1B1B] focus:outline-none focus:border-[#1B1B1B]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-[#C1432E] hover:bg-[#A13320] text-white font-display font-black text-xl tracking-wider uppercase rounded-xl shadow-[0_4px_0_#802214] active:shadow-[0_1px_0_#802214] active:translate-y-1 transition-all disabled:opacity-50"
            >
              {isLoading ? "PROCESSING TAPE..." : isRegistering ? "JOIN THE SQUAD" : "PUNCH IN"}
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className="mt-4 pt-3 border-t border-dashed border-[#1B1B1B]/20 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-xs font-mono-receipt font-bold text-neutral-600 hover:text-[#C1432E] transition"
            >
              {isRegistering
                ? "Already have an account? Sign In"
                : "New around here? Create an Account"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
