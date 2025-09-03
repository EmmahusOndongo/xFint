import { IsEmail, IsString, MinLength } from 'class-validator';

// DTO (Data Transfer Object) utilisé pour la connexion (login)
export class LoginDto {
  // Champ email : doit être une adresse email valide
  @IsEmail()
  email!: string;

  // Champ password : doit être une chaîne de caractères d'au moins 6 caractères
  @IsString()
  @MinLength(6)
  password!: string;
}
