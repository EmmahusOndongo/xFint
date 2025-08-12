import { IsIn, IsOptional } from 'class-validator';
export class UpdateUserDto {
  @IsOptional() @IsIn(['EMPLOYEE','MANAGER','ACCOUNTING']) role?: 'EMPLOYEE'|'MANAGER'|'ACCOUNTING';
}
