import { BadRequestException, Injectable } from '@nestjs/common';
import { makeSupabaseAdmin } from '../../config/supabase.config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  private sb = makeSupabaseAdmin();

  async findByEmail(email: string) {
    const { data, error } = await this.sb
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  /** Génère un mot de passe temporaire alphanumérique (copier/coller facile) */
  private generateTempPassword(len = 12) {
    return crypto.randomBytes(18).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, len);
  }

  /** Création d'utilisateur avec mot de passe temporaire + must_set_password=true */
  async createWithTempPassword(email: string, role: 'EMPLOYEE'|'MANAGER'|'ACCOUNTING') {
    const tempPassword = this.generateTempPassword();
    const hash = await bcrypt.hash(tempPassword, 10);

    const { data, error } = await this.sb
      .from('users')
      .insert({ email, role, must_set_password: true, password_hash: hash })
      .select('*')
      .single();

    if (error) throw new BadRequestException(error.message);
    return { user: data, tempPassword };
  }

  /** Reset d’un mot de passe temporaire (et remet must_set_password=true) */
  async resetTempPassword(userId: string) {
    const tempPassword = this.generateTempPassword();
    const hash = await bcrypt.hash(tempPassword, 10);

    const { error } = await this.sb
      .from('users')
      .update({ password_hash: hash, must_set_password: true })
      .eq('id', userId);

    if (error) throw new BadRequestException(error.message);
    return { tempPassword };
  }

  /** Définition du mot de passe définitif (fin de première connexion) */
  async setPassword(userId: string, newPassword: string) {
    const hash = await bcrypt.hash(newPassword, 10);
    const { error } = await this.sb
      .from('users')
      .update({ password_hash: hash, must_set_password: false })
      .eq('id', userId);
    if (error) throw new BadRequestException(error.message);
  }

  /** (Ancienne méthode) – garde un alias si tu l’appelles ailleurs */
  async create(email: string, role: 'EMPLOYEE'|'MANAGER'|'ACCOUNTING') {
    return (await this.createWithTempPassword(email, role)).user;
  }

  async list() {
    const { data, error } = await this.sb
      .from('users')
      .select('id,email,role,must_set_password,created_at')
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data;
  }
}
