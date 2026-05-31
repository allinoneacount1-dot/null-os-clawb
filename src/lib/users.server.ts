// Server-only data access for users + purged contracts (service role, bypasses RLS).
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface DbUser {
  id: string;
  wallet: string;
  nonce: string | null;
  nonce_issued_at: string | null;
  clawb_balance: number;
  discord_id: string | null;
  discord_username: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface DbPurgedContract {
  id: string;
  user_id: string;
  contract_address: string;
  token_name: string | null;
  verdict: string | null;
  autopsy: string | null;
  cause_of_death: string | null;
  rug_score: number | null;
  created_at: string;
}

export async function upsertNonce(
  wallet: string,
  nonce: string,
  issuedAt: string,
): Promise<DbUser> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .upsert(
      { wallet, nonce, nonce_issued_at: issuedAt, updated_at: new Date().toISOString() },
      { onConflict: "wallet" },
    )
    .select("*")
    .single();
  if (error) throw new Error(`upsertNonce failed: ${error.message}`);
  return data as DbUser;
}

export async function getUserByWallet(wallet: string): Promise<DbUser | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("wallet", wallet)
    .maybeSingle();
  if (error) throw new Error(`getUserByWallet failed: ${error.message}`);
  return (data as DbUser) ?? null;
}

export async function getUserById(id: string): Promise<DbUser | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getUserById failed: ${error.message}`);
  return (data as DbUser) ?? null;
}

export async function clearNonce(id: string): Promise<void> {
  await supabaseAdmin
    .from("users")
    .update({ nonce: null, nonce_issued_at: null, updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function linkDiscord(
  id: string,
  discordId: string,
  discordUsername: string,
): Promise<void> {
  await supabaseAdmin
    .from("users")
    .update({
      discord_id: discordId,
      discord_username: discordUsername,
      role: "SYS_ADMIN",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function insertPurge(
  record: Omit<DbPurgedContract, "id" | "created_at">,
): Promise<DbPurgedContract> {
  const { data, error } = await supabaseAdmin
    .from("purged_contracts")
    .insert(record)
    .select("*")
    .single();
  if (error) throw new Error(`insertPurge failed: ${error.message}`);
  return data as DbPurgedContract;
}

export async function listPurges(userId: string): Promise<DbPurgedContract[]> {
  const { data, error } = await supabaseAdmin
    .from("purged_contracts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(`listPurges failed: ${error.message}`);
  return (data as DbPurgedContract[]) ?? [];
}
