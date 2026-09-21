import { Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { SettingsRepository } from './settings.repository';
import {
  messages,
  SETTING_KEYS,
  DEFAULT_APP_SETTINGS,
  DEFAULT_AUTH_SETTINGS,
  DEFAULT_CUSTOM_TAGS_SETTINGS,
} from '@ahansk/shared';
import type { UpdateSettingDto, AuthSettings } from '@ahansk/shared';
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

  private getDefault(key: string): Record<string, unknown> {
    switch (key) {
      case SETTING_KEYS.APP:
        return DEFAULT_APP_SETTINGS as unknown as Record<string, unknown>;
      case SETTING_KEYS.AUTH:
        return DEFAULT_AUTH_SETTINGS as unknown as Record<string, unknown>;
      case SETTING_KEYS.CUSTOM_TAGS:
        return DEFAULT_CUSTOM_TAGS_SETTINGS as unknown as Record<string, unknown>;
      default:
        return {};
    }
  }

  async getByKey(key: string) {
    const cacheKey = CACHE_KEY_SETTINGS_ENTITY(key);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const setting = await this.repo.findByKey(key);
    const defaults = this.getDefault(key);

    if (!setting) {
      // If setting record is not created yet, return defaults
      const initial = {
        key,
        settings: defaults,
      };
      return initial;
    }

    const merged = {
      ...setting,
      settings: {
        ...defaults,
        ...((setting.settings as Record<string, unknown>) ?? {}),
      },
    };

    await this.cache.set(cacheKey, merged, 300);
    return merged;
  }

  async update(key: string, dto: UpdateSettingDto) {
    const defaults = this.getDefault(key);
    const mergedSettings = {
      ...defaults,
      ...(dto.settings as Record<string, unknown>),
    };
    const setting = await this.repo.upsert(key, mergedSettings);
    await this.cache.del(CACHE_KEY_SETTINGS_ENTITY(key));
    await this.cache.del(CACHE_KEY_SETTINGS_VALUES(key));
    return setting;
  }

  async getAuthSettings(): Promise<AuthSettings> {
    try {
      const res = (await this.getByKey(SETTING_KEYS.AUTH)) as any;
      return (res?.settings ?? DEFAULT_AUTH_SETTINGS) as AuthSettings;
    } catch {
      return DEFAULT_AUTH_SETTINGS;
    }
  }
}
