/* eslint-disable no-console */
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL manquant dans .env');
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }, // Supabase
  });

  const client = await pool.connect();
  try {
    console.log('🔧 Connexion DB OK. Mise en place du schéma…');

    // 1) Extensions & types
    await client.query(`
      create extension if not exists pgcrypto;

      do $$ begin
        if not exists (select 1 from pg_type where typname = 'user_role') then
          create type user_role as enum ('EMPLOYEE','MANAGER','ACCOUNTING');
        end if;
        if not exists (select 1 from pg_type where typname = 'expense_status') then
          create type expense_status as enum ('CREATED','APPROVED','REJECTED','PROCESSED');
        end if;
      end $$;
    `);

    // 2) Tables
    await client.query(`
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
    `);

    // 3) Index
    await client.query(`
      create index if not exists idx_expenses_employee on expenses(employee_id);
      create index if not exists idx_expenses_status on expenses(status);
    `);

    // 4) (Optionnel) RLS + policies permissives (service role bypass de toute façon)
    await client.query(`
      alter table if exists users enable row level security;
      alter table if exists expenses enable row level security;
      alter table if exists expense_files enable row level security;

      do $$ begin
        if not exists (select 1 from pg_policies where tablename = 'users' and policyname = 'backend_all_users') then
          create policy backend_all_users on users for all using (true) with check (true);
        end if;
        if not exists (select 1 from pg_policies where tablename = 'expenses' and policyname = 'backend_all_expenses') then
          create policy backend_all_expenses on expenses for all using (true) with check (true);
        end if;
        if not exists (select 1 from pg_policies where tablename = 'expense_files' and policyname = 'backend_all_expense_files') then
          create policy backend_all_expense_files on expense_files for all using (true) with check (true);
        end if;
      end $$;
    `);

    // 5) Seed manager
    const email = 'manager@supherman.com';
    const plain = 'Suph3rm4n!';
    const hash = await bcrypt.hash(plain, 10);

    await client.query(
      `
      insert into users (email, role, password_hash, must_set_password)
      values ($1, 'MANAGER', $2, false)
      on conflict (email) do update
      set role = excluded.role,
          password_hash = excluded.password_hash,
          must_set_password = excluded.must_set_password
      `,
      [email, hash]
    );

    console.log('✅ Schéma OK + manager seedé:', email);
  } finally {
    client.release();
    await pool.end();
  }
}

bootstrap().catch((e) => {
  console.error('❌ Bootstrap failed:', e);
  process.exit(1);
});
