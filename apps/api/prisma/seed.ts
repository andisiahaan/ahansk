import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import {
  SETTING_KEYS,
  DEFAULT_APP_SETTINGS,
  DEFAULT_AUTH_SETTINGS,
} from '@ahansk/shared';
import { hash } from 'argon2';
import 'dotenv/config';

// ─── Prisma Setup ─────────────────────────────────────────────────────────────

function createPrisma(): PrismaClient {
  const url = new URL(process.env.DATABASE_URL!);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port || '3306', 10),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

const prisma = createPrisma();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) { console.log(msg); }

// ─── Settings ─────────────────────────────────────────────────────────────────

async function seedSettings() {
  log('\n📦 Settings');
  const rows = [
    { key: SETTING_KEYS.APP,  settings: DEFAULT_APP_SETTINGS  },
    { key: SETTING_KEYS.AUTH, settings: DEFAULT_AUTH_SETTINGS },
  ];
  for (const { key, settings } of rows) {
    const json = settings as unknown as Parameters<typeof prisma.setting.create>[0]['data']['settings'];
    await prisma.setting.upsert({
      where: { key },
      create: { key, settings: json },
      update: {}, // never overwrite existing — only seed if missing
    });
    log(`  ✅ settings[${key}]`);
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

async function seedUsers() {
  log('\n👤 Users');

  const adminPw = await hash('ahandev');
  const userPw  = await hash('ahandev');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ahandev.com' },
    create: {
      email: 'admin@ahandev.com',
      password: adminPw,
      name: 'Super Admin',
      role: 'ADMIN',
      is_active: true,
      email_verified_at: new Date(),
    },
    update: {
      password: adminPw,
      role: 'ADMIN',
      email_verified_at: new Date(),
    },
  });
  log(`  ✅ admin@ahandev.com  (role: ADMIN, pw: ahandev)`);

  const user = await prisma.user.upsert({
    where: { email: 'user@ahandev.com' },
    create: {
      email: 'user@ahandev.com',
      password: userPw,
      name: 'John Doe',
      role: 'USER',
      is_active: true,
      email_verified_at: new Date(),
    },
    update: {
      password: userPw,
    },
  });
  log(`  ✅ user@ahandev.com   (role: USER, pw: ahandev)`);

  return { admin, user };
}


// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  log('🌱 Seeding database...');

  await seedSettings();
  await seedUsers();

  log('\n✅ Seeding complete!\n');
  log('   Admin login: admin@ahandev.com / ahandev');
  log('   User  login: user@ahandev.com  / ahandev');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => { void prisma.$disconnect(); });
