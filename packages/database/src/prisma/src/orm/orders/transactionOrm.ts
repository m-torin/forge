'use server';

import type {
  Prisma,
  TransactionStatus,
  TransactionType,
} from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

/**
 * Create a new transaction
 */
export async function createTransactionOrm(args: Prisma.TransactionCreateArgs) {
  try {
    return await prisma.transaction.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Find first transaction matching criteria
 */
export async function findFirstTransactionOrm(args?: Prisma.TransactionFindFirstArgs) {
  return await prisma.transaction.findFirst(args);
}

/**
 * Find unique transaction by ID
 */
export async function findUniqueTransactionOrm(args: Prisma.TransactionFindUniqueArgs) {
  return await prisma.transaction.findUnique(args);
}

/**
 * Find unique transaction or throw error if not found
 */
export async function findUniqueTransactionOrmOrThrow(
  args: Prisma.TransactionFindUniqueOrThrowArgs,
) {
  try {
    return await prisma.transaction.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Transaction not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find many transactions with optional filtering
 */
export async function findManyTransactionsOrm(args?: Prisma.TransactionFindManyArgs) {
  return await prisma.transaction.findMany(args);
}

/**
 * Update an existing transaction
 */
export async function updateTransactionOrm(args: Prisma.TransactionUpdateArgs) {
  try {
    return await prisma.transaction.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Transaction not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Update many transactions matching criteria
 */
export async function updateManyTransactionsOrm(args: Prisma.TransactionUpdateManyArgs) {
  return await prisma.transaction.updateMany(args);
}

/**
 * Create or update transaction (upsert)
 */
export async function upsertTransactionOrm(args: Prisma.TransactionUpsertArgs) {
  try {
    return await prisma.transaction.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransactionOrm(args: Prisma.TransactionDeleteArgs) {
  try {
    return await prisma.transaction.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Transaction not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Delete many transactions matching criteria
 */
export async function deleteManyTransactionsOrm(args?: Prisma.TransactionDeleteManyArgs) {
  return await prisma.transaction.deleteMany(args);
}

/**
 * Aggregate transaction data
 */
export async function aggregateTransactionsOrm(args?: Prisma.TransactionAggregateArgs) {
  return await prisma.transaction.aggregate(args ?? {});
}

/**
 * Count transactions matching criteria
 */
export async function countTransactionsOrm(args?: Prisma.TransactionCountArgs) {
  return await prisma.transaction.count(args);
}

/**
 * Group transactions by specified fields
 */
export async function groupByTransactionsOrm(args: Prisma.TransactionGroupByArgs) {
  return await prisma.transaction.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find transactions by type using TransactionType enum
 * Uses explicit type annotation to avoid stack depth issues
 */
export async function findTransactionsByTypeOrm(
  type: TransactionType,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: type,
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find payment transactions
 */
export async function findPaymentTransactionsOrm(additionalArgs?: Prisma.TransactionFindManyArgs) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: 'PAYMENT',
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find refund transactions
 */
export async function findRefundTransactionsOrm(additionalArgs?: Prisma.TransactionFindManyArgs) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: 'REFUND',
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find partial refund transactions
 */
export async function findPartialRefundTransactionsOrm(
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: 'PARTIAL_REFUND',
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find void transactions
 */
export async function findVoidTransactionsOrm(additionalArgs?: Prisma.TransactionFindManyArgs) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      type: 'VOID',
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transactions by status using TransactionStatus enum
 */
export async function findTransactionsByStatusOrm(
  status: TransactionStatus,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: status,
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find pending transactions
 */
export async function findPendingTransactionsOrm(additionalArgs?: Prisma.TransactionFindManyArgs) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'PENDING',
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find processing transactions
 */
export async function findProcessingTransactionsOrm(
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'PROCESSING',
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find successful transactions
 */
export async function findSuccessfulTransactionsOrm(
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'SUCCESS',
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find failed transactions
 */
export async function findFailedTransactionsOrm(additionalArgs?: Prisma.TransactionFindManyArgs) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'FAILED',
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find cancelled transactions
 */
export async function findCancelledTransactionsOrm(
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'CANCELLED',
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transactions by order ID (leverages orderId index)
 */
export async function findTransactionsByOrderOrm(
  orderId: string,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      orderId: orderId,
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transactions by gateway (leverages gateway index)
 */
export async function findTransactionsByGatewayOrm(
  gateway: string,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      gateway: gateway,
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transactions by gateway ID (leverages gatewayId index)
 */
export async function findTransactionsByGatewayIdOrm(
  gatewayId: string,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      gatewayId: gatewayId,
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transactions that have a gateway ID set (not null)
 */
export async function findTransactionsWithGatewayIdOrm(
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      gatewayId: {
        not: null,
      },
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transactions that don't have a gateway ID (null)
 */
export async function findTransactionsWithoutGatewayIdOrm(
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      gatewayId: null,
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transactions by payment method
 */
export async function findTransactionsByPaymentMethodOrm(
  paymentMethod: string,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      paymentMethod: paymentMethod,
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transactions by currency
 */
export async function findTransactionsByCurrencyOrm(
  currency: string,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      currency: currency,
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transactions by amount range
 */
export async function findTransactionsByAmountRangeOrm(
  minAmount: number,
  maxAmount: number,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      amount: {
        gte: minAmount,
        lte: maxAmount,
      },
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transactions that have failed
 */
export async function findTransactionsWithFailureReasonOrm(
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      failureReason: {
        not: null,
      },
    },
  };
  return await prisma.transaction.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

/**
 * Find parent transaction and all its refunds
 */
export async function findTransactionWithRefundsOrm(
  parentTransactionId: string,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      OR: [{ id: parentTransactionId }, { parentTransactionId: parentTransactionId }],
    },
    orderBy: {
      createdAt: 'asc',
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find refunds of a specific transaction
 */
export async function findTransactionRefundsOrm(
  parentTransactionId: string,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      parentTransactionId: parentTransactionId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transaction with all refunds included
 */
export async function findTransactionWithAllRefundsOrm(id: string) {
  return await prisma.transaction.findUnique({
    where: { id },
    include: {
      refunds: {
        orderBy: { createdAt: 'desc' },
      },
      parentTransaction: true,
    },
  });
}

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find transactions that have an order relationship
 * Note: orderId is required, so all transactions have orders
 */
export async function findTransactionsWithOrderOrm(
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  // Since orderId is required, all transactions have orders
  return await prisma.transaction.findMany(additionalArgs);
}

/**
 * Find transactions that have a parent transaction (refunds)
 */
export async function findTransactionsWithParentOrm(
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      parentTransaction: {
        isNot: null,
      },
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transactions that have refunds
 */
export async function findTransactionsWithRefundsRelationOrm(
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      refunds: {
        some: {},
      },
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transaction with all relations included
 */
export async function findTransactionWithAllRelationsOrm(id: string) {
  return await prisma.transaction.findUnique({
    where: { id },
    include: {
      order: true,
      parentTransaction: true,
      refunds: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find transactions created after a specific date
 */
export async function findTransactionsCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      createdAt: {
        gte: date,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transactions updated after a specific date
 */
export async function findTransactionsUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      updatedAt: {
        gte: date,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find recently created or updated transactions within specified days
 */
export async function findRecentTransactionsOrm(
  days: number = 7,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      OR: [
        {
          createdAt: {
            gte: cutoffDate,
          },
        },
        {
          updatedAt: {
            gte: cutoffDate,
          },
        },
      ],
    },
    orderBy: {
      updatedAt: 'desc',
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transactions processed after a specific date
 */
export async function findTransactionsProcessedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      processedAt: {
        gte: date,
      },
    },
    orderBy: {
      processedAt: 'desc',
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transactions that failed after a specific date
 */
export async function findTransactionsFailedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      failedAt: {
        gte: date,
      },
    },
    orderBy: {
      failedAt: 'desc',
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Update transaction status
 */
export async function updateTransactionStatusOrm(
  id: string,
  status: TransactionStatus,
  processedAt?: Date,
  failedAt?: Date,
  failureReason?: string,
) {
  try {
    return await prisma.transaction.update({
      where: { id },
      data: {
        status: status,
        ...(status === 'SUCCESS' &&
          processedAt && {
            processedAt: processedAt,
          }),
        ...(status === 'FAILED' && {
          failedAt: failedAt || new Date(),
          ...(failureReason && { failureReason }),
        }),
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Transaction not found for status update: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Mark transaction as successful
 */
export async function markTransactionSuccessfulOrm(id: string) {
  try {
    return await prisma.transaction.update({
      where: { id },
      data: {
        status: 'SUCCESS',
        processedAt: new Date(),
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Transaction not found for success update: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Mark transaction as failed
 */
export async function markTransactionFailedOrm(id: string, failureReason?: string) {
  try {
    return await prisma.transaction.update({
      where: { id },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        ...(failureReason && { failureReason }),
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Transaction not found for failure update: ${id}`);
    }
    handlePrismaError(error);
  }
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find transaction by gateway and gateway ID (leverages indexes)
 */
export async function findTransactionByGatewayAndIdOrm(gateway: string, gatewayId: string) {
  return await prisma.transaction.findFirst({
    where: {
      gateway: gateway,
      gatewayId: gatewayId,
    },
  });
}

/**
 * Find transactions by order and type (leverages orderId index)
 */
export async function findTransactionsByOrderAndTypeOrm(
  orderId: string,
  type: TransactionType,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      orderId: orderId,
      type: type,
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transactions by order and status (leverages orderId index)
 */
export async function findTransactionsByOrderAndStatusOrm(
  orderId: string,
  status: TransactionStatus,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      orderId: orderId,
      status: status,
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Calculate total transaction amounts by status
 */
export async function calculateTransactionTotalsByStatusOrm(
  status: TransactionStatus,
  currency?: string,
) {
  const result = await prisma.transaction.aggregate({
    where: {
      status: status,
      ...(currency && { currency }),
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    totalAmount: result._sum.amount || 0,
    transactionCount: result._count.id,
  };
}

/**
 * Calculate total transaction amounts by type
 */
export async function calculateTransactionTotalsByTypeOrm(
  type: TransactionType,
  currency?: string,
) {
  const result = await prisma.transaction.aggregate({
    where: {
      type: type,
      ...(currency && { currency }),
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    totalAmount: result._sum.amount || 0,
    transactionCount: result._count.id,
  };
}

/**
 * Find high-value transactions (potential fraud detection)
 */
export async function findHighValueTransactionsOrm(
  minAmount: number = 1000,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      amount: {
        gte: minAmount,
      },
    },
    orderBy: {
      amount: 'desc',
    },
  };
  return await prisma.transaction.findMany(args);
}

/**
 * Find transactions by gateway and status (leverages gateway index)
 */
export async function findTransactionsByGatewayAndStatusOrm(
  gateway: string,
  status: TransactionStatus,
  additionalArgs?: Prisma.TransactionFindManyArgs,
) {
  const args: Prisma.TransactionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      gateway: gateway,
      status: status,
    },
  };
  return await prisma.transaction.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * Transaction with order relation
 */
export type TransactionWithOrder = Prisma.TransactionGetPayload<{
  include: { order: true };
}>;

/**
 * Transaction with parent transaction relation
 */
export type TransactionWithParent = Prisma.TransactionGetPayload<{
  include: { parentTransaction: true };
}>;

/**
 * Transaction with refunds relation
 */
export type TransactionWithRefunds = Prisma.TransactionGetPayload<{
  include: { refunds: true };
}>;

/**
 * Transaction with all relations for complete data access
 */
export type TransactionWithAllRelations = Prisma.TransactionGetPayload<{
  include: {
    order: true;
    parentTransaction: true;
    refunds: true;
  };
}>;

/**
 * Transaction summary for financial reporting
 */
export type TransactionSummary = Prisma.TransactionGetPayload<{
  select: {
    id: true;
    type: true;
    status: true;
    amount: true;
    currency: true;
    gateway: true;
    gatewayId: true;
    paymentMethod: true;
    last4: true;
    processedAt: true;
    failedAt: true;
    failureReason: true;
    createdAt: true;
    orderId: true;
    parentTransactionId: true;
    order: {
      select: {
        id: true;
        orderNumber: true;
        status: true;
      };
    };
    _count: {
      select: {
        refunds: true;
      };
    };
  };
}>;
