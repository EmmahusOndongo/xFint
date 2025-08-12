import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

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
}
