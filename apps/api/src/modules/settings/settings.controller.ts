import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Public } from '../../common/decorators/public.decorator';
import { messages, SETTING_KEYS } from '@ahansk/shared';

const PUBLIC_SETTING_KEYS = new Set<string>([
  SETTING_KEYS.APP,
  SETTING_KEYS.AUTH,
  SETTING_KEYS.CUSTOM_TAGS,
]);

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get(':key')
  async getByKey(@Param('key') key: string) {
    if (!PUBLIC_SETTING_KEYS.has(key)) {
      throw new NotFoundException('Setting not found');
    }
    const data = await this.settingsService.getByKey(key);
    return { success: true, message: messages.settings.fetched, data };
  }
}
