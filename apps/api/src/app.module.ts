import { Module } from '@nestjs/common';
import { DevicesModule } from './modules/devices/devices.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [AuthModule, DevicesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
