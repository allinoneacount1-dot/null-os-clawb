import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { buildSiwsMessage, generateNonce } from "@/lib/siws.server";
import { upsertNonce } from "@/lib/users.server";

const BodySchema = z.object({
  wallet: z.string().min(32).max(44).regex(/^[1-9A-HJ-NP-Za-km-z]+$/),
});

export const Route = createFileRoute("/api/auth/nonce")({
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
          return Response.json({ error: "Invalid wallet address" }, { status: 400 });
        }
        const { wallet } = parsed.data;
        const nonce = generateNonce();
        const issuedAt = new Date().toISOString();
        try {
          await upsertNonce(wallet, nonce, issuedAt);
        } catch (e) {
          console.error("nonce error", e);
          return Response.json({ error: "Could not issue nonce" }, { status: 500 });
        }
        const message = buildSiwsMessage(wallet, nonce, issuedAt);
        return Response.json({ message, nonce, issuedAt });
      },
    },
  },
});
