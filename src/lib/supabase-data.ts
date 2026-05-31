// src/lib/supabase-data.ts — Real data service for Supabase
import { supabase } from "@/integrations/supabase/client";

// Types
export interface TokenAutopsy {
  id: string;
  contract_address: string;
  token_name: string | null;
  token_symbol: string | null;
  verdict: string | null;
  autopsy: string | null;
  cause_of_death: string | null;
  rug_score: number | null;
  created_at: string;
  created_by: string | null;
}

export interface LeaderboardEntry {
  id: string;
  wallet: string;
  username: string | null;
  purges_count: number;
  total_value_destroyed: number;
  rank: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  wallet: string;
  username: string | null;
  role: string;
  clawb_balance: number;
  purges_count: number;
  achievements: string[];
  discord_username: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch recent token autopsies
export async function fetchRecentAutopsies(limit = 10): Promise<TokenAutopsy[]> {
  const { data, error } = await supabase
    .from("token_autopsies")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("fetchRecentAutopsies:", error.message);
    return [];
  }
  return data || [];
}

// Fetch leaderboard
export async function fetchLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("purges_count", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("fetchLeaderboard:", error.message);
    return [];
  }
  return data || [];
}

// Fetch user profile by wallet
export async function fetchUserProfile(wallet: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("wallet", wallet)
    .single();

  if (error) {
    if (error.code !== "PGRST116") { // not found
      console.warn("fetchUserProfile:", error.message);
    }
    return null;
  }
  return data;
}

// Create or update user profile
export async function upsertUserProfile(wallet: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert({ wallet, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) {
    console.warn("upsertUserProfile:", error.message);
    return null;
  }
  return data;
}

// Submit a token autopsy
export async function submitAutopsy(params: {
  contractAddress: string;
  tokenName?: string;
  verdict: string;
  autopsy: string;
  causeOfDeath?: string;
  rugScore?: number;
  wallet?: string;
}): Promise<TokenAutopsy | null> {
  const { data, error } = await supabase
    .from("token_autopsies")
    .insert({
      contract_address: params.contractAddress,
      token_name: params.tokenName || null,
      verdict: params.verdict,
      autopsy: params.autopsy,
      cause_of_death: params.causeOfDeath || null,
      rug_score: params.rugScore || null,
      created_by: params.wallet || null,
    })
    .select()
    .single();

  if (error) {
    console.warn("submitAutopsy:", error.message);
    return null;
  }

  // Increment user's purge count if wallet provided
  if (params.wallet) {
    await supabase.rpc("increment_purge_count", { user_wallet: params.wallet });
  }

  return data;
}

// Fetch system stats
export async function fetchSystemStats(): Promise<{
  totalAutopsies: number;
  totalUsers: number;
  totalValueDestroyed: number;
  topPurger: string | null;
}> {
  const [autopsiesResult, usersResult, leaderResult] = await Promise.all([
    supabase.from("token_autopsies").select("id", { count: "exact", head: true }),
    supabase.from("user_profiles").select("id", { count: "exact", head: true }),
    supabase.from("leaderboard").select("wallet").order("purges_count", { ascending: false }).limit(1),
  ]);

  return {
    totalAutopsies: autopsiesResult.count || 0,
    totalUsers: usersResult.count || 0,
    totalValueDestroyed: 0, // Would need a computed column or separate query
    topPurger: leaderResult.data?.[0]?.wallet || null,
  };
}

// Subscribe to real-time autopsy events
export function subscribeToAutopsies(callback: (autopsy: TokenAutopsy) => void) {
  const channel = supabase
    .channel("autopsies-feed")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "token_autopsies" },
      (payload) => {
        callback(payload.new as TokenAutopsy);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
