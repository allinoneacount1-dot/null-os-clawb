import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { verifySiwsSignature } from "@/lib/siws.server";
import { getUserByWallet, clearNonce } from "@/lib/users.server";
import { createSessionToken, setSessionCookie } from "@/lib/session.server";

const BodySchema = z.object({
  wallet: z.string().min(32).max(44).regex(/^[1-9A-HJ-NP-Za-km-z]+$/),
  message: z.string().min(16).max(2000),
  signature: z.string().min(8).max(200),
});

const NONCE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

export const Route = createFileRoute("/api/auth/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let json: unknown;
        try {
          json = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const parsed = BodySchema.safeParse(json);
        if (!parsed.success) {
          return Response.json({ error: "Invalid payload" }, { status: 400 });
        }
        const { wallet, message, signature } = parsed.data;

        const user = await getUserByWallet(wallet);
        if (!user || !user.nonce || !user.nonce_issued_at) {
          return Response.json({ error: "No active nonce. Request one first." }, { status: 401 });
        }

        const age = Date.now() - new Date(user.nonce_issued_at).getTime();
        if (age > NONCE_MAX_AGE_MS) {
          await clearNonce(user.id);
          return Response.json({ error: "Nonce expired. Try again." }, { status: 401 });
        }

        // Bind the signed message to the stored nonce + wallet to stop replay/forgery.
        if (!message.includes(`Nonce: ${user.nonce}`) || !message.includes(wallet)) {
          return Response.json({ error: "Message does not match issued nonce" }, { status: 401 });
        }

        const valid = verifySiwsSignature(wallet, message, signature);
        if (!valid) {
          return Response.json({ error: "Signature verification failed" }, { status: 401 });
        }

        // Burn the nonce so it cannot be replayed.
        await clearNonce(user.id);

        const token = await createSessionToken({ id: user.id, wallet: user.wallet, role: user.role });
        setSessionCookie(token);

        return Response.json({
          ok: true,
          user: { id: user.id, wallet: user.wallet, role: user.role, clawb_balance: user.clawb_balance },
        });
      },
    },
  },
});
