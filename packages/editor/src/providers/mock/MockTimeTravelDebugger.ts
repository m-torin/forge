import { logError } from '@repo/observability';
import { EventEmitter } from 'events';
import * as Y from 'yjs';

export interface HistorySnapshot {
  id: string;
  timestamp: number;
  content: string;
  author: string;
  operation: 'insert' | 'delete' | 'format';
  position: number;
  length: number;
  state: Uint8Array;
}

export interface TimeTravelState {
  snapshots: HistorySnapshot[];
  currentIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
}

/**
 * MockTimeTravelDebugger enables time-travel debugging for Y.js collaboration
 * Shows how edits were applied over time and allows stepping through history
 */
export class MockTimeTravelDebugger extends EventEmitter {
  private ydoc: Y.Doc;
  private snapshots: HistorySnapshot[] = [];
  private currentIndex: number = -1;
  private isRecording: boolean = true;
  private isReplaying: boolean = false;
  private replayInterval?: NodeJS.Timeout;
  private playbackSpeed: number = 1000; // ms between steps

  constructor(ydoc: Y.Doc) {
    super();
    this.ydoc = ydoc;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.ydoc.on('update', (update: Uint8Array, origin: any) => {
      if (this.isRecording && !this.isReplaying && origin) {
        this.captureSnapshot(update, origin);
      }
    });
  }

  private captureSnapshot(update: Uint8Array, origin: any): void {
    const ytext = this.ydoc.getText('content');
    const content = ytext.toString();

    // Try to determine the operation type and details
    const operation = this.analyzeOperation(update);

    const snapshot: HistorySnapshot = {
      id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      content,
      author: origin?.toString() || 'unknown',
      operation: operation.type,
      position: operation.position,
      length: operation.length,
      state: Y.encodeStateAsUpdate(this.ydoc),
    };

    this.snapshots.push(snapshot);
    this.currentIndex = this.snapshots.length - 1;

    this.emit('snapshotAdded', snapshot);
    this.emit('stateChanged', this.getTimeTravelState());
  }

  private analyzeOperation(update: Uint8Array): {
    type: 'insert' | 'delete' | 'format';
    position: number;
    length: number;
  } {
    // This is a simplified analysis - in a real implementation,
    // you'd parse the Y.js update structure more thoroughly
    try {
      const doc = new Y.Doc();
      Y.applyUpdate(doc, update);
      const text = doc.getText('content');

      return {
        type: 'insert', // Default to insert for simplicity
        position: 0,
        length: text.length,
      };
    } catch {
      return {
        type: 'insert',
        position: 0,
        length: 0,
      };
    }
  }

  // Time travel controls
  stepForward(): boolean {
    if (this.currentIndex < this.snapshots.length - 1) {
      this.currentIndex++;
      this.restoreToSnapshot(this.currentIndex);
      return true;
    }
    return false;
  }

