import { expect, Page } from '@playwright/test';

export class ArtifactPage {
  constructor(private page: Page) {}

  public get artifact() {
    return this.page.getByTestId('artifact');
  }

  public get sendButton() {
    return this.artifact.getByTestId('send-button');
  }

  public get stopButton() {
    return this.page.getByTestId('stop-button');
  }

  public get multimodalInput() {
    return this.page.getByTestId('multimodal-input');
  }

  async isGenerationComplete() {
    const response = await this.page.waitForResponse(response =>
      response.url().includes('/api/chat'),
    );

    await response.finished();
  }

  async sendUserMessage(message: string) {
    await this.artifact.getByTestId('multimodal-input').click();
    await this.artifact.getByTestId('multimodal-input').fill(message);
    await this.artifact.getByTestId('send-button').click();
  }

  async getRecentAssistantMessage() {
    const messageElements = await this.artifact.getByTestId('message-assistant').all();
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
    };
  }

  async getRecentUserMessage() {
    const messageElements = await this.artifact.getByTestId('message-user').all();
    const lastMessageElement = messageElements[messageElements.length - 1];

    const content = await lastMessageElement.innerText();

    const messageAttachments = lastMessageElement.getByTestId('message-attachments');
    const hasAttachments = await messageAttachments.isVisible().catch(() => false);

    const attachments = hasAttachments ? await messageAttachments.all() : [];

    const page = this.artifact;

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

  async closeArtifact() {
    return this.page.getByTestId('artifact-close-button').click();
  }
}
