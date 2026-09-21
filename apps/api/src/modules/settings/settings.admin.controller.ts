import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { messages } from '@ahansk/shared';
import { UpdateSettingDto } from './settings.dto';

@Controller('admin/settings')
@Roles('ADMIN')
export class SettingsAdminController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':key')
  async getByKey(@Param('key') key: string) {
    const data = await this.settingsService.getByKey(key);
    return { success: true, message: messages.settings.fetched, data };
  }

  @Patch(':key')
  async update(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
  ) {
    const data = await this.settingsService.update(key, dto);
    return { success: true, message: messages.settings.updated, data };
  }
}
