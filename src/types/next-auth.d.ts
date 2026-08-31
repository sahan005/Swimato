import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      displayName?: string;
      avatarEmoji?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username?: string;
    displayName?: string;
    avatarEmoji?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    displayName?: string;
    avatarEmoji?: string;
  }
}
