"use client";

import React from "react";
import { Plus } from "lucide-react";

interface MobileFABProps {
  onClick: () => void;
}

export function MobileFAB({ onClick }: MobileFABProps) {
  return (
    <div className="fixed bottom-5 right-5 sm:hidden z-40">
      <button
        onClick={onClick}
        className="flex items-center justify-center gap-2 bg-[#C1432E] hover:bg-[#A13320] text-white px-5 py-4 rounded-full font-display font-black text-xl tracking-wider uppercase shadow-[0_6px_0_#802214] active:shadow-[0_2px_0_#802214] active:translate-y-1 transition-all border-2 border-white/20 animate-bounce"
        style={{ animationDuration: "2s" }}
        title="Punch Order Fast"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
        <span>PUNCH ORDER</span>
      </button>
    </div>
  );
}
