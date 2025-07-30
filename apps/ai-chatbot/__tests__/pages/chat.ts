import { expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { chatModels } from '../mocks/models';

export class ChatPage {
  constructor(private page: Page) {}

  public get sendButton() {
    return this.page.getByTestId('send-button');
  }

  public get stopButton() {
    return this.page.getByTestId('stop-button');
  }

  public get multimodalInput() {
    return this.page.getByTestId('multimodal-input');
  }

  public get scrollContainer() {
    return this.page.locator('.overflow-y-scroll');
  }

  public get scrollToBottomButton() {
    return this.page.getByTestId('scroll-to-bottom-button');
  }

  public getElementByTestId(testId: string) {
    return this.page.getByTestId(testId);
  }

  async createNewChat() {
    await this.page.goto('/');
  }

  public getCurrentURL(): string {
    return this.page.url();
  }

  async sendUserMessage(message: string) {
    await this.multimodalInput.click();
    await this.multimodalInput.fill(message);
    await this.sendButton.click();
  }

  async isGenerationComplete() {
    const response = await this.page.waitForResponse(response =>
      response.url().includes('/api/chat'),
    );

    await response.finished();
  }

  async isVoteComplete() {
    const response = await this.page.waitForResponse(response =>
      response.url().includes('/api/vote'),
    );

    await response.finished();
  }

  async hasChatIdInUrl() {
    await expect(this.page).toHaveURL(
      /^http:\/\/localhost:3000\/chat\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  }

  async sendUserMessageFromSuggestion() {
    await this.page.getByRole('button', { name: 'What are the advantages of' }).click();
  }

  async isElementVisible(elementId: string) {
    await expect(this.page.getByTestId(elementId)).toBeVisible();
  }

  async isElementNotVisible(elementId: string) {
    await expect(this.page.getByTestId(elementId)).not.toBeVisible();
  }

  async addImageAttachment() {
    this.page.on('filechooser', async fileChooser => {
      const filePath = path.join(
        process.cwd(),
        'public',
        'images',
        'mouth of the seine, monet.jpg',
      );
      const imageBuffer = fs.readFileSync(filePath);

      await fileChooser.setFiles({
        name: 'mouth of the seine, monet.jpg',
        mimeType: 'image/jpeg',
        buffer: imageBuffer,
      });
    });

    await this.page.getByTestId('attachments-button').click();
  }

  public async getSelectedModel() {
    const modelId = await this.page.getByTestId('model-selector').innerText();
    return modelId;
  }

  public async chooseModelFromSelector(chatModelId: string) {
    const chatModel = chatModels.find(chatModel => chatModel.id === chatModelId);

    if (!chatModel) {
      throw new Error(`Model with id ${chatModelId} not found`);
    }

    await this.page.getByTestId('model-selector').click();
    await this.page.getByTestId(`model-selector-item-${chatModelId}`).click();
    expect(await this.getSelectedModel()).toBe(chatModel.name);
  }

  public async getSelectedVisibility() {
    const visibilityId = await this.page.getByTestId('visibility-selector').innerText();
    return visibilityId;
  }

  public async chooseVisibilityFromSelector(chatVisibility: 'public' | 'private') {
    await this.page.getByTestId('visibility-selector').click();
    await this.page.getByTestId(`visibility-selector-item-${chatVisibility}`).click();
    expect(await this.getSelectedVisibility()).toBe(chatVisibility);
  }

  async getRecentAssistantMessage() {
    const messageElements = await this.page.getByTestId('message-assistant').all();
    const lastMessageElement = messageElements[messageElements.length - 1];

    const messageContent = lastMessageElement.getByTestId('message-content');
    const content = await messageContent.innerText().catch(() => null);

    const messageReasoningElement = lastMessageElement.getByTestId('message-reasoning');
    const reasoningElement = await messageReasoningElement
      .isVisible()
      .then(async visible => (visible ? await messageReasoningElement.innerText() : null))
      .catch(() => null);

    return {
      element: lastMessageElement,
      content,
      reasoning: reasoningElement,
      async toggleReasoningVisibility() {
        await lastMessageElement.getByTestId('message-reasoning-toggle').click();
      },
      async upvote() {
        const upvoteButton = lastMessageElement.getByTestId('message-upvote');
        await upvoteButton.click();
      },
      async downvote() {
        const downvoteButton = lastMessageElement.getByTestId('message-downvote');
        await downvoteButton.click();
      },
    };
  }

  async getRecentUserMessage() {
    const messageElements = await this.page.getByTestId('message-user').all();
    const lastMessageElement = messageElements.at(-1);

    if (!lastMessageElement) {
      throw new Error('No user message found');
    }

    const userMessageContent = lastMessageElement.getByTestId('message-content');
    const content = await userMessageContent.innerText().catch(() => null);

    const messageAttachments = lastMessageElement.getByTestId('message-attachments');
    const hasAttachments = await messageAttachments.isVisible().catch(() => false);

    const attachments = hasAttachments ? await messageAttachments.all() : [];

    const page = this.page;

    return {
      element: lastMessageElement,
      content,
      attachments,
      async edit(newMessage: string) {
        const editButton = page.getByTestId('message-edit-button');
        const messageEditor = page.getByTestId('message-editor');
        const sendButton = page.getByTestId('message-editor-send-button');

        await editButton.click();
        await messageEditor.fill(newMessage);
        await sendButton.click();
        await expect(sendButton).not.toBeVisible();
      },
    };
  }

  async expectToastToContain(text: string) {
    await expect(this.page.getByTestId('toast')).toContainText(text);
  }

  async openSideBar() {
    const sidebarToggleButton = this.page.getByTestId('sidebar-toggle-button');
    await sidebarToggleButton.click();
  }

  public async isScrolledToBottom(): Promise<boolean> {
    return this.scrollContainer.evaluate(
      el => Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 1,
    );
  }

  public async waitForScrollToBottom(timeout = 5_000): Promise<void> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      if (await this.isScrolledToBottom()) return;
      await this.page.waitForTimeout(100);
    }

    throw new Error(`Timed out waiting for scroll bottom after ${timeout}ms`);
  }

  public async sendMultipleMessages(count: number, makeMessage: (i: number) => string) {
    for (let i = 0; i < count; i++) {
      await this.sendUserMessage(makeMessage(i));
      await this.isGenerationComplete();
    }
  }

  public async scrollToTop(): Promise<void> {
    await this.scrollContainer.evaluate(element => {
      element.scrollTop = 0;
    });
  }
}