  stepBackward(): boolean {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.restoreToSnapshot(this.currentIndex);
      return true;
    }
    return false;
  }

  jumpToSnapshot(index: number): boolean {
    if (index >= 0 && index < this.snapshots.length) {
      this.currentIndex = index;
      this.restoreToSnapshot(index);
      return true;
    }
    return false;
  }

  jumpToTimestamp(timestamp: number): boolean {
    const closestIndex = this.findClosestSnapshotToTimestamp(timestamp);
    if (closestIndex !== -1) {
      return this.jumpToSnapshot(closestIndex);
    }
    return false;
  }

  private findClosestSnapshotToTimestamp(timestamp: number): number {
    let closestIndex = -1;
    let closestDiff = Infinity;

    for (let i = 0; i < this.snapshots.length; i++) {
      const diff = Math.abs(this.snapshots[i].timestamp - timestamp);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  private restoreToSnapshot(index: number): void {
    if (index < 0 || index >= this.snapshots.length) return;

    const snapshot = this.snapshots[index];
    this.isReplaying = true;

    // Create a new document and restore the state
    const tempDoc = new Y.Doc();
    Y.applyUpdate(tempDoc, snapshot.state);

    // Clear current document and apply the snapshot state
    this.ydoc.transact(() => {
      const ytext = this.ydoc.getText('content');
      ytext.delete(0, ytext.length);
      ytext.insert(0, snapshot.content);
    }, 'time-travel-restore');

    this.isReplaying = false;

    this.emit('snapshotRestored', snapshot);
    this.emit('stateChanged', this.getTimeTravelState());
  }

  // Playback controls
  startPlayback(speed: number = 1000): void {
    if (this.replayInterval) {
      clearInterval(this.replayInterval);
    }

    this.playbackSpeed = speed;
    this.currentIndex = -1; // Start from beginning

    this.replayInterval = setInterval(() => {
      if (!this.stepForward()) {
        this.stopPlayback();
      }
    }, speed);

    this.emit('playbackStarted', { speed });
  }

  stopPlayback(): void {
    if (this.replayInterval) {
      clearInterval(this.replayInterval);
      this.replayInterval = undefined;
    }

    this.emit('playbackStopped');
  }

  setPlaybackSpeed(speed: number): void {
    this.playbackSpeed = speed;
    if (this.replayInterval) {
      this.stopPlayback();
      this.startPlayback(speed);
    }
  }

  // Recording controls
  startRecording(): void {
    this.isRecording = true;
    this.emit('recordingStarted');
  }

  stopRecording(): void {
    this.isRecording = false;
    this.emit('recordingStopped');
  }

  clearHistory(): void {
    this.snapshots = [];
    this.currentIndex = -1;
    this.emit('historyCleared');
    this.emit('stateChanged', this.getTimeTravelState());
  }

  // Export/Import capabilities
  exportHistory(): string {
    return JSON.stringify({
      snapshots: this.snapshots.map(s => ({
        ...s,
        state: Array.from(s.state), // Convert Uint8Array to regular array for JSON
      })),
      version: '1.0',
      exportedAt: Date.now(),
    });
  }

  importHistory(historyJson: string): boolean {
    try {
      const data = JSON.parse(historyJson);
      this.snapshots = data.snapshots.map((s: any) => ({
        ...s,
        state: new Uint8Array(s.state), // Convert back to Uint8Array
      }));
      this.currentIndex = this.snapshots.length - 1;
      this.emit('historyImported', { count: this.snapshots.length });
      this.emit('stateChanged', this.getTimeTravelState());
      return true;
    } catch (error) {
      logError('Failed to import history:', error);
      return false;
    }
  }

  // Analysis capabilities
  getCollaborationStats(): {
    totalEdits: number;
    editsByAuthor: Record<string, number>;
    editsByType: Record<string, number>;
    timeRange: { start: number; end: number };
    mostActiveAuthor: string;
  } {
    const editsByAuthor: Record<string, number> = {};
    const editsByType: Record<string, number> = {};
    let timeRange = { start: Infinity, end: 0 };

    this.snapshots.forEach(snapshot => {
      // Count by author
      editsByAuthor[snapshot.author] = (editsByAuthor[snapshot.author] || 0) + 1;

      // Count by type
      editsByType[snapshot.operation] = (editsByType[snapshot.operation] || 0) + 1;

      // Update time range
      if (snapshot.timestamp < timeRange.start) timeRange.start = snapshot.timestamp;
      if (snapshot.timestamp > timeRange.end) timeRange.end = snapshot.timestamp;
    });

    const mostActiveAuthor =
      Object.entries(editsByAuthor).sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    return {
      totalEdits: this.snapshots.length,
      editsByAuthor,
      editsByType,
      timeRange: timeRange.start === Infinity ? { start: 0, end: 0 } : timeRange,
      mostActiveAuthor,
    };
  }

  findConflicts(): Array<{
    timestamp: number;
    authors: string[];
    position: number;
    description: string;
  }> {
    const conflicts = [];
    const timeWindow = 1000; // 1 second window for conflict detection

    for (let i = 1; i < this.snapshots.length; i++) {
      const current = this.snapshots[i];
      const previous = this.snapshots[i - 1];

      if (
        current.timestamp - previous.timestamp < timeWindow &&
        current.author !== previous.author &&
        Math.abs(current.position - previous.position) < 10 // Close positions
      ) {
        conflicts.push({
          timestamp: current.timestamp,
          authors: [previous.author, current.author],
          position: current.position,
          description: `Potential conflict between ${previous.author} and ${current.author} at position ${current.position}`,
        });
      }
    }

    return conflicts;
  }

  // State getters
  getTimeTravelState(): TimeTravelState {
    return {
      snapshots: [...this.snapshots],
      currentIndex: this.currentIndex,
      isPlaying: !!this.replayInterval,
      playbackSpeed: this.playbackSpeed,
    };
  }

  getCurrentSnapshot(): HistorySnapshot | null {
    return this.currentIndex >= 0 ? this.snapshots[this.currentIndex] : null;
  }

  getSnapshotCount(): number {
    return this.snapshots.length;
  }

  isAtLatest(): boolean {
    return this.currentIndex === this.snapshots.length - 1;
  }

  isAtEarliest(): boolean {
    return this.currentIndex === 0 || this.snapshots.length === 0;
  }

  destroy(): void {
    this.stopPlayback();
    this.stopRecording();
    this.removeAllListeners();
  }
}
