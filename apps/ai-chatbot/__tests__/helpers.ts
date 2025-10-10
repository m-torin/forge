import { PRIMARY_CHAT_MODEL_ID, REASONING_CHAT_MODEL_ID, type ChatModelId } from '@/lib/ai/models';
import {
  expect,
  type APIRequestContext,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import { generateId } from 'ai';
import { getUnixTime } from 'date-fns';
import fs from 'node:fs';
import path from 'node:path';
import { ChatPage } from './pages/chat';

export type UserContext = {
  context: BrowserContext;
  page: Page;
  request: APIRequestContext;
};

export async function createAuthenticatedContext({
  browser,
  name,
  chatModel = PRIMARY_CHAT_MODEL_ID,
}: {
  browser: Browser;
  name: string;
  chatModel?: ChatModelId;
}): Promise<UserContext> {
  const directory = path.join(__dirname, '../playwright/.sessions');

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  const storageFile = path.join(directory, `${name}.json`);

  const context = await browser.newContext();
  const page = await context.newPage();

  const email = `test-${name}@playwright.com`;
  const password = generateId();

  await page.goto('http://localhost:3000/register');
  await page.getByPlaceholder('user@acme.com').click();
  await page.getByPlaceholder('user@acme.com').fill(email);
  await page.getByLabel('Password').click();
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign Up' }).click();

  await expect(page.getByTestId('toast')).toContainText('Account created successfully!');

  const chatPage = new ChatPage(page);
  await chatPage.createNewChat();
  await chatPage.chooseModelFromSelector(REASONING_CHAT_MODEL_ID);
  await expect(chatPage.getSelectedModel()).resolves.toEqual('Grok 3 Mini (Reasoning)');

  await page.waitForTimeout(1000);
  await context.storageState({ path: storageFile });
  await page.close();

  const newContext = await browser.newContext({ storageState: storageFile });
  const newPage = await newContext.newPage();

  return {
    context: newContext,
    page: newPage,
    request: newContext.request,
  };
}

export function generateRandomTestUser() {
  const email = `test-${getUnixTime(new Date())}@playwright.com`;
  const password = generateId();

  return {
    email,
    password,
  };
}
