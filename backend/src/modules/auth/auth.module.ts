import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  // Imports nécessaires :
  // - PassportModule : intègre Passport à NestJS (stratégies, guards, etc.)
  // - JwtModule : permet de signer et vérifier des JWT
  // - UsersModule : pour interagir avec les utilisateurs
  imports: [PassportModule, JwtModule.register({}), UsersModule],

  // Contrôleurs liés à l'authentification
  controllers: [AuthController],

  // Providers : services et stratégies disponibles dans ce module
  providers: [AuthService, JwtStrategy],

  // Exports : rend AuthService disponible pour d'autres modules
  exports: [AuthService],
})
export class AuthModule {}
