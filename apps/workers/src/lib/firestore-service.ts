import { devLog as logger } from '@repo/orchestration';

// Using mock Firestore until properly configured
import {
  addDoc,
  collection,
  db,
  getDocs,
  limit,
  orderBy,
  query,
  type QueryConstraint,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from './firestore-mock';

// Collection names
const COLLECTIONS = {
  WORKFLOW_ANALYTICS: 'workflow_analytics',
  WORKFLOW_LOGS: 'workflow_logs',
  WORKFLOW_RUNS: 'workflow_runs',
} as const;

// Workflow Run document interface
export interface WorkflowRunDoc {
  completedAt?: ReturnType<typeof Timestamp.now>;
  createdAt: ReturnType<typeof Timestamp.now>;
  duration?: number;
  error?: string;
  metadata: {
    triggeredBy: 'user' | 'api' | 'schedule' | 'event';
    userAgent?: string;
    ipAddress?: string;
    [key: string]: any;
  };
  organizationId?: string;
  payload: any;
  result?: any;
  startedAt: ReturnType<typeof Timestamp.now>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  steps: {
    stepName: string;
    status: 'completed' | 'failed' | 'running';
    startedAt: ReturnType<typeof Timestamp.now>;
    completedAt?: ReturnType<typeof Timestamp.now>;
    error?: string;
  }[];
  updatedAt: ReturnType<typeof Timestamp.now>;
  userId?: string;
  workflowRunId: string;
  workflowType: string;
  workflowUrl: string;
}

// Analytics document interface
export interface WorkflowAnalyticsDoc {
  averageDuration: number;
  cancelledRuns: number;
  createdAt: ReturnType<typeof Timestamp.now>;
  date: string; // YYYY-MM-DD
  errorTypes: Record<string, number>;
  failedRuns: number;
  organizationId?: string;
  successfulRuns: number;
  totalRuns: number;
  updatedAt: ReturnType<typeof Timestamp.now>;
  userId?: string;
  workflowType: string;
}

/**
 * Firestore service for workflow data persistence
 */
export class WorkflowFirestoreService {
  /**
   * Create a new workflow run record
   */
  static async createWorkflowRun(data: {
    workflowRunId: string;
    workflowUrl: string;
    workflowType: string;
    payload: any;
    userId?: string;
    organizationId?: string;
    metadata?: Record<string, any>;
  }): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.WORKFLOW_RUNS), {
        ...data,
        createdAt: serverTimestamp(),
        metadata: {
          triggeredBy: 'api',
          ...data.metadata,
        },
        startedAt: serverTimestamp(),
        status: 'pending',
        steps: [],
        updatedAt: serverTimestamp(),
      });

      logger.info('Created workflow run:', {
        docId: docRef.id,
        workflowRunId: data.workflowRunId,
      });

      return docRef.id;
    } catch (error) {
      logger.error('Failed to create workflow run:', error);
      throw error;
    }
  }

  /**
   * Update workflow run status
   */
  static async updateWorkflowRunStatus(
    workflowRunId: string,
    status: WorkflowRunDoc['status'],
    updates?: Partial<WorkflowRunDoc>,
  ): Promise<void> {
    try {
      const q = query(
        collection(db, COLLECTIONS.WORKFLOW_RUNS),
        where('workflowRunId', '==', workflowRunId),
        limit(1),
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw new Error(`Workflow run not found: ${workflowRunId}`);
      }

      const docRef = querySnapshot.docs[0].ref;
      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
        ...updates,
      };

      if (status === 'running' && !updates?.startedAt) {
        updateData.startedAt = serverTimestamp();
      }

      if (['cancelled', 'completed', 'failed'].includes(status)) {
        updateData.completedAt = serverTimestamp();
      }

      await updateDoc(docRef, updateData);

      logger.info('Updated workflow run status:', { status, workflowRunId });
    } catch (error) {
      logger.error('Failed to update workflow run status:', error);
      throw error;
    }
  }

  /**
   * Add step to workflow run
   */
  static async addWorkflowStep(
    workflowRunId: string,
    step: {
      stepName: string;
      status: 'running' | 'completed' | 'failed';
      error?: string;
    },
  ): Promise<void> {
    try {
      const q = query(
        collection(db, COLLECTIONS.WORKFLOW_RUNS),
        where('workflowRunId', '==', workflowRunId),
        limit(1),
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw new Error(`Workflow run not found: ${workflowRunId}`);
      }

      const docRef = querySnapshot.docs[0].ref;
      const existingData = querySnapshot.docs[0].data() as WorkflowRunDoc;

      const newStep = {
        ...step,
        startedAt: Timestamp.now(),
        ...(step.status !== 'running' && { completedAt: Timestamp.now() }),
      };

      await updateDoc(docRef, {
        steps: [...(existingData.steps || []), newStep],
        updatedAt: serverTimestamp(),
      });

      logger.info('Added workflow step:', { stepName: step.stepName, workflowRunId });
    } catch (error) {
      logger.error('Failed to add workflow step:', error);
      throw error;
    }
  }

  /**
   * Get workflow run by ID
   */
  static async getWorkflowRun(workflowRunId: string): Promise<WorkflowRunDoc | null> {
    try {
      const q = query(
        collection(db, COLLECTIONS.WORKFLOW_RUNS),
        where('workflowRunId', '==', workflowRunId),
        limit(1),
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      return querySnapshot.docs[0].data() as WorkflowRunDoc;
    } catch (error) {
      logger.error('Failed to get workflow run:', error);
      throw error;
    }
  }

  /**
   * Get workflow runs with filters
   */
  static async getWorkflowRuns(options: {
    userId?: string;
    organizationId?: string;
    workflowType?: string;
    status?: WorkflowRunDoc['status'];
    limit?: number;
    orderBy?: 'createdAt' | 'startedAt' | 'completedAt';
    orderDirection?: 'asc' | 'desc';
  }): Promise<WorkflowRunDoc[]> {
    try {
      const constraints: QueryConstraint[] = [];

      if (options.userId) {
        constraints.push(where('userId', '==', options.userId));
      }
      if (options.organizationId) {
        constraints.push(where('organizationId', '==', options.organizationId));
      }
      if (options.workflowType) {
        constraints.push(where('workflowType', '==', options.workflowType));
      }
      if (options.status) {
        constraints.push(where('status', '==', options.status));
      }

      constraints.push(orderBy(options.orderBy || 'createdAt', options.orderDirection || 'desc'));

      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(collection(db, COLLECTIONS.WORKFLOW_RUNS), ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => doc.data() as WorkflowRunDoc);
    } catch (error) {
      logger.error('Failed to get workflow runs:', error);
      throw error;
    }
  }

  /**
   * Update analytics for a workflow completion
   */
  static async updateAnalytics(data: {
    workflowType: string;
    status: 'completed' | 'failed' | 'cancelled';
    duration: number;
    userId?: string;
    organizationId?: string;
    errorType?: string;
  }): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const _analyticsId = `${today}_${data.workflowType}${data.userId ? `_${data.userId}` : ''}`;

      const constraints: QueryConstraint[] = [
        where('date', '==', today),
        where('workflowType', '==', data.workflowType),
      ];

      if (data.userId) {
        constraints.push(where('userId', '==', data.userId));
      }
      if (data.organizationId) {
        constraints.push(where('organizationId', '==', data.organizationId));
      }

      const q = query(collection(db, COLLECTIONS.WORKFLOW_ANALYTICS), ...constraints);
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Create new analytics document
        await addDoc(collection(db, COLLECTIONS.WORKFLOW_ANALYTICS), {
          averageDuration: data.duration,
          cancelledRuns: data.status === 'cancelled' ? 1 : 0,
          createdAt: serverTimestamp(),
          date: today,
          errorTypes: data.errorType ? { [data.errorType]: 1 } : {},
          failedRuns: data.status === 'failed' ? 1 : 0,
          organizationId: data.organizationId,
          successfulRuns: data.status === 'completed' ? 1 : 0,
          totalRuns: 1,
          updatedAt: serverTimestamp(),
          userId: data.userId,
          workflowType: data.workflowType,
        });
      } else {
        // Update existing analytics
        const docRef = querySnapshot.docs[0].ref;
        const existingData = querySnapshot.docs[0].data() as WorkflowAnalyticsDoc;

        const newTotalRuns = existingData.totalRuns + 1;
        const newAverageDuration =
          (existingData.averageDuration * existingData.totalRuns + data.duration) / newTotalRuns;

        const updates: any = {
          averageDuration: newAverageDuration,
          totalRuns: newTotalRuns,
          updatedAt: serverTimestamp(),
        };

        if (data.status === 'completed') {
          updates.successfulRuns = (existingData.successfulRuns || 0) + 1;
        } else if (data.status === 'failed') {
          updates.failedRuns = (existingData.failedRuns || 0) + 1;
        } else if (data.status === 'cancelled') {
          updates.cancelledRuns = (existingData.cancelledRuns || 0) + 1;
        }

        if (data.errorType) {
          updates.errorTypes = {
            ...existingData.errorTypes,
            [data.errorType]: (existingData.errorTypes[data.errorType] || 0) + 1,
          };
        }

        await updateDoc(docRef, updates);
      }

      logger.info('Updated workflow analytics:', { date: today, workflowType: data.workflowType });
    } catch (error) {
      logger.error('Failed to update analytics:', error);
      // Don't throw - analytics failure shouldn't break workflow
    }
  }

  /**
   * Get analytics data
   */
  static async getAnalytics(options: {
    workflowType?: string;
    userId?: string;
    organizationId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<WorkflowAnalyticsDoc[]> {
    try {
      const constraints: QueryConstraint[] = [];

      if (options.workflowType) {
        constraints.push(where('workflowType', '==', options.workflowType));
      }
      if (options.userId) {
        constraints.push(where('userId', '==', options.userId));
      }
      if (options.organizationId) {
        constraints.push(where('organizationId', '==', options.organizationId));
      }
      if (options.startDate) {
        constraints.push(where('date', '>=', options.startDate));
      }
      if (options.endDate) {
        constraints.push(where('date', '<=', options.endDate));
      }

      constraints.push(orderBy('date', 'desc'));

      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(collection(db, COLLECTIONS.WORKFLOW_ANALYTICS), ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => doc.data() as WorkflowAnalyticsDoc);
    } catch (error) {
      logger.error('Failed to get analytics:', error);
      throw error;
    }
  }
}
