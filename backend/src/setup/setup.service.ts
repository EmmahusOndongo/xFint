/* eslint-disable no-console */
import { Injectable, Logger } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

const SCHEMA_SQL = `
-- Extensions
create extension if not exists pgcrypto;

-- Types
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('EMPLOYEE','MANAGER','ACCOUNTING');
  end if;
  if not exists (select 1 from pg_type where typname = 'expense_status') then
    create type expense_status as enum ('CREATED','APPROVED','REJECTED','PROCESSED');
  end if;
end $$;

-- Tables
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text,
  role user_role not null default 'EMPLOYEE',
  must_set_password boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  comment text,
  status expense_status not null default 'CREATED',
  submitted_at timestamptz not null default now(),
  employee_id uuid not null references users(id) on delete cascade,
  manager_comment text,
  accounting_comment text,
  updated_at timestamptz not null default now()
);

create table if not exists expense_files (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  file_name text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now()
);

-- Index
create index if not exists idx_expenses_employee on expenses(employee_id);
create index if not exists idx_expenses_status on expenses(status);

-- (Optionnel) RLS + policies permissives (le Service Role bypass RLS)
alter table users enable row level security;
alter table expenses enable row level security;
alter table expense_files enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='users' and policyname='backend_all_users') then
    create policy backend_all_users on users for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='expenses' and policyname='backend_all_expenses') then
    create policy backend_all_expenses on expenses for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='expense_files' and policyname='backend_all_expense_files') then
    create policy backend_all_expense_files on expense_files for all using (true) with check (true);
  end if;
end $$;
`;

@Injectable()
export class SetupService {
  private readonly logger = new Logger(SetupService.name);

  private mkClient() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants');
    }
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  }

  async run() {
    const sb = this.mkClient();

    // 1) Vérifier si les tables existent (SELECT head)
    let schemaReady = true;
    try {
      const { error } = await sb.from('users').select('*', { head: true, count: 'exact' });
      if (error) throw error;
    } catch (e: any) {
      schemaReady = false;
      this.logger.warn('Schéma absent (table "users" introuvable).');
    }

    // 2) Si schéma manquant → log le SQL à coller dans Supabase
    if (!schemaReady) {
      this.logger.warn('➡️  Ouvre Supabase → SQL Editor et colle le SQL ci-dessous :');
      console.log('\n----- SCHEMA SQL BEGIN -----\n' + SCHEMA_SQL + '\n----- SCHEMA SQL END -----\n');
      this.logger.warn('Après exécution, relance l’API puis le setup créera le bucket et le manager.');
      return;
    }

    // 3) Bucket Storage (idempotent)
    try {
      const bucket = process.env.SUPABASE_BUCKET!;
      const { data: buckets, error: listErr } = await sb.storage.listBuckets();
      if (listErr) throw listErr;
      if (!buckets?.some((b) => b.name === bucket)) {
        const { error: createErr } = await sb.storage.createBucket(bucket, { public: false });
        if (createErr) throw createErr;
        this.logger.log(`🪣 Bucket créé: ${bucket}`);
      } else {
        this.logger.log(`🪣 Bucket OK: ${bucket}`);
      }
    } catch (e: any) {
      this.logger.error('Erreur bucket: ' + (e?.message || e));
    }

    // 4) Upsert manager (idempotent)
    try {
      const email = 'manager@supherman.com';
      const pass = 'Suph3rm4n!';
      const hash = await bcrypt.hash(pass, 10);
      const { error: upsertErr } = await sb
        .from('users')
        .upsert({ email, role: 'MANAGER', password_hash: hash, must_set_password: false }, { onConflict: 'email' });
      if (upsertErr) throw upsertErr;
      this.logger.log(`👤 Manager prêt: ${email}`);
    } catch (e: any) {
      this.logger.error('Seed manager échoué: ' + (e?.message || e));
    }
  }
}
