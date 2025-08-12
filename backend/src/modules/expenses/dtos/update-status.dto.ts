import { IsIn, IsOptional, IsString } from 'class-validator';
export class UpdateStatusDto {
  @IsIn(['APPROVED','REJECTED','PROCESSED']) next!: 'APPROVED'|'REJECTED'|'PROCESSED';
  @IsOptional() @IsString() comment?: string;
}
