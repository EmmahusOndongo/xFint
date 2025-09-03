import { IsIn, IsOptional, IsString } from 'class-validator';

// DTO (Data Transfer Object) pour mettre à jour le statut d'une dépense (ou autre entité)
export class UpdateStatusDto {
  // Champ obligatoire : prochain statut
  // - Doit être l'une des valeurs autorisées : 'APPROVED' | 'REJECTED' | 'PROCESSED'
  @IsIn(['APPROVED', 'REJECTED', 'PROCESSED'])
  next!: 'APPROVED' | 'REJECTED' | 'PROCESSED';

  // Champ optionnel : commentaire associé au changement de statut
  // - Si présent, doit être une chaîne de caractères
  @IsOptional()
  @IsString()
  comment?: string;
}
