"use server";

import { prisma } from "../index";
import type { Prisma } from "../generated/client/index";

//==============================================================================
// WORKFLOW CONFIG CRUD OPERATIONS
//==============================================================================

export async function createWorkflowConfig(args: Prisma.WorkflowConfigCreateArgs) {
  return prisma.workflowConfig.create(args);
}

export async function findManyWorkflowConfigs(args?: Prisma.WorkflowConfigFindManyArgs) {
  return prisma.workflowConfig.findMany(args);
}

export async function findUniqueWorkflowConfig(args: Prisma.WorkflowConfigFindUniqueArgs) {
  return prisma.workflowConfig.findUnique(args);
}

export async function findFirstWorkflowConfig(args?: Prisma.WorkflowConfigFindFirstArgs) {
  return prisma.workflowConfig.findFirst(args);
}

export async function updateWorkflowConfig(args: Prisma.WorkflowConfigUpdateArgs) {
  return prisma.workflowConfig.update(args);
}

export async function updateManyWorkflowConfigs(args: Prisma.WorkflowConfigUpdateManyArgs) {
  return prisma.workflowConfig.updateMany(args);
}

export async function upsertWorkflowConfig(args: Prisma.WorkflowConfigUpsertArgs) {
  return prisma.workflowConfig.upsert(args);
}

export async function deleteWorkflowConfig(args: Prisma.WorkflowConfigDeleteArgs) {
  return prisma.workflowConfig.delete(args);
}

export async function deleteManyWorkflowConfigs(args?: Prisma.WorkflowConfigDeleteManyArgs) {
  return prisma.workflowConfig.deleteMany(args);
}

export async function countWorkflowConfigs(args?: Prisma.WorkflowConfigCountArgs) {
  return prisma.workflowConfig.count(args);
}

export async function aggregateWorkflowConfigs(args = {}) {
  return prisma.workflowConfig.aggregate(args);
}

export async function groupByWorkflowConfigs(args: Prisma.WorkflowConfigGroupByArgs) {
  return prisma.workflowConfig.groupBy(args);
}

//==============================================================================
// WORKFLOW EXECUTION CRUD OPERATIONS
//==============================================================================

export async function createWorkflowExecution(args: Prisma.WorkflowExecutionCreateArgs) {
  return prisma.workflowExecution.create(args);
}

export async function findManyWorkflowExecutions(args?: Prisma.WorkflowExecutionFindManyArgs) {
  return prisma.workflowExecution.findMany(args);
}

export async function findUniqueWorkflowExecution(args: Prisma.WorkflowExecutionFindUniqueArgs) {
  return prisma.workflowExecution.findUnique(args);
}

export async function findFirstWorkflowExecution(args?: Prisma.WorkflowExecutionFindFirstArgs) {
  return prisma.workflowExecution.findFirst(args);
}

export async function updateWorkflowExecution(args: Prisma.WorkflowExecutionUpdateArgs) {
  return prisma.workflowExecution.update(args);
}

export async function updateManyWorkflowExecutions(args: Prisma.WorkflowExecutionUpdateManyArgs) {
  return prisma.workflowExecution.updateMany(args);
}

export async function upsertWorkflowExecution(args: Prisma.WorkflowExecutionUpsertArgs) {
  return prisma.workflowExecution.upsert(args);
}

export async function deleteWorkflowExecution(args: Prisma.WorkflowExecutionDeleteArgs) {
  return prisma.workflowExecution.delete(args);
}

export async function deleteManyWorkflowExecutions(args?: Prisma.WorkflowExecutionDeleteManyArgs) {
  return prisma.workflowExecution.deleteMany(args);
}

export async function countWorkflowExecutions(args?: Prisma.WorkflowExecutionCountArgs) {
  return prisma.workflowExecution.count(args);
}

export async function aggregateWorkflowExecutions(args = {}) {
  return prisma.workflowExecution.aggregate(args);
}

export async function groupByWorkflowExecutions(args: Prisma.WorkflowExecutionGroupByArgs) {
  return prisma.workflowExecution.groupBy(args);
}

//==============================================================================
// WORKFLOW SCHEDULE CRUD OPERATIONS
//==============================================================================

export async function createWorkflowSchedule(args: Prisma.WorkflowScheduleCreateArgs) {
  return prisma.workflowSchedule.create(args);
}

export async function findManyWorkflowSchedules(args?: Prisma.WorkflowScheduleFindManyArgs) {
  return prisma.workflowSchedule.findMany(args);
}

export async function findUniqueWorkflowSchedule(args: Prisma.WorkflowScheduleFindUniqueArgs) {
  return prisma.workflowSchedule.findUnique(args);
}

export async function findFirstWorkflowSchedule(args?: Prisma.WorkflowScheduleFindFirstArgs) {
  return prisma.workflowSchedule.findFirst(args);
}

export async function updateWorkflowSchedule(args: Prisma.WorkflowScheduleUpdateArgs) {
  return prisma.workflowSchedule.update(args);
}

export async function updateManyWorkflowSchedules(args: Prisma.WorkflowScheduleUpdateManyArgs) {
  return prisma.workflowSchedule.updateMany(args);
}

export async function upsertWorkflowSchedule(args: Prisma.WorkflowScheduleUpsertArgs) {
  return prisma.workflowSchedule.upsert(args);
}

export async function deleteWorkflowSchedule(args: Prisma.WorkflowScheduleDeleteArgs) {
  return prisma.workflowSchedule.delete(args);
}

export async function deleteManyWorkflowSchedules(args?: Prisma.WorkflowScheduleDeleteManyArgs) {
  return prisma.workflowSchedule.deleteMany(args);
}

export async function countWorkflowSchedules(args?: Prisma.WorkflowScheduleCountArgs) {
  return prisma.workflowSchedule.count(args);
}