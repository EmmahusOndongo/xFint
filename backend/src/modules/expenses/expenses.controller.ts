import {
  BadRequestException,
  Body, Controller, Get, Param, Patch, Post, UploadedFiles, UseGuards, UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FirstLoginGuard } from '../../common/guards/first-login.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import type { Express } from 'express';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { ExpensesService } from './expenses.service';
import { StorageService } from '../storage/storage.service';
import { memoryStorage } from 'multer';
import { makeSupabaseAdmin } from '../../config/supabase.config';

@UseGuards(JwtAuthGuard, RolesGuard, FirstLoginGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(
    private expenses: ExpensesService,
    private storage: StorageService
  ) {}

  //  Mes notes
  @Get('my')
  mine(@CurrentUser() user: JwtUser) {
    return this.expenses.my(user.sub);
  }

  
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateExpenseDto) {
    return this.expenses.create(user.sub, dto.title, dto.comment);
  }

  // Upload pièces
  @Post(':id/files')
  @UseInterceptors(FilesInterceptor('files'))
  async upload(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return Promise.all(files.map((f) => this.storage.uploadExpenseFile(id, f, user.sub)));
  }

  // Détails
  @Get(':id')
  detail(@Param('id') id: string) {
    return this.expenses.getOne(id);
  }

  // Manager: toutes + valider/refuser
  @Roles('MANAGER')
  @Get()
  allForManager() {
    return this.expenses.allForManager();
  }

  @Roles('MANAGER')
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body('comment') comment?: string) {
    return this.expenses.transition(id, 'APPROVED', comment);
  }

  @Roles('MANAGER')
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body('comment') comment?: string) {
    return this.expenses.transition(id, 'REJECTED', comment);
  }

  // Comptabilité: validées/traitées + marquer traitée
  @Roles('ACCOUNTING')
  @Get('accounting/list')
  allForAccounting() {
    return this.expenses.allForAccounting();
  }

  @Roles('ACCOUNTING')
  @Patch(':id/process')
  process(@Param('id') id: string, @Body('comment') comment?: string) {
    return this.expenses.transition(id, 'PROCESSED', comment);
  }

  @Get(':expenseId/files/:fileId/url')
  async signFile(@Param('expenseId') expenseId: string, @Param('fileId') fileId: string) {
    // retrouve le storage_path de la ligne expense_files
    const sb = makeSupabaseAdmin();
    const { data, error } = await sb
      .from('expense_files')
      .select('storage_path')
      .eq('id', fileId)
      .eq('expense_id', expenseId)
      .single();
    if (error) throw new BadRequestException(error.message);

    const url = await this.storage.signUrl(data.storage_path, 3600);
    return { url, expiresIn: 3600 };
  }
}
