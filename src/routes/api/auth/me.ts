import { createFileRoute } from "@tanstack/react-router";
import { readSession } from "@/lib/session.server";
import { getUserById } from "@/lib/users.server";

export const Route = createFileRoute("/api/auth/me")({
  server: {
    handlers: {
      GET: async () => {
        const session = await readSession();
        if (!session) return Response.json({ user: null });
        const user = await getUserById(session.sub);
        if (!user) return Response.json({ user: null });
        return Response.json({
          user: {
            id: user.id,
            wallet: user.wallet,
            role: user.role,
            clawb_balance: user.clawb_balance,
            discord_username: user.discord_username,
          },
        });
      },
    },
  },
});
