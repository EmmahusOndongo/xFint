// create-user.dto.ts
import { IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail() email!: string;

  @IsIn(['EMPLOYEE','MANAGER','ACCOUNTING'])
  role!: 'EMPLOYEE'|'MANAGER'|'ACCOUNTING';

  @IsOptional()
  @IsString()
  @MaxLength(120)
  full_name?: string;
}
