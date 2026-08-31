"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, Plus, MessageSquare, Check, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderAdded: (order: any) => void;
  initialOrder?: any; // For editing
}

export function OrderModal({ isOpen, onClose, onOrderAdded, initialOrder }: OrderModalProps) {
  const [platform, setPlatform] = useState<string>(initialOrder?.platform || "ZOMATO");
  const [amount, setAmount] = useState<string>(initialOrder ? String(initialOrder.amount) : "");
  const [note, setNote] = useState<string>(initialOrder?.note || "");
  const [showNote, setShowNote] = useState<boolean>(!!initialOrder?.note);
  const [dateType, setDateType] = useState<"today" | "yesterday" | "custom">(
    initialOrder ? "custom" : "today"
  );
  const [customDate, setCustomDate] = useState<string>(
    initialOrder
      ? new Date(initialOrder.orderedAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPunched, setIsPunched] = useState(false);

  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialOrder) {
        setPlatform(initialOrder.platform);
        setAmount(String(initialOrder.amount));
        setNote(initialOrder.note || "");
        setShowNote(!!initialOrder.note);
        setDateType("custom");
        setCustomDate(new Date(initialOrder.orderedAt).toISOString().slice(0, 16));
      } else {
        setPlatform("ZOMATO");
        setAmount("");
        setNote("");
        setShowNote(false);
        setDateType("today");
        setCustomDate(new Date().toISOString().slice(0, 16));
      }
      setError(null);
      setIsPunched(false);

      // Auto-focus amount input for <10s lightning logging
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialOrder]);

  if (!isOpen) return null;

  // Synthesize tactile punch audio using Web Audio API
  const playPunchSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Audio context may be restricted by browser policy
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount (e.g. 350)");
      amountInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setIsPunched(true);
    playPunchSound();

    let targetDate = new Date();
    if (dateType === "yesterday") {
      targetDate.setDate(targetDate.getDate() - 1);
    } else if (dateType === "custom") {
      targetDate = new Date(customDate);
    }

    try {
      const url = initialOrder ? `/api/orders/${initialOrder.id}` : "/api/orders";
      const method = initialOrder ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          amount: numAmount,
          note: note.trim() || null,
          orderedAt: targetDate.toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to log order");
      }

      if (numAmount >= 1000) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#C1432E", "#E3A008", "#F5F2EC"],
        });
      }

      onOrderAdded(data.order);
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      setIsPunched(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const platforms = [
    { id: "ZOMATO", name: "Zomato", emoji: "🍕", bg: "bg-[#E23744]", activeRing: "ring-[#E23744]" },
    { id: "SWIGGY", name: "Swiggy", emoji: "🍔", bg: "bg-[#FC8019]", activeRing: "ring-[#FC8019]" },
    { id: "LOCAL", name: "Local Takeaway", emoji: "🥡", bg: "bg-[#5B6B4F]", activeRing: "ring-[#5B6B4F]" },
    { id: "OTHER", name: "Other / Blinkit", emoji: "📦", bg: "bg-[#333333]", activeRing: "ring-neutral-400" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-lg bg-[#F5F2EC] text-[#1B1B1B] rounded-t-2xl sm:rounded-2xl shadow-2xl border-2 border-[#1B1B1B] overflow-hidden flex flex-col max-h-[92vh] receipt-sawtooth-top sm:receipt-sawtooth-none transition-transform"
        role="dialog"
        aria-modal="true"
      >
        {/* Receipt Header Header */}
        <div className="bg-[#1B1B1B] text-[#F5F2EC] px-6 py-4 flex items-center justify-between border-b-2 border-dashed border-[#F5F2EC]/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#C1432E] animate-ping" />
              <h2 className="font-display font-black text-2xl tracking-wider uppercase">
                {initialOrder ? "Edit Order Entry" : "Punch Food Order"}
              </h2>
            </div>
            <p className="text-xs text-neutral-400 font-mono-receipt mt-0.5">
              RECEIPT NO. #{Math.floor(100000 + Math.random() * 900000)} • FOOD WAR LOG
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-100 border-l-4 border-[#C1432E] text-red-900 text-xs font-medium rounded">
              {error}
            </div>
          )}

          {/* 1. Platform selector — 4 Large Tappable buttons (1-tap, no dropdown) */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2 font-mono-receipt">
              1. Select Platform
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {platforms.map((p) => {
                const isSelected = platform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={`relative flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? `border-[#1B1B1B] bg-white shadow-[0_4px_0_#1B1B1B] -translate-y-0.5 ring-2 ${p.activeRing}`
                        : "border-neutral-300 bg-white/60 hover:bg-white/90 opacity-80"
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{p.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <span className="block font-display font-black text-lg sm:text-xl text-[#1B1B1B] leading-none truncate">
                        {p.name}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#1B1B1B] text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Amount Input — Large monospace receipt typography, auto-focused */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2 font-mono-receipt">
              2. Order Amount (₹)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="font-mono-receipt text-2xl sm:text-3xl font-bold text-[#C1432E]">
                  ₹
                </span>
              </div>
              <input
                ref={amountInputRef}
                type="number"
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
                className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-white border-2 border-[#1B1B1B] rounded-xl text-3xl sm:text-4xl font-mono-receipt font-bold text-[#1B1B1B] placeholder-neutral-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-4 focus:ring-[#C1432E]/20"
              />
            </div>
          </div>

          {/* 3. Date Selection — Quick Pill toggles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider font-mono-receipt">
                3. Order Date
              </label>
              {dateType === "custom" && (
                <span className="text-xs text-neutral-500 font-mono-receipt">Custom Date</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDateType("today")}
                className={`py-2 px-3 text-xs font-bold uppercase rounded-lg border-2 transition ${
                  dateType === "today"
                    ? "bg-[#1B1B1B] text-white border-[#1B1B1B]"
                    : "bg-white/80 border-neutral-300 text-neutral-700 hover:bg-white"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDateType("yesterday")}
                className={`py-2 px-3 text-xs font-bold uppercase rounded-lg border-2 transition ${
                  dateType === "yesterday"
                    ? "bg-[#1B1B1B] text-white border-[#1B1B1B]"
                    : "bg-white/80 border-neutral-300 text-neutral-700 hover:bg-white"
                }`}
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => setDateType("custom")}
                className={`py-2 px-3 text-xs font-bold uppercase rounded-lg border-2 flex items-center justify-center gap-1.5 transition ${
                  dateType === "custom"
                    ? "bg-[#1B1B1B] text-white border-[#1B1B1B]"
                    : "bg-white/80 border-neutral-300 text-neutral-700 hover:bg-white"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Other
              </button>
            </div>

            {dateType === "custom" && (
              <div className="mt-2">
                <input
                  type="datetime-local"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full p-2.5 text-xs font-mono-receipt bg-white border-2 border-neutral-400 rounded-lg focus:outline-none focus:border-[#1B1B1B]"
                />
              </div>
            )}
          </div>

          {/* 4. Optional Note Field — Collapsed by default */}
          <div>
            {!showNote ? (
              <button
                type="button"
                onClick={() => setShowNote(true)}
                className="text-xs text-neutral-600 hover:text-[#C1432E] font-medium flex items-center gap-1.5 transition py-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add item note (e.g. Butter chicken & garlic naan)</span>
              </button>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider font-mono-receipt flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Item / Craving Note
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNote(false);
                      setNote("");
                    }}
                    className="text-[11px] text-neutral-400 hover:text-neutral-700"
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Midnight Shawarma & Thums Up"
                  maxLength={120}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-neutral-300 rounded-xl focus:outline-none focus:border-[#1B1B1B]"
                />
              </div>
            )}
          </div>

          {/* Dashed line separator */}
          <div className="border-b-2 border-dashed border-[#1B1B1B]/20 pt-1" />

          {/* Tactile Punch Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-xl font-display font-black text-2xl tracking-wider uppercase text-white shadow-[0_6px_0_#802214] active:shadow-[0_2px_0_#802214] active:translate-y-1 transition-all flex items-center justify-center gap-3 ${
              isPunched ? "animate-punch bg-[#802214]" : "bg-[#C1432E] hover:bg-[#B03824]"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                PRINTING TALLY...
              </span>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>{initialOrder ? "UPDATE RECEIPT" : "PUNCH & LOG ORDER"}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
