import { IsOptional, IsString, MaxLength } from 'class-validator';

// DTO (Data Transfer Object) pour la création d'une dépense
export class CreateExpenseDto {
  // Champ obligatoire : titre de la dépense
  // - Doit être une chaîne de caractères
  // - Longueur max : 200 caractères
  @IsString()
  @MaxLength(200)
  title!: string;

  // Champ optionnel : commentaire associé à la dépense
  // - Si présent, doit être une chaîne de caractères
  @IsOptional()
  @IsString()
  comment?: string;
}
