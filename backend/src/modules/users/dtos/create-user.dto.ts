import { IsEmail, IsIn } from 'class-validator';
export class CreateUserDto {
  @IsEmail() email!: string;
  @IsIn(['EMPLOYEE','MANAGER','ACCOUNTING']) role!: 'EMPLOYEE'|'MANAGER'|'ACCOUNTING';
}
