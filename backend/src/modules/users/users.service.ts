import { BadRequestException, Injectable } from '@nestjs/common';
import { makeSupabaseAdmin } from '../../config/supabase.config';

@Injectable()
export class UsersService {
  private sb = makeSupabaseAdmin();

  async findByEmail(email: string) {
    const { data, error } = await this.sb.from('users').select('*').eq('email', email).maybeSingle();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async setPassword(userId: string, password_hash: string) {
    const { error } = await this.sb.from('users')
      .update({ password_hash, must_set_password: false })
      .eq('id', userId);
    if (error) throw new BadRequestException(error.message);
  }

  async create(email: string, role: 'EMPLOYEE'|'MANAGER'|'ACCOUNTING') {
    const { data, error } = await this.sb.from('users')
      .insert({ email, role, must_set_password: true })
      .select('*').single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async list() {
    const { data, error } = await this.sb.from('users').select('id,email,role,must_set_password,created_at').order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data;
  }
}
