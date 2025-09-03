// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { StorageModule } from './modules/storage/storage.module';
import { HealthModule } from './modules/health/health.module';
import { SetupModule } from './setup/setup.module'; // a decommenter c est une nouvelle base de données afin de creer les tables automatiquement

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 100 }]),
    AuthModule,
    UsersModule,
    ExpensesModule,
    StorageModule,
    HealthModule,
    //SetupModule, // a decommenter c est une nouvelle base de données afin de creer les tables automatiquement
  ],
})
export class AppModule {}
