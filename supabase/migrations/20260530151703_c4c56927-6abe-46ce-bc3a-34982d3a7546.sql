CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet text NOT NULL UNIQUE,
  nonce text,
  nonce_issued_at timestamptz,
  clawb_balance numeric NOT NULL DEFAULT 0,
  discord_id text,
  discord_username text,
  role text NOT NULL DEFAULT 'CITIZEN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.purged_contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  contract_address text NOT NULL,
  token_name text,
  verdict text,
  autopsy text,
  cause_of_death text,
  rug_score integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_purged_contracts_user_id ON public.purged_contracts(user_id);

GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.purged_contracts TO service_role;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purged_contracts ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies: all access flows through trusted server routes
-- using the service role, which bypasses RLS. Public clients are denied by default.