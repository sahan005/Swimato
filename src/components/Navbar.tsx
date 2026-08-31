"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import { Plus, LogOut, Trophy, UtensilsCrossed, ListOrdered, Radio } from "lucide-react";

interface NavbarProps {
  activeTab: "leaderboard" | "myOrders" | "feed" | "hallOfFame";
  onTabChange: (tab: "leaderboard" | "myOrders" | "feed" | "hallOfFame") => void;
  onOpenOrderModal: () => void;
}

export function Navbar({ activeTab, onTabChange, onOpenOrderModal }: NavbarProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 bg-[#1B1B1B]/95 backdrop-blur-md border-b-2 border-neutral-800 shadow-xl">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand & Tally Logo */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onTabChange("leaderboard")}
            className="cursor-pointer flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#C1432E] text-white flex items-center justify-center font-display font-black text-2xl shadow-[0_3px_0_#802214] group-hover:scale-105 transition-transform">
              OW
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-2xl tracking-wider text-[#F5F2EC] uppercase leading-none">
                  ORDERWARS
                </span>
              </div>
              <span className="text-[10px] font-mono-receipt text-neutral-400 uppercase tracking-wider block">
                CANTEEN RIVALRY TAPE
              </span>
            </div>
          </div>
        </div>

        {/* Big Tactile "+ Log an Order" Punch Button (Always visible on Desktop) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenOrderModal}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-[#C1432E] hover:bg-[#A13320] text-white font-display font-black text-lg tracking-wider uppercase rounded-xl shadow-[0_4px_0_#802214] active:shadow-[0_1px_0_#802214] active:translate-y-1 transition-all"
            title="Log a food delivery order in under 10 seconds"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>+ LOG AN ORDER</span>
          </button>

          {/* User Profile & Logout */}
          {session?.user && (
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
              <div className="flex items-center gap-1.5 bg-[#262626] py-1 px-2.5 rounded-lg border border-neutral-700">
                <span className="text-xl">{session.user.avatarEmoji || "🍕"}</span>
                <span className="hidden md:inline font-display font-bold text-sm text-[#F5F2EC] max-w-[100px] truncate">
                  {session.user.displayName || session.user.name}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-2 text-neutral-400 hover:text-red-400 hover:bg-[#262626] rounded-lg transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between border-t border-neutral-800/80 overflow-x-auto no-scrollbar">
        <nav className="flex space-x-1 py-1">
          <button
            onClick={() => onTabChange("leaderboard")}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono-receipt font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "leaderboard"
                ? "bg-[#262626] text-[#F5F2EC] border-b-2 border-[#C1432E]"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>LEADERBOARD</span>
          </button>

          <button
            onClick={() => onTabChange("myOrders")}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono-receipt font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "myOrders"
                ? "bg-[#262626] text-[#F5F2EC] border-b-2 border-[#C1432E]"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>MY ORDERS</span>
          </button>

          <button
            onClick={() => onTabChange("feed")}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono-receipt font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "feed"
                ? "bg-[#262626] text-[#F5F2EC] border-b-2 border-[#C1432E]"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>DISPATCH WIRE</span>
          </button>

          <button
            onClick={() => onTabChange("hallOfFame")}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono-receipt font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "hallOfFame"
                ? "bg-[#262626] text-[#F5F2EC] border-b-2 border-[#C1432E]"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-[#E3A008]" />
            <span>HALL OF FAME</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
