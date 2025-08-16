import { Module, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { SetupService } from './setup.service';

@Module({ providers: [SetupService] })
export class SetupModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(SetupModule.name);
  constructor(private readonly setup: SetupService) {}

  async onApplicationBootstrap() {
    if (process.env.AUTO_SETUP !== 'true') {
      this.logger.log('AUTO_SETUP=false → skip setup');
      return;
    }
    await this.setup.run();
  }
}