import { Global, Module } from '@nestjs/common';
import { SettingsCache } from './settings-cache.service';
import { SettingsRepository } from '../../modules/settings/settings.repository';

@Global()
@Module({
  providers: [SettingsCache, SettingsRepository],
  exports: [SettingsCache, SettingsRepository],
})
export class SettingsCacheModule {}
