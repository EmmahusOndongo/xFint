import {
  Body, Controller, Get, Param, Post, UseGuards, UseInterceptors, UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  /** Manager crée un compte → renvoie aussi le mot de passe temporaire */
  @Roles('MANAGER')
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const { user, tempPassword } = await this.users.createWithTempPassword(dto.email, dto.role);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      must_set_password: user.must_set_password,
      tempPassword, // ← à communiquer à l'utilisateur
    };
  }

  /** (Optionnel) Manager peut régénérer un mot de passe temporaire */
  @Roles('MANAGER')
  @Post(':id/reset-temp-password')
  async reset(@Param('id') id: string) {
    const { tempPassword } = await this.users.resetTempPassword(id);
    return { ok: true, tempPassword };
  }

  @Roles('MANAGER')
  @Get()
  list() {
    return this.users.list();
  }

  /** Utilisateur connecté : changer de mot de passe */
  @Post('me/change-password')
  async changePassword(@CurrentUser() u: any, @Body() dto: ChangePasswordDto) {
    const userId = u?.id ?? u?.sub;
    return this.users.changePassword(userId, dto.currentPassword, dto.newPassword);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async setAvatar(@CurrentUser() u: any, @UploadedFile() file: Express.Multer.File) {
    const userId = u?.id ?? u?.sub;
    console.log('[users/me/avatar] userId =', userId);
    console.log('[users/me/avatar] file =', file?.originalname, file?.mimetype, file?.size);
    if (!userId) throw new BadRequestException('userId manquant');
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    return this.users.setProfilePhoto(userId, file);
  }

  @Get('me/avatar/url')
  async getAvatarUrl(@CurrentUser() u: any) {
    const userId = u?.id ?? u?.sub;
    return this.users.getProfilePhotoSignedUrl(userId);
  }

}
