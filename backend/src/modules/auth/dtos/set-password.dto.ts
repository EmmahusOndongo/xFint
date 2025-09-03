import { IsString, MinLength } from 'class-validator';

// DTO (Data Transfer Object) utilisé pour définir ou réinitialiser un mot de passe
export class SetPasswordDto {
  // Champ newPassword : doit être une chaîne de caractères
  // et contenir au moins 8 caractères
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
