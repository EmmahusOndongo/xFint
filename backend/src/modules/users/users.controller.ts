import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Roles('MANAGER')
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto.email, dto.role);
  }

  @Roles('MANAGER')
  @Get()
  list() { return this.users.list(); }
}
