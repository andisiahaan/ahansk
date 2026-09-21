import { Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { SettingsRepository } from './settings.repository';
import { messages } from '@ahansk/shared';
import type { UpdateSettingDto } from '@ahansk/shared';
import {
  CACHE_KEY_SETTINGS_ENTITY,
  CACHE_KEY_SETTINGS_VALUES,
} from '../../infrastructure/settings/settings-cache.service';

@Injectable()
export class SettingsService {
  constructor(
    private readonly repo: SettingsRepository,
    private readonly cache: CacheService,
  ) {}

  async getByKey(key: string) {
    const cacheKey = CACHE_KEY_SETTINGS_ENTITY(key);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const setting = await this.repo.findByKey(key);
    if (!setting) throw new NotFoundException(messages.settings.notFound);

    await this.cache.set(cacheKey, setting, 300);
    return setting;
  }

  async update(key: string, dto: UpdateSettingDto) {
    const setting = await this.repo.upsert(key, dto.settings as Record<string, unknown>);
    await this.cache.del(CACHE_KEY_SETTINGS_ENTITY(key));
    await this.cache.del(CACHE_KEY_SETTINGS_VALUES(key));
    return setting;
  }
}
