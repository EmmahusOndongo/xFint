import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { makeSupabaseAdmin } from '../../config/supabase.config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
// import { v4 as uuid } from 'uuid'; // plus utilisé ici
import { StorageService } from '../storage/storage.service'; // <-- ajuste le chemin selon ton arbo

type Role = 'EMPLOYEE' | 'MANAGER' | 'ACCOUNTING';

@Injectable()
export class UsersService {
  private sb = makeSupabaseAdmin();
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly storage: StorageService) {}

  // ---------- Utils ----------
  /** Génère un mot de passe temporaire alphanumérique (copier/coller facile) */
  private generateTempPassword(len = 12) {
    return crypto.randomBytes(18).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, len);
  }

  // ---------- Queries de base ----------
  async findByEmail(email: string) {
    const { data, error } = await this.sb
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async findById(userId: string) {
    const { data, error } = await this.sb.from('users').select('*').eq('id', userId).single();
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Utilisateur introuvable');
    return data;
  }

  async list() {
    const { data, error } = await this.sb
      .from('users')
      .select('id,email,role,must_set_password,created_at,avatar_path,avatar_updated_at')
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ---------- Création / reset / set password ----------
  async createWithTempPassword(email: string, role: Role) {
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

  async create(email: string, role: Role) {
    return (await this.createWithTempPassword(email, role)).user;
  }

  async resetTempPassword(userId: string) {
    await this.findById(userId);

    const tempPassword = this.generateTempPassword();
    const hash = await bcrypt.hash(tempPassword, 10);

    const { error } = await this.sb
      .from('users')
      .update({ password_hash: hash, must_set_password: true })
      .eq('id', userId);

    if (error) throw new BadRequestException(error.message);
    return { tempPassword };
  }

  async setPassword(userId: string, newPassword: string) {
    const hash = await bcrypt.hash(newPassword, 10);
    const { error } = await this.sb
      .from('users')
      .update({ password_hash: hash, must_set_password: false })
      .eq('id', userId);
    if (error) throw new BadRequestException(error.message);
    return { ok: true };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const { data: user, error } = await this.sb
      .from('users')
      .select('id,password_hash')
      .eq('id', userId)
      .single();

    if (error) throw new BadRequestException(error.message);
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const ok = await bcrypt.compare(currentPassword, user.password_hash);
    if (!ok) throw new UnauthorizedException('Mot de passe actuel incorrect');

    const newHash = await bcrypt.hash(newPassword, 10);
    const { error: upErr } = await this.sb
      .from('users')
      .update({ password_hash: newHash, must_set_password: false })
      .eq('id', userId);

    if (upErr) throw new BadRequestException(upErr.message);
    return { ok: true };
  }

  // ---------- Avatar / photo de profil ----------
  /**
   * Upload / mise à jour de la photo de profil :
   *  - Upload Storage via StorageService (auto-création du bucket si absent)
   *  - Sauvegarde du path dans users.avatar_path
   *  - Retourne path + URL publique (si bucket public) sinon utilise getProfilePhotoSignedUrl
   */
  async setProfilePhoto(userId: string, file: Express.Multer.File) {
    if (!userId) throw new BadRequestException('Utilisateur invalide: id manquant');
    if (!file) throw new BadRequestException('Aucun fichier reçu');

    // 1) Vérifier que l'utilisateur existe
    const { data: existing, error: exErr } = await this.sb
      .from('users')
      .select('id,email')
      .eq('id', userId)
      .maybeSingle();
    this.logger.log(`[avatar] existing user = ${existing?.id ?? 'null'} | err=${exErr?.message ?? 'none'}`);
    if (exErr) throw new BadRequestException(`users.select: ${exErr.message}`);
    if (!existing) throw new BadRequestException(`users.select: aucun user avec id=${userId}`);

    // 2) Upload Storage (bucket "avatars" par défaut, auto-création si besoin)
    const { path, publicUrl } = await this.storage.uploadAvatar(file, userId);
    this.logger.log(`[avatar] uploaded -> path=${path} | publicUrl=${publicUrl ?? 'private'}`);

    // 3) Update DB et forcer un retour
    const { data: updated, error: dbErr } = await this.sb
      .from('users')
      .update({
        avatar_path: path,
        avatar_mime: file.mimetype,
        avatar_updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, avatar_path')
      .single();
    this.logger.log(`[avatar] users.update -> id=${updated?.id ?? 'null'} | path=${updated?.avatar_path ?? 'null'} | err=${dbErr?.message ?? 'none'}`);
    if (dbErr) throw new BadRequestException(`users.update: ${dbErr.message}`);

    return { ok: true, path: updated.avatar_path, url: publicUrl };
  }

  /** Génère une URL signée temporaire pour l’avatar (bucket privé) */
  async getProfilePhotoSignedUrl(userId: string, expiresInSeconds = 3600) {
    const { data: user, error } = await this.sb
      .from('users')
      .select('avatar_path')
      .eq('id', userId)
      .single();

    if (error) throw new BadRequestException(error.message);
    if (!user?.avatar_path) throw new NotFoundException('Aucun avatar');

    const url = await this.storage.signAvatarUrl(user.avatar_path, expiresInSeconds);
    return { url, expiresIn: expiresInSeconds };
  }
}