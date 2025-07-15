import * as Y from 'yjs';
import { MockWebSocketProvider } from './MockWebSocketProvider';

export interface MockUser {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  editingPattern: 'aggressive' | 'moderate' | 'passive' | 'observer';
  isActive: boolean;
  provider?: MockWebSocketProvider;
  ydoc?: Y.Doc;
}

export interface MockUserBehavior {
  editFrequency: number; // edits per minute
  editSize: number; // average characters per edit
  movementFrequency: number; // cursor movements per minute
  pauseDuration: number; // average pause between actions (ms)
  conflictProbability: number; // probability of editing same area as others
}

export class MockUserManager {
  private users: Map<string, MockUser> = new Map();
  private behaviors: Map<string, MockUserBehavior> = new Map();
  private documentId: string;
  private mainYdoc: Y.Doc;
  private activeIntervals: Map<string, NodeJS.Timeout> = new Map();
  private editingAreas: Map<string, { start: number; end: number }> = new Map();

  constructor(documentId: string, mainYdoc: Y.Doc) {
    this.documentId = documentId;
    this.mainYdoc = mainYdoc;
    this.setupDefaultBehaviors();
  }

  private setupDefaultBehaviors(): void {
    this.behaviors.set('aggressive', {
      editFrequency: 60, // 1 edit per second
      editSize: 5,
      movementFrequency: 120,
      pauseDuration: 500,
      conflictProbability: 0.3,
    });

    this.behaviors.set('moderate', {
      editFrequency: 20,
      editSize: 8,
      movementFrequency: 40,
      pauseDuration: 2000,
      conflictProbability: 0.15,
    });

    this.behaviors.set('passive', {
      editFrequency: 5,
      editSize: 12,
      movementFrequency: 10,
      pauseDuration: 8000,
      conflictProbability: 0.05,
    });

    this.behaviors.set('observer', {
      editFrequency: 0,
      editSize: 0,
      movementFrequency: 5,
      pauseDuration: 15000,
      conflictProbability: 0,
    });
  }

  addUser(user: Omit<MockUser, 'isActive' | 'provider' | 'ydoc'>): MockUser {
    const ydoc = new Y.Doc();
    const fullUser: MockUser = {
      ...user,
      isActive: false,
      ydoc,
    };

    // Create provider for this user
    fullUser.provider = new MockWebSocketProvider(
      {
        documentId: this.documentId,
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        simulateLatency: true,
        latencyMs: 50 + Math.random() * 100, // 50-150ms latency
      },
      ydoc,
    );

    this.users.set(user.id, fullUser);
    return fullUser;
  }

