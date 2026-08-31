"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Award, PieChart as PieIcon, TrendingUp, Sparkles } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

interface LeaderboardData {
  rankedByCount: any[];
  rankedBySpend: any[];
  foodieOfTheMonth: any;
  bigSpender: any;
  availableMonths: string[];
}

interface HallOfFameProps {
  currentLeaderboard: LeaderboardData | null;
}

export function HallOfFameView({ currentLeaderboard }: HallOfFameProps) {
  const [platformData, setPlatformData] = useState<any[]>([]);
  const [userSpendData, setUserSpendData] = useState<any[]>([]);

  useEffect(() => {
    if (currentLeaderboard?.rankedBySpend) {
      // Aggregate platform distribution
      let zCount = 0,
        sCount = 0,
        lCount = 0,
        oCount = 0;
      for (const u of currentLeaderboard.rankedBySpend) {
        zCount += u.platforms.ZOMATO.count;
        sCount += u.platforms.SWIGGY.count;
        lCount += u.platforms.LOCAL.count;
        oCount += u.platforms.OTHER.count;
      }

      setPlatformData([
        { name: "Zomato", value: zCount, color: "#E23744" },
        { name: "Swiggy", value: sCount, color: "#FC8019" },
        { name: "Local Takeaway", value: lCount, color: "#5B6B4F" },
        { name: "Other / Quick", value: oCount, color: "#8E8E93" },
      ]);

      // User spend breakdown
      setUserSpendData(
        currentLeaderboard.rankedBySpend.map((u) => ({
          name: u.user.displayName.split(" ")[0],
          spend: u.totalSpent,
          orders: u.orderCount,
        }))
      );
    }
  }, [currentLeaderboard]);

  const COLORS = ["#E23744", "#FC8019", "#5B6B4F", "#8E8E93"];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Hall of Fame Header */}
      <div className="bg-[#1B1B1B] p-5 rounded-xl border border-neutral-800 shadow-md text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#E3A008]/20 border border-[#E3A008]/40 mb-3">
          <Trophy className="w-8 h-8 text-[#E3A008]" />
        </div>
        <h2 className="font-display font-black text-3xl text-[#F5F2EC] uppercase tracking-wider">
          HALL OF FAME & WAR ANALYTICS
        </h2>
        <p className="font-mono-receipt text-xs text-neutral-400 max-w-md mx-auto mt-1">
          CELEBRATING HISTORICAL TITLES, RECORD STREAKS, AND GROUP DINING METRICS
        </p>
      </div>

      {/* Trophies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Crown 1 */}
        <div className="bg-gradient-to-br from-[#241F1D] to-[#1B1B1B] border-2 border-[#C1432E]/60 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-3xl">👑</span>
            <span className="px-2.5 py-0.5 rounded bg-[#C1432E]/20 text-[#C1432E] text-[10px] font-mono-receipt font-bold uppercase">
              HIGHEST VOLUME
            </span>
          </div>
          <h3 className="font-display font-black text-2xl text-[#F5F2EC] mt-3">
            FOODIE OF THE MONTH
          </h3>
          <p className="text-xs text-neutral-400 font-sans-ui mt-1">
            Awarded to the squad member who logged the absolute highest number of deliveries.
          </p>
          {currentLeaderboard?.foodieOfTheMonth && (
            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
              <span className="font-display font-bold text-lg text-[#F5F2EC]">
                {currentLeaderboard.foodieOfTheMonth.user.avatarEmoji}{" "}
                {currentLeaderboard.foodieOfTheMonth.user.displayName}
              </span>
              <span className="font-mono-receipt font-black text-sm text-[#C1432E]">
                {currentLeaderboard.foodieOfTheMonth.orderCount} Orders
              </span>
            </div>
          )}
        </div>

        {/* Crown 2 */}
        <div className="bg-gradient-to-br from-[#24211A] to-[#1B1B1B] border-2 border-[#E3A008]/60 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-3xl">💸</span>
            <span className="px-2.5 py-0.5 rounded bg-[#E3A008]/20 text-[#E3A008] text-[10px] font-mono-receipt font-bold uppercase">
              HIGHEST EXPENDITURE
            </span>
          </div>
          <h3 className="font-display font-black text-2xl text-[#F5F2EC] mt-3">
            BIG SPENDER OF THE MONTH
          </h3>
          <p className="text-xs text-neutral-400 font-sans-ui mt-1">
            Awarded to the biggest wallet burner who ran up the highest total food delivery bill.
          </p>
          {currentLeaderboard?.bigSpender && (
            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
              <span className="font-display font-bold text-lg text-[#F5F2EC]">
                {currentLeaderboard.bigSpender.user.avatarEmoji}{" "}
                {currentLeaderboard.bigSpender.user.displayName}
              </span>
              <span className="font-mono-receipt font-black text-sm text-[#E3A008]">
                ₹{currentLeaderboard.bigSpender.totalSpent.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Platform Share Pie */}
        <div className="bg-[#1B1B1B] p-5 rounded-xl border border-neutral-800 shadow-md">
          <h4 className="font-display font-bold text-lg text-[#F5F2EC] uppercase tracking-wider mb-2 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#C1432E]" />
            <span>Platform Battle Share</span>
          </h4>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#262626",
                    borderColor: "#444",
                    borderRadius: "8px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap text-xs font-mono-receipt mt-2">
            {platformData.map((p) => (
              <span key={p.name} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span>{p.name}: {p.value}</span>
              </span>
            ))}
          </div>
        </div>

        {/* User Spending Distribution Bar Chart */}
        <div className="bg-[#1B1B1B] p-5 rounded-xl border border-neutral-800 shadow-md">
          <h4 className="font-display font-bold text-lg text-[#F5F2EC] uppercase tracking-wider mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#E3A008]" />
            <span>Total Spend By Friend (₹)</span>
          </h4>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userSpendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke="#737373"
                  tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
                />
                <YAxis
                  stroke="#737373"
                  tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#262626",
                    borderColor: "#444",
                    borderRadius: "8px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Spend"]}
                />
                <Bar dataKey="spend" fill="#C1432E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] font-mono-receipt text-neutral-500 text-center mt-2">
            Sorted by total food bill in active cycle
          </p>
        </div>
      </div>
    </div>
  );
}
