import { createServerFn } from "@tanstack/react-start";
import { readSession } from "@/lib/session.server";
import { getUserById } from "@/lib/users.server";

export interface SessionUser {
  id: string;
  wallet: string;
  role: string;
  clawb_balance: number;
  discord_username: string | null;
}

export const getSessionUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ user: SessionUser | null }> => {
    const session = await readSession();
    if (!session) return { user: null };
    const user = await getUserById(session.sub);
    if (!user) return { user: null };
    return {
      user: {
        id: user.id,
        wallet: user.wallet,
        role: user.role,
        clawb_balance: Number(user.clawb_balance),
        discord_username: user.discord_username,
      },
    };
  },
);
