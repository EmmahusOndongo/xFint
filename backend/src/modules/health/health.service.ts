import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { makeSupabaseAdmin } from '../../config/supabase.config';

@Injectable()
export class HealthService {
  private pool: Pool | null = null;
  private sb = makeSupabaseAdmin();

  constructor() {
    const url = process.env.DATABASE_URL;
    if (url) {
      this.pool = new Pool({
        connectionString: url,
        ssl: { rejectUnauthorized: false },
      });
    }
  }

  async check() {
    const result = {
      status: 'ok' as const,
      postgres: { up: false, now: undefined as string | undefined, error: undefined as string | undefined },
      supabase: { up: false, usersCount: undefined as number | undefined, error: undefined as string | undefined },
    };

    // Ping Postgres (via DATABASE_URL)
    if (!this.pool) {
      result.postgres.error = 'DATABASE_URL not set (check .env)';
    } else {
      try {
        const r = await this.pool.query('select now() as now');
        result.postgres.up = true;
        // @ts-ignore - pg renvoie un Date
        result.postgres.now = r.rows?.[0]?.now?.toISOString?.() ?? String(r.rows?.[0]?.now);
      } catch (e: any) {
        result.postgres.error = e?.message || String(e);
      }
    }

    // Ping Supabase (via service role key)
    try {
      const { error, count } = await this.sb
        .from('users')
        .select('*', { head: true, count: 'exact' });
      if (error) throw error;
      result.supabase.up = true;
      result.supabase.usersCount = count ?? 0;
    } catch (e: any) {
      result.supabase.error = e?.message || String(e);
    }

    return result;
  }
}
