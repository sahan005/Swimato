"use client";

import React, { useState } from "react";
import { TallyMarks } from "./TallyMarks";
import { Trophy, Flame, DollarSign, Calendar, ArrowUpDown, Award, ShoppingBag } from "lucide-react";

interface UserRanking {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarEmoji: string;
  };
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  platforms: {
    ZOMATO: { count: number; amount: number };
    SWIGGY: { count: number; amount: number };
    LOCAL: { count: number; amount: number };
    OTHER: { count: number; amount: number };
  };
  favoritePlatform: string;
  streakDays: number;
}

interface LeaderboardData {
  selectedMonth: string;
  currentMonthKey: string;
  availableMonths: string[];
  rankedByCount: UserRanking[];
  rankedBySpend: UserRanking[];
  foodieOfTheMonth: UserRanking | null;
  bigSpender: UserRanking | null;
  groupTotalOrders: number;
  groupTotalSpend: number;
}

interface LeaderboardViewProps {
  data: LeaderboardData | null;
  isLoading: boolean;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onOpenOrderModal: () => void;
  currentUserId?: string;
}

export function LeaderboardView({
  data,
  isLoading,
  selectedMonth,
  onMonthChange,
  onOpenOrderModal,
  currentUserId,
}: LeaderboardViewProps) {
  const [rankingMode, setRankingMode] = useState<"count" | "spend">("count");

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 px-4 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#C1432E] border-t-transparent rounded-full animate-spin" />
        <p className="font-mono-receipt text-sm text-neutral-400">PRINTING CANTEEN TALLY TAPE...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 px-4 text-center">
        <p className="text-neutral-400 font-mono-receipt">No leaderboard data found.</p>
      </div>
    );
  }

  const rankings = rankingMode === "count" ? data.rankedByCount : data.rankedBySpend;

  // Format month name for display e.g. "AUGUST 2025"
  const formatMonthLabel = (key: string) => {
    if (key === "all") return "ALL TIME BOARD";
    const [year, month] = key.split("-");
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase();
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Control Bar: Month Selector & Sort Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1B1B1B] p-3 sm:p-4 rounded-xl border border-neutral-800 shadow-md">
        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#E3A008]" />
          <span className="text-xs font-mono-receipt text-neutral-400 uppercase">TIMEFRAME:</span>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-[#262626] text-[#F5F2EC] text-xs sm:text-sm font-mono-receipt font-bold px-3 py-1.5 rounded-lg border border-neutral-700 focus:outline-none focus:border-[#C1432E]"
          >
            {data.availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonthLabel(m)} {m === data.currentMonthKey ? "(ACTIVE)" : ""}
              </option>
            ))}
            <option value="all">ALL-TIME ARCHIVE</option>
          </select>
        </div>

        {/* Ranking Sort Toggle */}
        <div className="inline-flex bg-[#262626] p-1 rounded-lg border border-neutral-700">
          <button
            onClick={() => setRankingMode("count")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono-receipt font-bold transition flex items-center gap-1.5 ${
              rankingMode === "count"
                ? "bg-[#C1432E] text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>BY ORDER COUNT</span>
          </button>
          <button
            onClick={() => setRankingMode("spend")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono-receipt font-bold transition flex items-center gap-1.5 ${
              rankingMode === "spend"
                ? "bg-[#E3A008] text-[#1B1B1B] shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>BY AMOUNT SPENT</span>
          </button>
        </div>
      </div>

      {/* Featured Award Badges for Month Leaders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Foodie of the Month (#1 Count) */}
        {data.foodieOfTheMonth && data.foodieOfTheMonth.orderCount > 0 && (
          <div className="bg-[#241F1D] border-2 border-[#C1432E]/50 rounded-xl p-4 flex items-center gap-3.5 shadow-md relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-[#C1432E]/20 text-[#C1432E] border border-[#C1432E]/40 flex items-center justify-center text-2xl flex-shrink-0">
              👑
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono-receipt uppercase tracking-widest text-[#C1432E] font-bold">
                  FOODIE OF THE MONTH
                </span>
              </div>
              <p className="font-display font-black text-xl text-[#F5F2EC] truncate">
                {data.foodieOfTheMonth.user.avatarEmoji} {data.foodieOfTheMonth.user.displayName}
              </p>
              <p className="text-xs font-mono-receipt text-neutral-400">
                {data.foodieOfTheMonth.orderCount} orders logged (₹{data.foodieOfTheMonth.totalSpent.toLocaleString()})
              </p>
            </div>
          </div>
        )}

        {/* Big Spender (#1 Spend) */}
        {data.bigSpender && data.bigSpender.totalSpent > 0 && (
          <div className="bg-[#24211A] border-2 border-[#E3A008]/50 rounded-xl p-4 flex items-center gap-3.5 shadow-md relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-[#E3A008]/20 text-[#E3A008] border border-[#E3A008]/40 flex items-center justify-center text-2xl flex-shrink-0">
              💸
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono-receipt uppercase tracking-widest text-[#E3A008] font-bold">
                  BIG SPENDER OF THE MONTH
                </span>
              </div>
              <p className="font-display font-black text-xl text-[#F5F2EC] truncate">
                {data.bigSpender.user.avatarEmoji} {data.bigSpender.user.displayName}
              </p>
              <p className="text-xs font-mono-receipt text-neutral-400">
                ₹{data.bigSpender.totalSpent.toLocaleString()} spent ({data.bigSpender.orderCount} orders)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Centerpiece: The Canteen Thermal Receipt Strip */}
      <div className="bg-[#F5F2EC] text-[#1B1B1B] rounded-xl shadow-2xl overflow-hidden border-2 border-[#1B1B1B] receipt-sawtooth-top receipt-sawtooth-bottom pt-5 pb-6">
        {/* Receipt Header */}
        <div className="px-6 pb-4 border-b-2 border-dashed border-[#1B1B1B]/30 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xl">🧾</span>
            <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-wider text-[#1B1B1B]">
              CANTEEN TALLY SCOREBOARD
            </h1>
          </div>
          <p className="font-mono-receipt text-xs text-neutral-600 tracking-wider">
            {formatMonthLabel(selectedMonth)} • OFFICIAL GROUP RIVALRY TAPE
          </p>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs font-mono-receipt text-neutral-700 bg-white/70 py-1.5 px-4 rounded-lg border border-neutral-300 max-w-sm mx-auto">
            <span>GROUP ORDERS: <strong className="text-[#C1432E]">{data.groupTotalOrders}</strong></span>
            <span>TOTAL BILL: <strong className="text-[#1B1B1B]">₹{data.groupTotalSpend.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Receipt Column Headers */}
        <div className="grid grid-cols-12 px-5 py-2.5 bg-neutral-200/60 text-neutral-600 font-mono-receipt text-[11px] font-bold uppercase tracking-wider border-b border-neutral-300">
          <div className="col-span-2 sm:col-span-1 text-center">RANK</div>
          <div className="col-span-6 sm:col-span-7">FRIEND / PLATFORM BREAKDOWN</div>
          <div className="col-span-4 sm:col-span-4 text-right">TALLY & TOTAL</div>
        </div>

        {/* Receipt Line Items */}
        <div className="divide-y divide-dashed divide-neutral-300">
          {rankings.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 mx-auto text-neutral-400" />
              <p className="font-display font-bold text-lg text-neutral-700">No orders recorded for this month yet</p>
              <p className="font-mono-receipt text-xs text-neutral-500 max-w-sm mx-auto">
                Log your first food delivery order to start the monthly scoreboard!
              </p>
              <button
                onClick={onOpenOrderModal}
                className="mt-2 inline-flex items-center gap-2 bg-[#C1432E] hover:bg-[#A83824] text-white px-4 py-2 rounded-lg font-mono-receipt text-xs font-bold transition shadow-sm"
              >
                + LOG AN ORDER
              </button>
            </div>
          ) : (
            rankings.map((item, index) => {
              const isTop1 = index === 0;
              const isTop2 = index === 1;
              const isTop3 = index === 2;
              const isMe = item.user.id === currentUserId;

              let rankBadge = `#${index + 1}`;
              let rankColor = "text-[#1B1B1B]";
              if (isTop1) {
                rankBadge = "🥇 #1";
                rankColor = "text-[#C1432E]";
              } else if (isTop2) {
                rankBadge = "🥈 #2";
                rankColor = "text-[#E3A008]";
              } else if (isTop3) {
                rankBadge = "🥉 #3";
                rankColor = "text-[#5B6B4F]";
              }

              return (
                <div
                  key={item.user.id}
                  className={`grid grid-cols-12 px-4 sm:px-6 py-4 items-center transition-colors ${
                    isMe ? "bg-amber-50/70" : "hover:bg-white/50"
                  }`}
                >
                  {/* 1. Left: Big Condensed Scoreboard Rank */}
                  <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center">
                    <span className={`font-display font-black text-2xl sm:text-3xl leading-none ${rankColor}`}>
                      {rankBadge}
                    </span>
                    {item.streakDays > 1 && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] font-mono-receipt text-orange-600 font-bold mt-1"
                        title={`${item.streakDays} day order streak!`}
                      >
                        <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                        {item.streakDays}d
                      </span>
                    )}
                  </div>

                  {/* 2. Middle: Name, Avatars, Titles, Platform Breakdown Chips */}
                  <div className="col-span-6 sm:col-span-7 pl-2 sm:pl-3 pr-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{item.user.avatarEmoji}</span>
                      <span className="font-display font-black text-lg sm:text-2xl text-[#1B1B1B] truncate">
                        {item.user.displayName}
                      </span>
                      {isMe && (
                        <span className="text-[10px] bg-[#1B1B1B] text-white px-1.5 py-0.5 rounded font-mono-receipt uppercase">
                          YOU
                        </span>
                      )}
                    </div>

                    {/* Platform breakdown chips */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px] font-mono-receipt">
                      {item.platforms.ZOMATO.count > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100/80 text-red-800 border border-red-200">
                          <span>🍕 Zomato:</span>
                          <strong>{item.platforms.ZOMATO.count}</strong>
                        </span>
                      )}
                      {item.platforms.SWIGGY.count > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-100/80 text-orange-800 border border-orange-200">
                          <span>🍔 Swiggy:</span>
                          <strong>{item.platforms.SWIGGY.count}</strong>
                        </span>
                      )}
                      {item.platforms.LOCAL.count > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-200/80 text-stone-800 border border-stone-300">
                          <span>🥡 Local:</span>
                          <strong>{item.platforms.LOCAL.count}</strong>
                        </span>
                      )}
                      {item.platforms.OTHER.count > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-200 text-neutral-800 border border-neutral-300">
                          <span>📦 Other:</span>
                          <strong>{item.platforms.OTHER.count}</strong>
                        </span>
                      )}
                      {item.orderCount === 0 && (
                        <span className="text-xs text-neutral-400 italic">No orders logged this month</span>
                      )}
                    </div>
                  </div>

                  {/* 3. Right: Literal Tally Marks & Total Amount */}
                  <div className="col-span-4 sm:col-span-4 text-right flex flex-col items-end justify-center">
                    {/* Total Amount Monospace */}
                    <div className="font-mono-receipt font-black text-lg sm:text-2xl text-[#1B1B1B]">
                      ₹{item.totalSpent.toLocaleString()}
                    </div>

                    {/* SVG Tally marks */}
                    <div className="mt-1 flex items-center justify-end">
                      <TallyMarks count={item.orderCount} color="#1B1B1B" />
                    </div>

                    {item.orderCount > 0 && (
                      <span className="text-[10px] font-mono-receipt text-neutral-500 mt-0.5">
                        Avg: ₹{item.averageOrderValue}/order
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Receipt Bottom Summary / Barcode */}
        <div className="mt-6 px-6 pt-4 border-t-2 border-dashed border-[#1B1B1B]/30 text-center">
          <div className="flex justify-center my-2 space-x-1">
            {/* Fake thermal barcode stripes */}
            {[4, 2, 8, 1, 6, 3, 2, 7, 3, 5, 2, 8, 3, 2, 6, 2, 4, 7, 3, 5, 2, 8, 4].map((w, idx) => (
              <div
                key={idx}
                className="bg-[#1B1B1B] h-7"
                style={{ width: `${w * 2}px` }}
              />
            ))}
          </div>
          <p className="font-mono-receipt text-[11px] text-neutral-500">
            * * * ORDERWARS • NO TAKEBACKS • TRACK EVERY BITE * * *
          </p>
        </div>
      </div>
    </div>
  );
}
