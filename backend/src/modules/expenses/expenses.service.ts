// expenses.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { makeSupabaseAdmin } from '../../config/supabase.config';
import { StorageService } from '../storage/storage.service'; // Service pour signer des URLs de fichiers

@Injectable()
export class ExpensesService {
  // Client Supabase (service role) réservé au backend
  private sb = makeSupabaseAdmin();

  // Injection du service de stockage (pour générer des URLs signées)
  constructor(private readonly storage: StorageService) {}

  // Récupère les notes de frais de l'utilisateur courant
  async my(userId: string) {
    const { data, error } = await this.sb
      .from('expenses')
      .select('*, employee:users(id,email)') // jointure vers l'employé
      .eq('employee_id', userId)
      .order('submitted_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // Récupère toutes les notes de frais (vue manager)
  async allForManager() {
    const { data, error } = await this.sb
      .from('expenses')
      .select('*, employee:users(id,email)')
      .order('submitted_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // Récupère les notes pertinentes pour la compta
  async allForAccounting() {
    const { data, error } = await this.sb
      .from('expenses')
      .select('*, employee:users(id,email)')
      .in('status', ['APPROVED', 'PROCESSED'])
      .order('submitted_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // Création d'une note de frais
  async create(userId: string, title: string, comment?: string) {
    const { data, error } = await this.sb
      .from('expenses')
      .insert({ title, comment, employee_id: userId })
      .select('*')
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // Récupère une note de frais + fichiers associés
  // puis ajoute des URLs signées côté serveur pour chaque fichier
  async getOne(id: string) {
    const { data, error } = await this.sb
      .from('expenses')
      .select('*, files:expense_files(*), employee:users(id,email)')
      .eq('id', id)
      .single();

    if (error) throw new BadRequestException(error.message);
    if (!data) return data;

    // Si des fichiers existent, on tente de signer chaque chemin de stockage
    if (Array.isArray(data.files) && data.files.length) {
      const signedFiles = await Promise.all(
        data.files.map(async (f: any) => {
          try {
            // Génère une URL signée valable 1h
            const url = await this.storage.signUrl(f.storage_path, 3600);
            return { ...f, signed_url: url };
          } catch {
            // En cas d'échec de signature, on garde le fichier sans URL signée
            return { ...f, signed_url: null };
          }
        })
      );

      return { ...data, files: signedFiles };
    }

    return data;
  }

  // Transition de statut d'une note de frais (APPROVED | REJECTED | PROCESSED)
  async transition(id: string, next: 'APPROVED' | 'REJECTED' | 'PROCESSED', comment?: string) {
    const patch = { status: next, comment };

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
