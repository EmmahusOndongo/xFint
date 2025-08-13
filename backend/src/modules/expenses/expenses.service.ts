import { BadRequestException, Injectable } from '@nestjs/common';
import { makeSupabaseAdmin } from '../../config/supabase.config';

@Injectable()
export class ExpensesService {
  private sb = makeSupabaseAdmin();

  async my(userId: string) {
    const { data, error } = await this.sb
      .from('expenses')
      .select('*, employee:users(id,email)')
      .eq('employee_id', userId)
      .order('submitted_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async allForManager() {
    const { data, error } = await this.sb
      .from('expenses')
      .select('*, employee:users(id,email)')
      .order('submitted_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async allForAccounting() {
    const { data, error } = await this.sb
      .from('expenses')
      .select('*, employee:users(id,email)')
      .in('status', ['APPROVED','PROCESSED'])
      .order('submitted_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async create(userId: string, title: string, comment?: string) {
    const { data, error } = await this.sb
      .from('expenses')
      .insert({ title, comment, employee_id: userId })
      .select('*')
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async getOne(id: string) {
    const { data, error } = await this.sb
      .from('expenses')
      .select('*, files:expense_files(*), employee:users(id,email)')
      .eq('id', id).single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async transition(id: string, next: 'APPROVED'|'REJECTED'|'PROCESSED', comment?: string) {
    const patch = { status: next, comment }; // 👈 une seule colonne
    const { data, error } = await this.sb
      .from('expenses')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

}