  removeUser(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      this.stopUserSimulation(userId);
      user.provider?.destroy();
      this.users.delete(userId);
    }
  }

  activateUser(userId: string): void {
    const user = this.users.get(userId);
    if (user && !user.isActive) {
      user.isActive = true;
      this.startUserSimulation(userId);
    }
  }

  deactivateUser(userId: string): void {
    const user = this.users.get(userId);
    if (user && user.isActive) {
      user.isActive = false;
      this.stopUserSimulation(userId);
    }
  }

  private startUserSimulation(userId: string): void {
    const user = this.users.get(userId);
    const behavior = this.behaviors.get(user?.editingPattern || 'moderate');

    if (!user || !behavior || !user.ydoc) return;

    const ytext = user.ydoc.getText('content');

    // Start editing simulation
    if (behavior.editFrequency > 0) {
      const editInterval = 60000 / behavior.editFrequency; // Convert to ms

      const simulate = () => {
        if (!user.isActive) return;

        this.simulateUserEdit(userId, ytext, behavior);

        const nextEditDelay = editInterval + (Math.random() - 0.5) * editInterval * 0.5;
        setTimeout(simulate, Math.max(100, nextEditDelay));
      };

      // Start after a random delay
      setTimeout(simulate, Math.random() * behavior.pauseDuration);
    }

    // Start cursor movement simulation
    if (behavior.movementFrequency > 0) {
      const movementInterval = 60000 / behavior.movementFrequency;

      const simulateMovement = () => {
        if (!user.isActive) return;

        this.simulateUserCursorMovement(userId, ytext);

        const nextMovementDelay = movementInterval + (Math.random() - 0.5) * movementInterval * 0.3;
        setTimeout(simulateMovement, Math.max(50, nextMovementDelay));
      };

      setTimeout(simulateMovement, Math.random() * 1000);
    }
  }

  private stopUserSimulation(userId: string): void {
    const interval = this.activeIntervals.get(userId);
    if (interval) {
      clearInterval(interval);
      this.activeIntervals.delete(userId);
    }
  }

  private simulateUserEdit(userId: string, ytext: Y.Text, behavior: MockUserBehavior): void {
    const user = this.users.get(userId);
    if (!user || !user.ydoc) return;

    const currentLength = ytext.length;
    let position: number;

    // Determine edit position based on conflict probability
    if (Math.random() < behavior.conflictProbability && this.editingAreas.size > 0) {
      // Edit near where others are editing
      const areas = Array.from(this.editingAreas.values());
      const randomArea = areas[Math.floor(Math.random() * areas.length)];
      position = Math.max(
        0,
        Math.min(
          currentLength,
          randomArea.start + Math.random() * (randomArea.end - randomArea.start),
        ),
      );
    } else {
      // Edit at random position
      position = Math.floor(Math.random() * (currentLength + 1));
    }

    // Choose edit type
    const editType = Math.random();

    if (editType < 0.7) {
      // Insert text
      const content = this.generateRealisticContent(behavior.editSize, user.name);

      user.ydoc.transact(() => {
        ytext.insert(position, content);
      }, user.id);

      // Track editing area
      this.editingAreas.set(userId, {
        start: position,
        end: position + content.length,
      });
    } else if (editType < 0.9 && currentLength > 0) {
      // Delete text
      const deleteLength = Math.min(
        Math.floor(Math.random() * behavior.editSize) + 1,
        currentLength - position,
      );

      if (deleteLength > 0) {
        user.ydoc.transact(() => {
          ytext.delete(position, deleteLength);
        }, user.id);
      }
    } else if (currentLength > 10) {
      // Format text (simulate rich text editing)
      const formatLength = Math.min(Math.floor(Math.random() * 10) + 1, currentLength - position);

      if (formatLength > 0) {
        const formats = ['bold', 'italic', 'underline'];
        const _format = formats[Math.floor(Math.random() * formats.length)];

        // Note: This would work with actual rich text, but for plain text we'll skip
        // In a real implementation, this would format the text
      }
    }

    // Clean up editing area after some time
    setTimeout(() => {
      this.editingAreas.delete(userId);
    }, 5000);
  }

  private simulateUserCursorMovement(userId: string, ytext: Y.Text): void {
    const user = this.users.get(userId);
    if (!user || !user.provider) return;

    const currentLength = ytext.length;
    const position = Math.floor(Math.random() * (currentLength + 1));

    // Update awareness with cursor position
    user.provider.setAwarenessField('cursor', {
      position,
      timestamp: Date.now(),
    });
  }

  private generateRealisticContent(targetLength: number, _userName: string): string {
    const words = [
      'the',
      'and',
      'for',
      'are',
      'but',
      'not',
      'you',
      'all',
      'can',
      'had',
      'her',
      'was',
      'one',
      'our',
      'out',
      'day',
      'get',
      'has',
      'him',
      'his',
      'how',
      'man',
      'new',
      'now',
      'old',
      'see',
      'two',
      'way',
      'who',
      'boy',
      'did',
      'its',
      'let',
      'put',
      'say',
      'she',
      'too',
      'use',
      'hello',
      'world',
      'this',
      'that',
      'with',
      'have',
      'will',
      'from',
      'they',
      'know',
      'want',
      'been',
      'good',
      'much',
      'some',
      'time',
      'very',
      'when',
      'come',
      'here',
      'just',
      'like',
      'long',
      'make',
      'many',
      'over',
      'such',
      'take',
      'than',
      'them',
      'well',
      'work',
      'great',
      'right',
      'think',
      'where',
      'being',
      'every',
      'large',
      'might',
      'never',
      'other',
      'shall',
      'still',
      'those',
      'under',
      'while',
      'above',
      'again',
      'before',
      'change',
      'during',
      'little',
      'number',
      'people',
      'please',
      'should',
      'system',
      'through',
      'without',
    ];

    const sentences = [
      'This is an example of collaborative editing.',
      'Multiple users can edit this document simultaneously.',
      'Changes are synchronized in real-time across all clients.',
      'The conflict resolution system ensures data consistency.',
      'Each user has a unique color for their contributions.',
      "You can see other users' cursors moving in real-time.",
      'This demonstrates the power of operational transformation.',
      'Collaborative editing enables seamless teamwork.',
      'Real-time synchronization makes remote work more effective.',
      'The CRDT algorithm ensures eventual consistency.',
    ];

    // Sometimes add full sentences for more realistic content
    if (targetLength > 20 && Math.random() < 0.3) {
      const sentence = sentences[Math.floor(Math.random() * sentences.length)];
      return ` ${sentence} `;
    }

    // Generate word-based content
    let content = '';
    while (content.length < targetLength) {
      const word = words[Math.floor(Math.random() * words.length)];
      content += (content.length > 0 ? ' ' : '') + word;
    }

    // Add some variation with punctuation
    if (Math.random() < 0.2) {
      content += '.';
    } else if (Math.random() < 0.1) {
      content += '!';
    } else if (Math.random() < 0.1) {
      content += '?';
    }

    return content.substring(0, targetLength);
  }

  getActiveUsers(): MockUser[] {
    return Array.from(this.users.values()).filter(user => user.isActive);
  }

  getAllUsers(): MockUser[] {
    return Array.from(this.users.values());
  }

  getUserCount(): number {
    return this.users.size;
  }

  getActiveUserCount(): number {
    return this.getActiveUsers().length;
  }

  // Create a set of realistic demo users
  createDemoUsers(): MockUser[] {
    const demoUsers = [
      {
        id: 'alice-001',
        name: 'Alice Johnson',
        color: '#FF6B6B',
        avatar:
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        editingPattern: 'aggressive' as const,
      },
      {
        id: 'bob-002',
        name: 'Bob Smith',
        color: '#4ECDC4',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        editingPattern: 'moderate' as const,
      },
      {
        id: 'carol-003',
        name: 'Carol Williams',
        color: '#45B7D1',
        editingPattern: 'passive' as const,
      },
      {
        id: 'david-004',
        name: 'David Brown',
        color: '#96CEB4',
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        editingPattern: 'moderate' as const,
      },
      {
        id: 'eva-005',
        name: 'Eva Martinez',
        color: '#FFEAA7',
        editingPattern: 'observer' as const,
      },
    ];

    return demoUsers.map(user => this.addUser(user));
  }

  // Simulate network issues for testing
  simulateNetworkIssues(userId: string, duration: number = 5000): void {
    const user = this.users.get(userId);
    if (user && user.provider) {
      user.provider.disconnect();
      setTimeout(() => {
        user.provider?.reconnect();
      }, duration);
    }
  }

  // Batch activate users with staggered timing for realistic demo
  activateUsersStaggered(userIds: string[], delayMs: number = 1000): void {
    userIds.forEach((userId, index) => {
      setTimeout(() => {
        this.activateUser(userId);
      }, index * delayMs);
    });
  }

  destroy(): void {
    // Stop all simulations and clean up
    for (const userId of this.users.keys()) {
      this.stopUserSimulation(userId);
    }

    for (const user of this.users.values()) {
      user.provider?.destroy();
    }

    this.users.clear();
    this.behaviors.clear();
    this.activeIntervals.clear();
    this.editingAreas.clear();
  }
}
