import { IsOptional, IsString, MaxLength } from 'class-validator';
export class CreateExpenseDto {
  @IsString() @MaxLength(200) title!: string;
  @IsOptional() @IsString() comment?: string;
}