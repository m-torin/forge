import { deleteGeneric } from '../shared-operations';
import type {
  SettingDataType,
  SystemSetting,
  SystemSettingCreateInput,
  SystemSettingUpdateInput,
} from '../types/cms';
import type { PrismaClient, PrismaTransactionClient } from '../types/shared';
import { validation } from '../utils';

// ==================== SYSTEM SETTING ORM FUNCTIONS ====================

export async function create(
  prisma: PrismaClient | PrismaTransactionClient,
  data: SystemSettingCreateInput,
): Promise<SystemSetting> {
  return prisma.systemSetting.create({ data: validation.sanitizeInput(data) });
}

export async function find(
  prisma: PrismaClient | PrismaTransactionClient,
  id: string,
): Promise<SystemSetting | null> {
  return prisma.systemSetting.findUnique({ where: { id } });
}

export async function findSystemSettingByKey(
  prisma: PrismaClient | PrismaTransactionClient,
  key: string,
): Promise<SystemSetting | null> {
  return prisma.systemSetting.findUnique({ where: { key } });
}

export async function findAllSystemSettings(
  prisma: PrismaClient | PrismaTransactionClient,
  category?: string,
): Promise<SystemSetting[]> {
  return prisma.systemSetting.findMany({
    where: category ? { category } : undefined,
    orderBy: { key: 'asc' },
  });
}

export async function updateSystemSettingByKey(
  prisma: PrismaClient | PrismaTransactionClient,
  key: string,
  data: SystemSettingUpdateInput,
): Promise<SystemSetting> {
  return prisma.systemSetting.update({
    where: { key },
    data: validation.sanitizeInput(data),
  });
}

export async function upsertSystemSetting(
  prisma: PrismaClient | PrismaTransactionClient,
  key: string,
  value: string,
  category: string = 'general',
  description?: string,
  label?: string,
  dataType: SettingDataType = 'STRING',
): Promise<SystemSetting> {
  return prisma.systemSetting.upsert({
    where: { key },
    create: {
      key,
      value,
      category,
      label: label || key,
      description,
      dataType,
    },
    update: {
      value,
      category,
      description,
    },
  });
}

export async function deleteSystemSettingByKey(
  prisma: PrismaClient | PrismaTransactionClient,
  key: string,
): Promise<SystemSetting> {
  return deleteGeneric(prisma.systemSetting as any, { where: { key } });
}

export async function getSystemSettingValue(
  prisma: PrismaClient | PrismaTransactionClient,
  key: string,
  defaultValue?: string,
): Promise<string | null> {
  const setting = await findSystemSettingByKey(prisma, key);
  if (!setting?.value) return defaultValue ?? null;

  // Convert JsonValue to string
  if (typeof setting.value === 'string') return setting.value;
  return JSON.stringify(setting.value);
}

export async function setSystemSettingValue(
  prisma: PrismaClient | PrismaTransactionClient,
  key: string,
  value: string,
  category?: string,
): Promise<SystemSetting> {
  return upsertSystemSetting(prisma, key, value, category);
}
