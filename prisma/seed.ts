import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Cleaning existing records...");
  await prisma.reaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();

  console.log("🔐 Hashing default passwords...");
  const defaultPasswordHash = await bcrypt.hash("password123", 10);

  console.log("👥 Creating demo friends...");
  const kandy = await prisma.user.create({
    data: {
      username: "kandy",
      displayName: "Kandy (Biryani Beast)",
      passwordHash: defaultPasswordHash,
      avatarEmoji: "🍛",
    },
  });

  const rohan = await prisma.user.create({
    data: {
      username: "rohan",
      displayName: "Rohan V.",
      passwordHash: defaultPasswordHash,
      avatarEmoji: "🍕",
    },
  });

  const priya = await prisma.user.create({
    data: {
      username: "priya",
      displayName: "Priya P.",
      passwordHash: defaultPasswordHash,
      avatarEmoji: "🍔",
    },
  });

  const arjun = await prisma.user.create({
    data: {
      username: "arjun",
      displayName: "Arjun Nair",
      passwordHash: defaultPasswordHash,
      avatarEmoji: "🥟",
    },
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Helper to create dates in current and last month
  const getDate = (monthOffset: number, day: number, hour: number = 19, minute: number = 30) => {
    const d = new Date(currentYear, currentMonth + monthOffset, day, hour, minute);
    return d;
  };

  console.log("📦 Populating realistic food delivery orders...");

  const ordersData = [
    // Current Month - Kandy (Heavy Spender & Frequent Orderer)
    {
      userId: kandy.id,
      platform: "ZOMATO",
      amount: 680,
      note: "Hyderabadi Dum Biryani with Extra Salan",
      orderedAt: getDate(0, Math.max(1, now.getDate() - 1), 20, 15),
      reactions: ["🔥", "🤤"],
    },
    {
      userId: kandy.id,
      platform: "SWIGGY",
      amount: 420,
      note: "Midnight Cold Coffee & Hazelnut Croissant",
      orderedAt: getDate(0, Math.max(1, now.getDate() - 2), 23, 45),
      reactions: ["💀"],
    },
    {
      userId: kandy.id,
      platform: "LOCAL",
      amount: 190,
      note: "Shawarma roll from corner uncle",
      orderedAt: getDate(0, Math.max(1, now.getDate() - 3), 18, 20),
      reactions: ["🍕"],
    },
    {
      userId: kandy.id,
      platform: "SWIGGY",
      amount: 980,
      note: "Weekend sushi platter & gyoza",
      orderedAt: getDate(0, Math.max(1, now.getDate() - 5), 20, 0),
      reactions: ["💸", "🔥"],
    },
    {
      userId: kandy.id,
      platform: "ZOMATO",
      amount: 340,
      note: "Paneer butter masala + 3 garlic naans",
      orderedAt: getDate(0, Math.max(1, now.getDate() - 7), 13, 30),
      reactions: [],
    },
    {
      userId: kandy.id,
      platform: "OTHER",
      amount: 250,
      note: "Blinkit quick munchies & ice cream",
      orderedAt: getDate(0, Math.max(1, now.getDate() - 8), 16, 10),
      reactions: [],
    },

    // Current Month - Rohan (Pizza & Burger King)
    {
      userId: rohan.id,
      platform: "ZOMATO",
      amount: 1150,
      note: "Party sized Pepperoni Pizza & Cheesy Garlic Sticks",
      orderedAt: getDate(0, Math.max(1, now.getDate() - 1), 21, 10),
      reactions: ["💸", "🍕", "🔥"],
    },
    {
      userId: rohan.id,
      platform: "SWIGGY",
      amount: 380,
      note: "Gourmet double smash burger + peri peri fries",
      orderedAt: getDate(0, Math.max(1, now.getDate() - 4), 19, 45),
      reactions: ["🤤"],
    },
    {
      userId: rohan.id,
      platform: "ZOMATO",
      amount: 520,
      note: "Pad Thai noodles with spring rolls",
      orderedAt: getDate(0, Math.max(1, now.getDate() - 6), 20, 30),
      reactions: [],
    },
    {
      userId: rohan.id,
      platform: "LOCAL",
      amount: 140,
      note: "Masala dosa & filter coffee breakfast",
      orderedAt: getDate(0, Math.max(1, now.getDate() - 7), 9, 15),
      reactions: [],
    },

    // Current Month - Priya (Cafe & Dessert Queen)
    {
      userId: priya.id,
      platform: "SWIGGY",
      amount: 460,
      note: "Iced Spanish Latte & Lotus Biscoff cheesecake",
      orderedAt: getDate(0, Math.max(1, now.getDate()), 16, 0),
      reactions: ["🤤", "🔥"],
    },
    {
      userId: priya.id,
      platform: "SWIGGY",
      amount: 720,
      note: "Truffle Mushroom Pasta & Tiramisu",
      orderedAt: getDate(0, Math.max(1, now.getDate() - 2), 20, 15),
      reactions: ["💸"],
    },
    {
      userId: priya.id,
      platform: "ZOMATO",
      amount: 310,
      note: "Chicken momos with spicy chutney",
      orderedAt: getDate(0, Math.max(1, now.getDate() - 3), 17, 30),
      reactions: ["🔥"],
    },
    {
      userId: priya.id,
      platform: "OTHER",
      amount: 180,
      note: "Instamart emergency chocolate crave",
      orderedAt: getDate(0, Math.max(1, now.getDate() - 5), 22, 10),
      reactions: [],
    },
    {
      userId: priya.id,
      platform: "LOCAL",
      amount: 220,
      note: "Authentic Kathi rolls from street vendor",
      orderedAt: getDate(0, Math.max(1, now.getDate() - 8), 21, 0),
      reactions: ["🍕"],
    },

    // Current Month - Arjun (Budget Master & Chai Addict)
    {
      userId: arjun.id,
      platform: "LOCAL",
      amount: 90,
      note: "Evening Adrak Chai & 2 Samosas",
      orderedAt: getDate(0, Math.max(1, now.getDate() - 1), 17, 0),
      reactions: ["🔥"],
    },
    {
      userId: arjun.id,
      platform: "SWIGGY",
      amount: 280,
      note: "Thali meal with dal tadka & jeera rice",
      orderedAt: getDate(0, Math.max(1, now.getDate() - 3), 13, 0),
      reactions: [],
    },
    {
      userId: arjun.id,
      platform: "ZOMATO",
      amount: 350,
      note: "Butter Chicken & Tandoori Roti combo",
      orderedAt: getDate(0, Math.max(1, now.getDate() - 6), 20, 45),
      reactions: ["🤤"],
    },

    // Previous Month - Seed data for Hall of Fame & Month Archive
    {
      userId: kandy.id,
      platform: "ZOMATO",
      amount: 850,
      note: "Last month mega celebration combo",
      orderedAt: getDate(-1, 15, 20, 0),
      reactions: ["🔥"],
    },
    {
      userId: kandy.id,
      platform: "SWIGGY",
      amount: 540,
      note: "Crispy fried chicken bucket",
      orderedAt: getDate(-1, 20, 21, 0),
      reactions: [],
    },
    {
      userId: rohan.id,
      platform: "ZOMATO",
      amount: 1450,
      note: "Team lunch feast",
      orderedAt: getDate(-1, 10, 13, 30),
      reactions: ["💸"],
    },
    {
      userId: rohan.id,
      platform: "SWIGGY",
      amount: 620,
      note: "Artisan sourdough pizza",
      orderedAt: getDate(-1, 22, 19, 45),
      reactions: [],
    },
    {
      userId: priya.id,
      platform: "SWIGGY",
      amount: 980,
      note: "Group dessert & boba blowout",
      orderedAt: getDate(-1, 25, 21, 30),
      reactions: ["🤤", "💸"],
    },
  ];

  for (const item of ordersData) {
    const order = await prisma.order.create({
      data: {
        userId: item.userId,
        platform: item.platform,
        amount: item.amount,
        note: item.note,
        orderedAt: item.orderedAt,
      },
    });

    if (item.reactions && item.reactions.length > 0) {
      for (const emoji of item.reactions) {
        // randomly pick another user for reaction
        const reactors = [kandy.id, rohan.id, priya.id, arjun.id].filter(
          (uid) => uid !== item.userId
        );
        const reactorId = reactors[Math.floor(Math.random() * reactors.length)];
        try {
          await prisma.reaction.create({
            data: {
              orderId: order.id,
              userId: reactorId,
              emoji: emoji,
            },
          });
        } catch {
          // ignore duplicate
        }
      }
    }
  }

  console.log("✅ Seed database created successfully!");
  console.log("📋 Demo Credentials:");
  console.log("   - username: kandy | password: password123");
  console.log("   - username: rohan | password: password123");
  console.log("   - username: priya | password: password123");
  console.log("   - username: arjun | password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
