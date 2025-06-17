'use server';

import { prisma } from '../../clients/standard';
import type { Prisma } from '../../../prisma-generated/client';

//==============================================================================
// WORKFLOWCONFIG CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createWorkflowConfigOrm(args: Prisma.WorkflowConfigCreateArgs) {
  return prisma.workflowConfig.create(args);
}

// READ
export async function findFirstWorkflowConfigOrm(args?: Prisma.WorkflowConfigFindFirstArgs) {
  return prisma.workflowConfig.findFirst(args);
}

export async function findUniqueWorkflowConfigOrm(args: Prisma.WorkflowConfigFindUniqueArgs) {
  return prisma.workflowConfig.findUnique(args);
}

export async function findManyWorkflowConfigsOrm(args?: Prisma.WorkflowConfigFindManyArgs) {
  return prisma.workflowConfig.findMany(args);
}

// UPDATE
export async function updateWorkflowConfigOrm(args: Prisma.WorkflowConfigUpdateArgs) {
  return prisma.workflowConfig.update(args);
}

export async function updateManyWorkflowConfigsOrm(args: Prisma.WorkflowConfigUpdateManyArgs) {
  return prisma.workflowConfig.updateMany(args);
}

// UPSERT
export async function upsertWorkflowConfigOrm(args: Prisma.WorkflowConfigUpsertArgs) {
  return prisma.workflowConfig.upsert(args);
}

// DELETE
export async function deleteWorkflowConfigOrm(args: Prisma.WorkflowConfigDeleteArgs) {
  return prisma.workflowConfig.delete(args);
}

export async function deleteManyWorkflowConfigsOrm(args?: Prisma.WorkflowConfigDeleteManyArgs) {
  return prisma.workflowConfig.deleteMany(args);
}

// AGGREGATE
export async function aggregateWorkflowConfigsOrm(args?: Prisma.WorkflowConfigAggregateArgs) {
  return prisma.workflowConfig.aggregate(args ?? {});
}

export async function countWorkflowConfigsOrm(args?: Prisma.WorkflowConfigCountArgs) {
  return prisma.workflowConfig.count(args);
}

export async function groupByWorkflowConfigsOrm(args: Prisma.WorkflowConfigGroupByArgs) {
  return prisma.workflowConfig.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// WORKFLOWEXECUTION CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createWorkflowExecutionOrm(args: Prisma.WorkflowExecutionCreateArgs) {
  return prisma.workflowExecution.create(args);
}

// READ
export async function findFirstWorkflowExecutionOrm(args?: Prisma.WorkflowExecutionFindFirstArgs) {
  return prisma.workflowExecution.findFirst(args);
}

export async function findUniqueWorkflowExecutionOrm(args: Prisma.WorkflowExecutionFindUniqueArgs) {
  return prisma.workflowExecution.findUnique(args);
}

export async function findManyWorkflowExecutionsOrm(args?: Prisma.WorkflowExecutionFindManyArgs) {
  return prisma.workflowExecution.findMany(args);
}

// UPDATE
export async function updateWorkflowExecutionOrm(args: Prisma.WorkflowExecutionUpdateArgs) {
  return prisma.workflowExecution.update(args);
}

export async function updateManyWorkflowExecutionsOrm(
  args: Prisma.WorkflowExecutionUpdateManyArgs,
) {
  return prisma.workflowExecution.updateMany(args);
}

// UPSERT
export async function upsertWorkflowExecutionOrm(args: Prisma.WorkflowExecutionUpsertArgs) {
  return prisma.workflowExecution.upsert(args);
}

// DELETE
export async function deleteWorkflowExecutionOrm(args: Prisma.WorkflowExecutionDeleteArgs) {
  return prisma.workflowExecution.delete(args);
}

export async function deleteManyWorkflowExecutionsOrm(
  args?: Prisma.WorkflowExecutionDeleteManyArgs,
) {
  return prisma.workflowExecution.deleteMany(args);
}

// AGGREGATE
export async function aggregateWorkflowExecutionsOrm(args?: Prisma.WorkflowExecutionAggregateArgs) {
  return prisma.workflowExecution.aggregate(args ?? {});
}

export async function countWorkflowExecutionsOrm(args?: Prisma.WorkflowExecutionCountArgs) {
  return prisma.workflowExecution.count(args);
}

export async function groupByWorkflowExecutionsOrm(args: Prisma.WorkflowExecutionGroupByArgs) {
  return prisma.workflowExecution.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// WORKFLOWSCHEDULE CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createWorkflowScheduleOrm(args: Prisma.WorkflowScheduleCreateArgs) {
  return prisma.workflowSchedule.create(args);
}

// READ
export async function findFirstWorkflowScheduleOrm(args?: Prisma.WorkflowScheduleFindFirstArgs) {
  return prisma.workflowSchedule.findFirst(args);
}

export async function findUniqueWorkflowScheduleOrm(args: Prisma.WorkflowScheduleFindUniqueArgs) {
  return prisma.workflowSchedule.findUnique(args);
}

export async function findManyWorkflowSchedulesOrm(args?: Prisma.WorkflowScheduleFindManyArgs) {
  return prisma.workflowSchedule.findMany(args);
}

// UPDATE
export async function updateWorkflowScheduleOrm(args: Prisma.WorkflowScheduleUpdateArgs) {
  return prisma.workflowSchedule.update(args);
}

export async function updateManyWorkflowSchedulesOrm(args: Prisma.WorkflowScheduleUpdateManyArgs) {
  return prisma.workflowSchedule.updateMany(args);
}

// UPSERT
export async function upsertWorkflowScheduleOrm(args: Prisma.WorkflowScheduleUpsertArgs) {
  return prisma.workflowSchedule.upsert(args);
}

// DELETE
export async function deleteWorkflowScheduleOrm(args: Prisma.WorkflowScheduleDeleteArgs) {
  return prisma.workflowSchedule.delete(args);
}

export async function deleteManyWorkflowSchedulesOrm(args?: Prisma.WorkflowScheduleDeleteManyArgs) {
  return prisma.workflowSchedule.deleteMany(args);
}

// AGGREGATE
export async function aggregateWorkflowSchedulesOrm(args?: Prisma.WorkflowScheduleAggregateArgs) {
  return prisma.workflowSchedule.aggregate(args ?? {});
}

export async function countWorkflowSchedulesOrm(args?: Prisma.WorkflowScheduleCountArgs) {
  return prisma.workflowSchedule.count(args);
}

export async function groupByWorkflowSchedulesOrm(args: Prisma.WorkflowScheduleGroupByArgs) {
  return prisma.workflowSchedule.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
