/* eslint-disable no-console */
import { Injectable, Logger } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
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

-- Tables (de base)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text,
  role user_role not null default 'EMPLOYEE',
  must_set_password boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Champs avatar
  avatar_path text,              -- chemin dans Supabase storage
  avatar_mime text,              -- type MIME (image/png, image/jpeg…)
  avatar_updated_at timestamptz  -- dernière màj de l’avatar
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

-- Colonnes additionnelles (idempotent)
alter table users
  add column if not exists avatar_path text,
  add column if not exists avatar_mime text,
  add column if not exists avatar_updated_at timestamptz;

-- Index
create index if not exists idx_expenses_employee on expenses(employee_id);
create index if not exists idx_expenses_status on expenses(status);
create index if not exists idx_expense_files_expense on expense_files(expense_id);

-- (Optionnel) RLS + policies permissives (le Service Role bypass RLS)
alter table if exists users enable row level security;
alter table if exists expenses enable row level security;
alter table if exists expense_files enable row level security;

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

  private mkPool() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL manquant dans .env');
    return new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }, // OK pour Supabase
    });
  }

  private mkSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants');
    return createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  async run() {
    // 1) Exécuter le schéma (idempotent)
    const pool = this.mkPool();
    const client = await pool.connect();
    try {
      this.logger.log('🔧 Création/vérification du schéma…');
      await client.query(SCHEMA_SQL);
      this.logger.log('✅ Schéma OK');

      // 2) Seed manager (idempotent, via SQL)
      const email = 'manager@supherman.com';
      const pass = 'Suph3rm4n!';
      const hash = await bcrypt.hash(pass, 10);

      await client.query(
        `
        insert into users (email, role, password_hash, must_set_password)
        values ($1, 'MANAGER', $2, false)
        on conflict (email) do update
          set role = excluded.role,
              password_hash = excluded.password_hash,
              must_set_password = excluded.must_set_password
        `,
        [email, hash],
      );
      this.logger.log(`👤 Manager prêt: ${email}`);
    } catch (e: any) {
      this.logger.error('Erreur schéma/seed: ' + (e?.message || e));
      throw e;
    } finally {
      client.release();
      await pool.end();
    }

    // 3) Buckets Storage (idempotent)
    try {
      const sb = this.mkSupabase();

      const bucketsToEnsure: Array<{
        name: string;
        public: boolean;
        fileSizeLimit?: string;
        allowedMimeTypes?: string[];
      }> = [];

      const expenseBucket = process.env.SUPABASE_BUCKET;
      if (expenseBucket) bucketsToEnsure.push({ name: expenseBucket, public: false });
      else this.logger.warn('SUPABASE_BUCKET manquant (ex: "expense-receipts").');

      const avatarsBucket = process.env.SUPABASE_AVATARS_BUCKET || 'avatars';
      bucketsToEnsure.push({
        name: avatarsBucket,
        public: false,
        fileSizeLimit: '10MB',
        allowedMimeTypes: ['image/*'],
      });

      const { data: buckets, error: listErr } = await sb.storage.listBuckets();
      if (listErr) throw listErr;

      for (const spec of bucketsToEnsure) {
        const exists = buckets?.some((b) => b.name === spec.name);
        if (!exists) {
          const { error: createErr } = await sb.storage.createBucket(spec.name, {
            public: spec.public,
            fileSizeLimit: spec.fileSizeLimit,
            allowedMimeTypes: spec.allowedMimeTypes,
          });
          if (createErr) throw createErr;
          this.logger.log(`🪣 Bucket créé: ${spec.name}`);
        } else {
          this.logger.log(`🪣 Bucket OK: ${spec.name}`);
        }
      }
    } catch (e: any) {
      this.logger.error('Erreur buckets: ' + (e?.message || e));
    }

    this.logger.log('✅ Setup terminé.');
  }
}