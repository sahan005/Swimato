"use client";

import React, { useState, useEffect } from "react";
import { TallyMarks } from "./TallyMarks";
import { Trash2, Edit3, Download, Flame, Plus, Clock, Tag } from "lucide-react";

interface Order {
  id: string;
  userId: string;
  platform: string;
  amount: number;
  note: string | null;
  orderedAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarEmoji: string;
  };
}

interface PersonalHistoryProps {
  currentUserId: string;
  onEditOrder: (order: Order) => void;
  onOrderDeleted: (orderId: string) => void;
  onOpenOrderModal: () => void;
  userRankInfo?: {
    rank: number;
    monthSpend: number;
    monthCount: number;
    streakDays: number;
  };
}

export function PersonalHistoryView({
  currentUserId,
  onEditOrder,
  onOrderDeleted,
  onOpenOrderModal,
  userRankInfo,
}: PersonalHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterMode, setFilterMode] = useState<"month" | "all">("month");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMyOrders = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const monthParam = filterMode === "month" ? currentMonthKey : "all";
      const res = await fetch(`/api/orders?userId=${currentUserId}&month=${monthParam}&limit=100`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to load personal history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [currentUserId, filterMode]);

  const handleDelete = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    setDeletingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        onOrderDeleted(orderId);
      }
    } catch (err) {
      console.error("Delete order error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    window.open("/api/export?scope=me", "_blank");
  };

  const platformBadge = (platform: string) => {
    switch (platform) {
      case "ZOMATO":
        return <span className="px-2 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-800 text-xs font-mono-receipt">🍕 Zomato</span>;
      case "SWIGGY":
        return <span className="px-2 py-0.5 rounded bg-orange-900/40 text-orange-300 border border-orange-800 text-xs font-mono-receipt">🍔 Swiggy</span>;
      case "LOCAL":
        return <span className="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-800 text-xs font-mono-receipt">🥡 Local</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs font-mono-receipt">📦 Other</span>;
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Personal Stats Board */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#1B1B1B] p-4 rounded-xl border border-neutral-800 shadow-sm">
          <p className="text-[11px] font-mono-receipt uppercase text-neutral-400">Current Rank</p>
          <p className="font-display font-black text-3xl sm:text-4xl text-[#C1432E] mt-1">
            {userRankInfo?.rank ? `#${userRankInfo.rank}` : "-"}
          </p>
        </div>

        <div className="bg-[#1B1B1B] p-4 rounded-xl border border-neutral-800 shadow-sm">
          <p className="text-[11px] font-mono-receipt uppercase text-neutral-400">This Month Spend</p>
          <p className="font-mono-receipt font-bold text-2xl sm:text-3xl text-[#F5F2EC] mt-1">
            ₹{(userRankInfo?.monthSpend || totalSpent).toLocaleString()}
          </p>
        </div>

        <div className="bg-[#1B1B1B] p-4 rounded-xl border border-neutral-800 shadow-sm">
          <p className="text-[11px] font-mono-receipt uppercase text-neutral-400">This Month Orders</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display font-black text-3xl text-[#E3A008]">
              {userRankInfo?.monthCount || orders.length}
            </span>
            <TallyMarks count={userRankInfo?.monthCount || orders.length} color="#E3A008" />
          </div>
        </div>

        <div className="bg-[#1B1B1B] p-4 rounded-xl border border-neutral-800 shadow-sm">
          <p className="text-[11px] font-mono-receipt uppercase text-neutral-400">Streak Record</p>
          <div className="mt-1 flex items-center gap-1.5 text-orange-400 font-display font-black text-2xl sm:text-3xl">
            <Flame className="w-6 h-6 fill-orange-500 text-orange-500" />
            <span>{userRankInfo?.streakDays || 0} DAYS</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Time filter + CSV Export + Punch Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1B1B1B] p-3 sm:p-4 rounded-xl border border-neutral-800 shadow-sm">
        <div className="inline-flex bg-[#262626] p-1 rounded-lg border border-neutral-700">
          <button
            onClick={() => setFilterMode("month")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono-receipt font-bold transition ${
              filterMode === "month"
                ? "bg-[#C1432E] text-white"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            THIS MONTH
          </button>
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono-receipt font-bold transition ${
              filterMode === "all"
                ? "bg-[#C1432E] text-white"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            ALL TIME ({orders.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333] text-neutral-300 text-xs font-mono-receipt font-bold border border-neutral-700 flex items-center justify-center gap-1.5 transition"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={onOpenOrderModal}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-[#C1432E] hover:bg-[#A13320] text-white text-xs font-display font-black tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>LOG ORDER</span>
          </button>
        </div>
      </div>

      {/* Orders List Container */}
      <div className="bg-[#1B1B1B] rounded-xl border border-neutral-800 shadow-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="font-display font-black text-xl text-[#F5F2EC] tracking-wider uppercase flex items-center gap-2">
            <span>MY ORDER LOGS</span>
            <span className="text-xs font-mono-receipt text-neutral-400 font-normal">
              ({orders.length} total)
            </span>
          </h2>
          <span className="font-mono-receipt font-bold text-sm text-[#E3A008]">
            TOTAL: ₹{totalSpent.toLocaleString()}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-[#C1432E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono-receipt text-xs text-neutral-400">Loading your food entries...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-3xl">🥡</p>
            <p className="font-display font-bold text-lg text-neutral-300">No orders logged in this period</p>
            <p className="text-xs font-mono-receipt text-neutral-500">
              Punch an order in under 10 seconds to join the food war!
            </p>
            <button
              onClick={onOpenOrderModal}
              className="mt-2 px-4 py-2 bg-[#C1432E] text-white font-display font-bold rounded-lg text-sm uppercase tracking-wider"
            >
              + Log Food Order
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/80">
            {orders.map((order) => {
              const dateObj = new Date(order.orderedAt);
              const formattedDate = dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const formattedTime = dateObj.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              });

              return (
                <div
                  key={order.id}
                  className="p-4 hover:bg-neutral-800/40 transition flex items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {platformBadge(order.platform)}
                      <span className="font-mono-receipt text-xs text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formattedDate} at {formattedTime}
                      </span>
                    </div>

                    {order.note && (
                      <p className="text-sm text-neutral-200 font-sans-ui italic break-words">
                        &ldquo;{order.note}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="font-mono-receipt font-black text-xl text-[#F5F2EC]">
                      ₹{order.amount.toLocaleString()}
                    </span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditOrder(order)}
                        className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
                        title="Edit order"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        disabled={deletingId === order.id}
                        className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition disabled:opacity-50"
                        title="Delete order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
