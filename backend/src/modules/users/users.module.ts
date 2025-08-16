// users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { StorageService } from '../storage/storage.service'; // <-- adapte le chemin

@Module({
  controllers: [UsersController],
  providers: [UsersService, StorageService], // <-- ajoute StorageService ici
  exports: [UsersService],
})
export class UsersModule {}
