import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { SettingsRepository } from '../../modules/settings/settings.repository';
import {
  SETTING_KEYS,
  DEFAULT_APP_SETTINGS,
  DEFAULT_AUTH_SETTINGS,
} from '@ahansk/shared';
import type { SettingKey, SettingValueMap } from '@ahansk/shared';

export const CACHE_KEY_SETTINGS_VALUES = (key: string) => `settings:values:${key}`;
export const CACHE_KEY_SETTINGS_ENTITY = (key: string) => `settings:entity:${key}`;

@Injectable()
export class SettingsCache {
  constructor(
    private readonly repo: SettingsRepository,
    private readonly cache: CacheService,
  ) {}

  async get<K extends SettingKey>(key: K): Promise<SettingValueMap[K]> {
    const cacheKey = CACHE_KEY_SETTINGS_VALUES(key);
    const cached = await this.cache.get<SettingValueMap[K]>(cacheKey);
    if (cached) return cached;

    const record = await this.repo.findByKey(key);
    const value = (record?.settings ?? this.getDefault(key)) as SettingValueMap[K];

    await this.cache.set(cacheKey, value, 60);
    return value;
  }

  async invalidate(key: string): Promise<void> {
    await this.cache.del(CACHE_KEY_SETTINGS_VALUES(key));
    await this.cache.del(CACHE_KEY_SETTINGS_ENTITY(key));
  }

  private getDefault(key: SettingKey): SettingValueMap[SettingKey] {
    switch (key) {
      case SETTING_KEYS.APP:  return DEFAULT_APP_SETTINGS;
      case SETTING_KEYS.AUTH: return DEFAULT_AUTH_SETTINGS;
      default: return {} as SettingValueMap[SettingKey];
    }
  }
}
