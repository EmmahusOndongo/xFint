import {
  Body, Controller, Get, Param, Patch, Post, UploadedFiles, UseGuards, UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FirstLoginGuard } from '../../common/guards/first-login.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import type { Express } from 'express'; // important avec isolatedModules
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { ExpensesService } from './expenses.service';
import { StorageService } from '../storage/storage.service';

@UseGuards(JwtAuthGuard, RolesGuard, FirstLoginGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private expenses: ExpensesService, private storage: StorageService) {}

  // Page 2 - Mes notes
  @Get('my')
  mine(@CurrentUser() user: JwtUser) {
    return this.expenses.my(user.sub);
  }

  // Page 3 - Création
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

  // Page 4 - Manager: toutes + valider/refuser
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

  // Page 4 - Comptabilité: validées/traitées + marquer traitée
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
}
