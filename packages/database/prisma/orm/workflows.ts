"use server";

import { database } from "../index";
import type { Prisma } from "../generated/client/index";

//==============================================================================
// WORKFLOW CONFIG CRUD OPERATIONS
//==============================================================================

export async function createWorkflowConfig(data: Prisma.WorkflowConfigCreateInput) {
  return database.workflowConfig.create({ data });
}

export async function findManyWorkflowConfigs(args?: Prisma.WorkflowConfigFindManyArgs) {
  return database.workflowConfig.findMany(args);
}

export async function findUniqueWorkflowConfig(args: Prisma.WorkflowConfigFindUniqueArgs) {
  return database.workflowConfig.findUnique(args);
}

export async function findFirstWorkflowConfig(args?: Prisma.WorkflowConfigFindFirstArgs) {
  return database.workflowConfig.findFirst(args);
}

export async function updateWorkflowConfig(args: Prisma.WorkflowConfigUpdateArgs) {
  return database.workflowConfig.update(args);
}

export async function updateManyWorkflowConfigs(args: Prisma.WorkflowConfigUpdateManyArgs) {
  return database.workflowConfig.updateMany(args);
}

export async function upsertWorkflowConfig(args: Prisma.WorkflowConfigUpsertArgs) {
  return database.workflowConfig.upsert(args);
}

export async function deleteWorkflowConfig(args: Prisma.WorkflowConfigDeleteArgs) {
  return database.workflowConfig.delete(args);
}

export async function deleteManyWorkflowConfigs(args?: Prisma.WorkflowConfigDeleteManyArgs) {
  return database.workflowConfig.deleteMany(args);
}

export async function countWorkflowConfigs(args?: Prisma.WorkflowConfigCountArgs) {
  return database.workflowConfig.count(args);
}

export async function aggregateWorkflowConfigs(args?: Prisma.WorkflowConfigAggregateArgs) {
  return database.workflowConfig.aggregate(args);
}

export async function groupByWorkflowConfigs(args: Prisma.WorkflowConfigGroupByArgs) {
  return database.workflowConfig.groupBy(args);
}

//==============================================================================
// WORKFLOW EXECUTION CRUD OPERATIONS
//==============================================================================

export async function createWorkflowExecution(data: Prisma.WorkflowExecutionCreateInput) {
  return database.workflowExecution.create({ data });
}

export async function findManyWorkflowExecutions(args?: Prisma.WorkflowExecutionFindManyArgs) {
  return database.workflowExecution.findMany(args);
}

export async function findUniqueWorkflowExecution(args: Prisma.WorkflowExecutionFindUniqueArgs) {
  return database.workflowExecution.findUnique(args);
}

export async function findFirstWorkflowExecution(args?: Prisma.WorkflowExecutionFindFirstArgs) {
  return database.workflowExecution.findFirst(args);
}

export async function updateWorkflowExecution(args: Prisma.WorkflowExecutionUpdateArgs) {
  return database.workflowExecution.update(args);
}

export async function updateManyWorkflowExecutions(args: Prisma.WorkflowExecutionUpdateManyArgs) {
  return database.workflowExecution.updateMany(args);
}

export async function upsertWorkflowExecution(args: Prisma.WorkflowExecutionUpsertArgs) {
  return database.workflowExecution.upsert(args);
}

export async function deleteWorkflowExecution(args: Prisma.WorkflowExecutionDeleteArgs) {
  return database.workflowExecution.delete(args);
}

export async function deleteManyWorkflowExecutions(args?: Prisma.WorkflowExecutionDeleteManyArgs) {
  return database.workflowExecution.deleteMany(args);
}

export async function countWorkflowExecutions(args?: Prisma.WorkflowExecutionCountArgs) {
  return database.workflowExecution.count(args);
}

export async function aggregateWorkflowExecutions(args?: Prisma.WorkflowExecutionAggregateArgs) {
  return database.workflowExecution.aggregate(args);
}

export async function groupByWorkflowExecutions(args: Prisma.WorkflowExecutionGroupByArgs) {
  return database.workflowExecution.groupBy(args);
}

//==============================================================================
// WORKFLOW SCHEDULE CRUD OPERATIONS
//==============================================================================

export async function createWorkflowSchedule(data: Prisma.WorkflowScheduleCreateInput) {
  return database.workflowSchedule.create({ data });
}

export async function findManyWorkflowSchedules(args?: Prisma.WorkflowScheduleFindManyArgs) {
  return database.workflowSchedule.findMany(args);
}

export async function findUniqueWorkflowSchedule(args: Prisma.WorkflowScheduleFindUniqueArgs) {
  return database.workflowSchedule.findUnique(args);
}

export async function findFirstWorkflowSchedule(args?: Prisma.WorkflowScheduleFindFirstArgs) {
  return database.workflowSchedule.findFirst(args);
}

export async function updateWorkflowSchedule(args: Prisma.WorkflowScheduleUpdateArgs) {
  return database.workflowSchedule.update(args);
}

export async function updateManyWorkflowSchedules(args: Prisma.WorkflowScheduleUpdateManyArgs) {
  return database.workflowSchedule.updateMany(args);
}

export async function upsertWorkflowSchedule(args: Prisma.WorkflowScheduleUpsertArgs) {
  return database.workflowSchedule.upsert(args);
}

export async function deleteWorkflowSchedule(args: Prisma.WorkflowScheduleDeleteArgs) {
  return database.workflowSchedule.delete(args);
}

export async function deleteManyWorkflowSchedules(args?: Prisma.WorkflowScheduleDeleteManyArgs) {
  return database.workflowSchedule.deleteMany(args);
}

export async function countWorkflowSchedules(args?: Prisma.WorkflowScheduleCountArgs) {
  return database.workflowSchedule.count(args);
}