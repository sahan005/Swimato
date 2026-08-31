"use client";

import React, { useState } from "react";
import { Clock, MessageSquare, Plus, Sparkles, Send } from "lucide-react";

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  user: {
    id: string;
    displayName: string;
  };
}

interface OrderFeedItem {
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
  reactions: Reaction[];
}

interface ActivityFeedViewProps {
  orders: OrderFeedItem[];
  isLoading: boolean;
  currentUserId?: string;
  onReactionToggle: (orderId: string, emoji: string) => void;
  onOpenOrderModal: () => void;
}

export function ActivityFeedView({
  orders,
  isLoading,
  currentUserId,
  onReactionToggle,
  onOpenOrderModal,
}: ActivityFeedViewProps) {
  const [activePickerId, setActivePickerId] = useState<string | null>(null);

  const availableEmojis = ["🔥", "🤤", "💸", "🍕", "💀", "❤️"];

  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHour / 24);

    if (diffDays > 0) return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    if (diffHour > 0) return `${diffHour}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return "just now";
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case "ZOMATO":
        return { name: "Zomato", emoji: "🍕", color: "text-red-400" };
      case "SWIGGY":
        return { name: "Swiggy", emoji: "🍔", color: "text-orange-400" };
      case "LOCAL":
        return { name: "Local Takeaway", emoji: "🥡", color: "text-emerald-400" };
      default:
        return { name: "Delivery", emoji: "📦", color: "text-neutral-400" };
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1B1B1B] p-4 rounded-xl border border-neutral-800 flex items-center justify-between shadow-md">
        <div>
          <h2 className="font-display font-black text-2xl text-[#F5F2EC] tracking-wider uppercase flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>CANTEEN DISPATCH WIRE</span>
          </h2>
          <p className="text-xs font-mono-receipt text-neutral-400 mt-0.5">
            LIVE FEED OF EVERY MEAL & MIDNIGHT SNACK PUNCHED
          </p>
        </div>
        <button
          onClick={onOpenOrderModal}
          className="px-3.5 py-2 bg-[#C1432E] hover:bg-[#A13320] text-white text-xs font-display font-black tracking-wider uppercase rounded-lg shadow-sm transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>LOG NOW</span>
        </button>
      </div>

      {/* Feed List */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-[#C1432E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-mono-receipt text-xs text-neutral-400">TUNING INTO SATELLITE TALLY WIRE...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#1B1B1B] p-12 rounded-xl border border-neutral-800 text-center space-y-3">
          <p className="text-4xl">📡</p>
          <p className="font-display font-bold text-lg text-neutral-300">No orders broadcasted yet</p>
          <p className="text-xs font-mono-receipt text-neutral-500">
            Be the first in your squad to log a food delivery order!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const plat = getPlatformLabel(order.platform);
            const isMe = order.userId === currentUserId;

            // Group reactions by emoji
            const reactionCounts: Record<string, { count: number; reactedByMe: boolean }> = {};
            for (const r of order.reactions || []) {
              if (!reactionCounts[r.emoji]) {
                reactionCounts[r.emoji] = { count: 0, reactedByMe: false };
              }
              reactionCounts[r.emoji].count += 1;
              if (r.userId === currentUserId) {
                reactionCounts[r.emoji].reactedByMe = true;
              }
            }

            return (
              <div
                key={order.id}
                className="bg-[#1B1B1B] rounded-xl border border-neutral-800 p-4 sm:p-5 shadow-md hover:border-neutral-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-3xl flex-shrink-0">{order.user.avatarEmoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-sans-ui text-[#F5F2EC] leading-snug">
                        <strong className="font-display font-black text-base text-[#F5F2EC]">
                          {order.user.displayName}
                        </strong>{" "}
                        <span className="text-neutral-400">ordered via</span>{" "}
                        <span className={`font-bold ${plat.color}`}>
                          {plat.emoji} {plat.name}
                        </span>
                      </p>
                      <p className="font-mono-receipt text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(order.orderedAt)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-mono-receipt font-black text-xl sm:text-2xl text-[#F5F2EC]">
                      ₹{order.amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {order.note && (
                  <div className="mt-3 px-3 py-2 bg-neutral-900/80 rounded-lg border-l-2 border-[#C1432E] text-xs text-neutral-300 font-sans-ui">
                    &ldquo;{order.note}&rdquo;
                  </div>
                )}

                {/* Reactions Section */}
                <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Object.entries(reactionCounts).map(([emoji, data]) => (
                      <button
                        key={emoji}
                        onClick={() => onReactionToggle(order.id, emoji)}
                        className={`px-2.5 py-1 rounded-full text-xs font-mono-receipt flex items-center gap-1 border transition ${
                          data.reactedByMe
                            ? "bg-[#C1432E]/20 text-[#F5F2EC] border-[#C1432E]"
                            : "bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-500"
                        }`}
                      >
                        <span>{emoji}</span>
                        <span className="font-bold">{data.count}</span>
                      </button>
                    ))}

                    {/* Add Reaction Button */}
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setActivePickerId(activePickerId === order.id ? null : order.id)
                        }
                        className="px-2 py-1 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 text-xs flex items-center gap-1 transition"
                        title="React to order"
                      >
                        <Sparkles className="w-3 h-3 text-[#E3A008]" />
                        <span>+ React</span>
                      </button>

                      {/* Emoji Dropdown Popover */}
                      {activePickerId === order.id && (
                        <div className="absolute left-0 bottom-8 z-30 bg-[#242424] border border-neutral-700 rounded-xl p-1.5 shadow-xl flex items-center gap-1 animate-in fade-in zoom-in-95">
                          {availableEmojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                onReactionToggle(order.id, emoji);
                                setActivePickerId(null);
                              }}
                              className="p-1.5 hover:bg-neutral-700 rounded-lg text-lg transition hover:scale-125"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono-receipt text-neutral-500 uppercase">
                    ID: #{order.id.slice(-5)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
