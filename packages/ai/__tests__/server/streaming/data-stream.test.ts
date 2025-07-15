import { createDataStreamHelper, DataStreamHelper } from '@/shared/streaming/data-stream';
import { describe, expect, vi } from 'vitest';

describe('dataStreamHelper', () => {
  const mockDataStream = {
    writeData: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should create a data stream helper', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    expect(helper).toBeInstanceOf(DataStreamHelper);
  });

  test('should write kind data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    helper.writeKind('document');

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'kind',
      content: 'document',
    });
  });

  test('should write id data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    helper.writeId('test-id');

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'id',
      content: 'test-id',
    });
  });

  test('should write title data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    helper.writeTitle('Test Title');

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'title',
      content: 'Test Title',
    });
  });

  test('should write clear data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    helper.writeClear();

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'clear',
      content: '',
    });
  });

  test('should write finish data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    helper.writeFinish();

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'finish',
      content: '',
    });
  });

  test('should append message', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    const message = { id: '1', content: 'test' };
    helper.appendMessage(message);

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'append-message',
      message: JSON.stringify(message),
    });
  });

  test('should write custom data', () => {
    const helper = createDataStreamHelper(mockDataStream as any);
    helper.writeCustom('custom-type', 'custom-content');

    expect(mockDataStream.writeData).toHaveBeenCalledWith({
      type: 'custom-type',
      content: 'custom-content',
    });
  });
});
