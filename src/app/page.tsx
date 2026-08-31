"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { LeaderboardView } from "@/components/LeaderboardView";
import { PersonalHistoryView } from "@/components/PersonalHistoryView";
import { ActivityFeedView } from "@/components/ActivityFeedView";
import { HallOfFameView } from "@/components/HallOfFameView";
import { OrderModal } from "@/components/OrderModal";
import { MobileFAB } from "@/components/MobileFAB";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"leaderboard" | "myOrders" | "feed" | "hallOfFame">("leaderboard");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [feedOrders, setFeedOrders] = useState<any[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);

  // Authentication guard
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch Leaderboard
  const fetchLeaderboard = useCallback(async (month?: string) => {
    setIsLoadingLeaderboard(true);
    try {
      const url = month ? `/api/leaderboard?month=${month}` : "/api/leaderboard";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setLeaderboardData(data);
        if (!selectedMonth) {
          setSelectedMonth(data.selectedMonth);
        }
      }
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, [selectedMonth]);

  // Fetch Feed Orders
  const fetchFeed = useCallback(async () => {
    setIsLoadingFeed(true);
    try {
      const res = await fetch("/api/orders?limit=40");
      const data = await res.json();
      if (res.ok) {
        setFeedOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to load activity feed:", err);
    } finally {
      setIsLoadingFeed(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchLeaderboard(selectedMonth || undefined);
      fetchFeed();
    }
  }, [status, selectedMonth, fetchLeaderboard, fetchFeed]);

  // Handle new order added or edited (Optimistic update)
  const handleOrderSaved = (savedOrder: any) => {
    // 1. Instantly update feed
    setFeedOrders((prev) => {
      const filtered = prev.filter((o) => o.id !== savedOrder.id);
      return [savedOrder, ...filtered];
    });

    // 2. Refetch leaderboard in background to keep math 100% accurate
    fetchLeaderboard(selectedMonth);
    setEditingOrder(null);
  };

  const handleOrderDeleted = (orderId: string) => {
    setFeedOrders((prev) => prev.filter((o) => o.id !== orderId));
    fetchLeaderboard(selectedMonth);
  };

  // Toggle emoji reaction
  const handleReactionToggle = async (orderId: string, emoji: string) => {
    if (!session?.user?.id) return;

    // Optimistic UI update
    setFeedOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        const currentReactions = ord.reactions || [];
        const existingIdx = currentReactions.findIndex(
          (r: any) => r.emoji === emoji && r.userId === session.user.id
        );

        let newReactions = [...currentReactions];
        if (existingIdx >= 0) {
          // Remove
          newReactions.splice(existingIdx, 1);
        } else {
          // Add
          newReactions.push({
            id: `temp-${Date.now()}`,
            orderId,
            userId: session.user.id,
            emoji,
            user: {
              id: session.user.id,
              displayName: session.user.displayName || "You",
            },
          });
        }
        return { ...ord, reactions: newReactions };
      })
    );

    try {
      await fetch(`/api/orders/${orderId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
    } catch (err) {
      console.error("Failed to save reaction:", err);
      // Revert with background refetch on failure
      fetchFeed();
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#C1432E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono-receipt text-xs text-neutral-400">CONNECTING TO CANTEEN SERVER...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  // Find logged in user's rank info
  let userRankInfo = {
    rank: 0,
    monthSpend: 0,
    monthCount: 0,
    streakDays: 0,
  };

  if (leaderboardData?.rankedByCount && session?.user?.id) {
    const idx = leaderboardData.rankedByCount.findIndex(
      (u: any) => u.user.id === session.user.id
    );
    if (idx >= 0) {
      const myData = leaderboardData.rankedByCount[idx];
      userRankInfo = {
        rank: idx + 1,
        monthSpend: myData.totalSpent,
        monthCount: myData.orderCount,
        streakDays: myData.streakDays,
      };
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F2EC] flex flex-col selection:bg-[#C1432E] selection:text-white pb-20 sm:pb-12">
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(t) => {
          setActiveTab(t);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenOrderModal={() => {
          setEditingOrder(null);
          setOrderModalOpen(true);
        }}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-6">
        {activeTab === "leaderboard" && (
          <LeaderboardView
            data={leaderboardData}
            isLoading={isLoadingLeaderboard}
            selectedMonth={selectedMonth || leaderboardData?.currentMonthKey || ""}
            onMonthChange={(m) => {
              setSelectedMonth(m);
              fetchLeaderboard(m);
            }}
            onOpenOrderModal={() => {
              setEditingOrder(null);
              setOrderModalOpen(true);
            }}
            currentUserId={session?.user?.id}
          />
        )}

        {activeTab === "myOrders" && (
          <PersonalHistoryView
            currentUserId={session?.user?.id || ""}
            userRankInfo={userRankInfo}
            onEditOrder={(order) => {
              setEditingOrder(order);
              setOrderModalOpen(true);
            }}
            onOrderDeleted={handleOrderDeleted}
            onOpenOrderModal={() => {
              setEditingOrder(null);
              setOrderModalOpen(true);
            }}
          />
        )}

        {activeTab === "feed" && (
          <ActivityFeedView
            orders={feedOrders}
            isLoading={isLoadingFeed}
            currentUserId={session?.user?.id}
            onReactionToggle={handleReactionToggle}
            onOpenOrderModal={() => {
              setEditingOrder(null);
              setOrderModalOpen(true);
            }}
          />
        )}

        {activeTab === "hallOfFame" && (
          <HallOfFameView currentLeaderboard={leaderboardData} />
        )}
      </main>

      {/* Mobile Floating Action Button */}
      <MobileFAB
        onClick={() => {
          setEditingOrder(null);
          setOrderModalOpen(true);
        }}
      />

      {/* <10s Fast Order Logger Modal */}
      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => {
          setOrderModalOpen(false);
          setEditingOrder(null);
        }}
        onOrderAdded={handleOrderSaved}
        initialOrder={editingOrder}
      />
    </div>
  );
}
