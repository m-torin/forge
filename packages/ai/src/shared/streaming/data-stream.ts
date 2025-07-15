/**
 * AI SDK Streaming Utilities
 * Following Vercel AI SDK patterns for data streaming
 *
 * Provides both utility functions and a helper class for data streaming
 */

import type { DataStreamWriter } from 'ai';

export type DataStreamMessage =
  | { type: 'kind'; content: string }
  | { type: 'id'; content: string }
  | { type: 'title'; content: string }
  | { type: 'clear'; content: string }
  | { type: 'finish'; content: string }
  | { type: 'append-message'; message: string }
  | { type: 'custom'; content: any };

/**
 * DataStreamHelper class for object-oriented data stream operations
 */
export class DataStreamHelper {
  private dataStream: DataStreamWriter;

  constructor(dataStream: DataStreamWriter) {
    this.dataStream = dataStream;
  }

  writeKind(kind: string) {
    this.dataStream.writeData({ type: 'kind', content: kind });
  }

  writeId(id: string) {
    this.dataStream.writeData({ type: 'id', content: id });
  }

  writeTitle(title: string) {
    this.dataStream.writeData({ type: 'title', content: title });
  }

  writeClear() {
    this.dataStream.writeData({ type: 'clear', content: '' });
  }

  writeFinish() {
    this.dataStream.writeData({ type: 'finish', content: '' });
  }

  appendMessage(message: any) {
    this.dataStream.writeData({
      type: 'append-message',
      message: JSON.stringify(message),
    });
  }

  writeCustom(type: string, content: any) {
    this.dataStream.writeData({ type, content });
  }
}

/**
 * Create a new DataStreamHelper instance
 */
export function createDataStreamHelper(dataStream: DataStreamWriter): DataStreamHelper {
  return new DataStreamHelper(dataStream);
}

/**
 * Utility functions for common data stream operations
 * Use these instead of the DataStreamHelper class for better AI SDK alignment
 */

export function writeKind(dataStream: DataStreamWriter, kind: string) {
  dataStream.writeData({ type: 'kind', content: kind });
}

export function writeId(dataStream: DataStreamWriter, id: string) {
  dataStream.writeData({ type: 'id', content: id });
}

export function writeTitle(dataStream: DataStreamWriter, title: string) {
  dataStream.writeData({ type: 'title', content: title });
}

export function writeClear(dataStream: DataStreamWriter) {
  dataStream.writeData({ type: 'clear', content: '' });
}

export function writeFinish(dataStream: DataStreamWriter) {
  dataStream.writeData({ type: 'finish', content: '' });
}

export function appendMessage(dataStream: DataStreamWriter, message: any) {
  dataStream.writeData({
    type: 'append-message',
    message: JSON.stringify(message),
  });
}

export function writeCustom(dataStream: DataStreamWriter, type: string, content: any) {
  dataStream.writeData({ type, content });
}

/**
 * Batch write multiple data stream messages
 */
export function writeMultiple(dataStream: DataStreamWriter, messages: DataStreamMessage[]) {
  for (const message of messages) {
    dataStream.writeData(message);
  }
}
