import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { readSession } from "@/lib/session.server";
import { insertPurge, listPurges } from "@/lib/users.server";

const BodySchema = z.object({
  contract: z
    .string()
    .min(32)
    .max(44)
    .regex(/^[1-9A-HJ-NP-Za-km-z]+$/, "Invalid Solana contract address"),
});

const SYSTEM_PROMPT = `You are the "Soul Cleanser", a darkly humorous forensic pathologist for dead crypto tokens on Solana.
A user gives you a rug-pulled token's contract address. Perform an "Autopsy of a Dead Token".
You do not have live chain data, so write a vivid, plausible, satirical forensic report based on the address.
Always respond in this exact JSON shape and nothing else:
{
  "token_name": string (an invented but believable degen ticker/name),
  "verdict": "RUGGED" | "ABANDONED" | "HONEYPOT" | "SLOW BLEED",
  "cause_of_death": short string (max 12 words),
  "rug_score": integer 0-100 (100 = total rug),
  "autopsy": string (3-5 short terminal-style paragraphs, lowercase hacker tone, brutal and funny)
}`;

export const Route = createFileRoute("/api/purge")({
  server: {
    handlers: {
      GET: async () => {
        const session = await readSession();
        if (!session) {
          return Response.json({ error: "ACCESS DENIED: WALLET NOT FOUND" }, { status: 401 });
        }
        const purges = await listPurges(session.sub);
        return Response.json({ purges });
      },
      POST: async ({ request }) => {
        const session = await readSession();
        if (!session) {
          return Response.json({ error: "ACCESS DENIED: WALLET NOT FOUND" }, { status: 401 });
        }

        let json: unknown;
        try {
          json = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const parsed = BodySchema.safeParse(json);
        if (!parsed.success) {
          return Response.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid contract" },
            { status: 400 },
          );
        }
        const { contract } = parsed.data;

        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return Response.json({ error: "AI engine offline (missing key)" }, { status: 500 });
        }

        let aiRes: Response;
        try {
          aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                  role: "user",
                  content: `Perform the autopsy on this dead token. Contract address: ${contract}`,
                },
              ],
            }),
          });
        } catch (e) {
          console.error("AI fetch failed", e);
          return Response.json({ error: "AI engine unreachable" }, { status: 502 });
        }

        if (aiRes.status === 429) {
          return Response.json({ error: "Rate limited. Slow down, ghoul." }, { status: 429 });
        }
        if (aiRes.status === 402) {
          return Response.json(
            { error: "AI credits exhausted. Top up workspace credits." },
            { status: 402 },
          );
        }
        if (!aiRes.ok) {
          const text = await aiRes.text();
          console.error("AI error", aiRes.status, text);
          return Response.json({ error: "Autopsy machine malfunctioned" }, { status: 502 });
        }

        const data = (await aiRes.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const content = data.choices?.[0]?.message?.content ?? "{}";

        let report: {
          token_name?: string;
          verdict?: string;
          cause_of_death?: string;
          rug_score?: number;
          autopsy?: string;
        };
        try {
          report = JSON.parse(content);
        } catch {
          report = { autopsy: content };
        }

        const rugScore =
          typeof report.rug_score === "number"
            ? Math.max(0, Math.min(100, Math.round(report.rug_score)))
            : null;

        const saved = await insertPurge({
          user_id: session.sub,
          contract_address: contract,
          token_name: report.token_name ?? null,
          verdict: report.verdict ?? null,
          autopsy: report.autopsy ?? null,
          cause_of_death: report.cause_of_death ?? null,
          rug_score: rugScore,
        });

        return Response.json({ purge: saved });
      },
    },
  },
});
