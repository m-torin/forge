/**
 * Segment warehouse operations and schema management
 */

import type { SegmentWarehouseDestination } from '../types';

export interface WarehouseSchema {
  table: string;
  columns: WarehouseColumn[];
  indexes?: WarehouseIndex[];
  partitioning?: WarehousePartitioning;
}

export interface WarehouseColumn {
  name: string;
  type:
    | 'varchar'
    | 'text'
    | 'integer'
    | 'bigint'
    | 'decimal'
    | 'float'
    | 'boolean'
    | 'timestamp'
    | 'date'
    | 'json';
  nullable?: boolean;
  length?: number;
  precision?: number;
  scale?: number;
  defaultValue?: any;
  description?: string;
}

export interface WarehouseIndex {
  name: string;
  columns: string[];
  unique?: boolean;
  type?: 'btree' | 'hash' | 'gin' | 'gist';
}

export interface WarehousePartitioning {
  type: 'range' | 'hash' | 'list';
  column: string;
  strategy?: string;
}

// Standard Segment warehouse schemas
export const segmentSchemas = {
  tracks: (): WarehouseSchema => ({
    table: 'tracks',
    columns: [
      { name: 'id', type: 'varchar', length: 255, nullable: false },
      { name: 'user_id', type: 'varchar', length: 255, nullable: true },
      { name: 'anonymous_id', type: 'varchar', length: 255, nullable: true },
      { name: 'event', type: 'varchar', length: 255, nullable: false },
      { name: 'event_text', type: 'varchar', length: 255, nullable: true },
      { name: 'properties', type: 'json', nullable: true },
      { name: 'context', type: 'json', nullable: true },
      { name: 'timestamp', type: 'timestamp', nullable: false },
      { name: 'sent_at', type: 'timestamp', nullable: true },
      { name: 'received_at', type: 'timestamp', nullable: false },
      { name: 'original_timestamp', type: 'timestamp', nullable: true },
      { name: 'uuid_ts', type: 'timestamp', nullable: false },
    ],
    indexes: [
      { name: 'tracks_user_id_idx', columns: ['user_id'] },
      { name: 'tracks_anonymous_id_idx', columns: ['anonymous_id'] },
      { name: 'tracks_event_idx', columns: ['event'] },
      { name: 'tracks_timestamp_idx', columns: ['timestamp'] },
      { name: 'tracks_received_at_idx', columns: ['received_at'] },
    ],
    partitioning: {
      type: 'range',
      column: 'received_at',
    },
  }),

  identifies: (): WarehouseSchema => ({
    table: 'identifies',
    columns: [
      { name: 'id', type: 'varchar', length: 255, nullable: false },
      { name: 'user_id', type: 'varchar', length: 255, nullable: false },
      { name: 'anonymous_id', type: 'varchar', length: 255, nullable: true },
      { name: 'traits', type: 'json', nullable: true },
      { name: 'context', type: 'json', nullable: true },
      { name: 'timestamp', type: 'timestamp', nullable: false },
      { name: 'sent_at', type: 'timestamp', nullable: true },
      { name: 'received_at', type: 'timestamp', nullable: false },
      { name: 'original_timestamp', type: 'timestamp', nullable: true },
      { name: 'uuid_ts', type: 'timestamp', nullable: false },
    ],
    indexes: [
      { name: 'identifies_user_id_idx', columns: ['user_id'] },
      { name: 'identifies_anonymous_id_idx', columns: ['anonymous_id'] },
      { name: 'identifies_timestamp_idx', columns: ['timestamp'] },
      { name: 'identifies_received_at_idx', columns: ['received_at'] },
    ],
    partitioning: {
      type: 'range',
      column: 'received_at',
    },
  }),

  pages: (): WarehouseSchema => ({
    table: 'pages',
    columns: [
      { name: 'id', type: 'varchar', length: 255, nullable: false },
      { name: 'user_id', type: 'varchar', length: 255, nullable: true },
      { name: 'anonymous_id', type: 'varchar', length: 255, nullable: true },
      { name: 'name', type: 'varchar', length: 255, nullable: true },
      { name: 'category', type: 'varchar', length: 255, nullable: true },
      { name: 'properties', type: 'json', nullable: true },
      { name: 'context', type: 'json', nullable: true },
      { name: 'timestamp', type: 'timestamp', nullable: false },
      { name: 'sent_at', type: 'timestamp', nullable: true },
      { name: 'received_at', type: 'timestamp', nullable: false },
      { name: 'original_timestamp', type: 'timestamp', nullable: true },
      { name: 'uuid_ts', type: 'timestamp', nullable: false },
    ],
    indexes: [
      { name: 'pages_user_id_idx', columns: ['user_id'] },
      { name: 'pages_anonymous_id_idx', columns: ['anonymous_id'] },
      { name: 'pages_name_idx', columns: ['name'] },
      { name: 'pages_timestamp_idx', columns: ['timestamp'] },
      { name: 'pages_received_at_idx', columns: ['received_at'] },
    ],
    partitioning: {
      type: 'range',
      column: 'received_at',
    },
  }),

  groups: (): WarehouseSchema => ({
    table: 'groups',
    columns: [
      { name: 'id', type: 'varchar', length: 255, nullable: false },
      { name: 'user_id', type: 'varchar', length: 255, nullable: true },
      { name: 'anonymous_id', type: 'varchar', length: 255, nullable: true },
      { name: 'group_id', type: 'varchar', length: 255, nullable: false },
      { name: 'traits', type: 'json', nullable: true },
      { name: 'context', type: 'json', nullable: true },
      { name: 'timestamp', type: 'timestamp', nullable: false },
      { name: 'sent_at', type: 'timestamp', nullable: true },
      { name: 'received_at', type: 'timestamp', nullable: false },
      { name: 'original_timestamp', type: 'timestamp', nullable: true },
      { name: 'uuid_ts', type: 'timestamp', nullable: false },
    ],
    indexes: [
      { name: 'groups_user_id_idx', columns: ['user_id'] },
      { name: 'groups_anonymous_id_idx', columns: ['anonymous_id'] },
      { name: 'groups_group_id_idx', columns: ['group_id'] },
      { name: 'groups_timestamp_idx', columns: ['timestamp'] },
      { name: 'groups_received_at_idx', columns: ['received_at'] },
    ],
    partitioning: {
      type: 'range',
      column: 'received_at',
    },
  }),

  aliases: (): WarehouseSchema => ({
    table: 'aliases',
    columns: [
      { name: 'id', type: 'varchar', length: 255, nullable: false },
      { name: 'user_id', type: 'varchar', length: 255, nullable: false },
      { name: 'previous_id', type: 'varchar', length: 255, nullable: false },
      { name: 'context', type: 'json', nullable: true },
      { name: 'timestamp', type: 'timestamp', nullable: false },
      { name: 'sent_at', type: 'timestamp', nullable: true },
      { name: 'received_at', type: 'timestamp', nullable: false },
      { name: 'original_timestamp', type: 'timestamp', nullable: true },
      { name: 'uuid_ts', type: 'timestamp', nullable: false },
    ],
    indexes: [
      { name: 'aliases_user_id_idx', columns: ['user_id'] },
      { name: 'aliases_previous_id_idx', columns: ['previous_id'] },
      { name: 'aliases_timestamp_idx', columns: ['timestamp'] },
      { name: 'aliases_received_at_idx', columns: ['received_at'] },
    ],
    partitioning: {
      type: 'range',
      column: 'received_at',
    },
  }),
};

// SQL generation utilities
export function generateCreateTableSQL(
  schema: WarehouseSchema,
  warehouseType: SegmentWarehouseDestination['warehouseConfig']['type'],
): string {
  const columnDefinitions = schema.columns.map(column => {
    const type = mapColumnType(
      column.type,
      warehouseType,
      column.length,
      column.precision,
      column.scale,
    );
    const nullable = column.nullable !== false ? '' : ' NOT NULL';
    const defaultValue = column.defaultValue
      ? ` DEFAULT ${formatDefaultValue(column.defaultValue, warehouseType)}`
      : '';

    return `  ${column.name} ${type}${nullable}${defaultValue}`;
  });

  let sql = `CREATE TABLE ${schema.table} (\n${columnDefinitions.join(',\n')}\n)`;

  // Add partitioning if supported
  if (schema.partitioning && ['snowflake', 'bigquery'].includes(warehouseType)) {
    sql += generatePartitioningSQL(schema.partitioning, warehouseType);
  }

  return sql;
}

export function generateCreateIndexSQL(
  tableName: string,
  index: WarehouseIndex,
  warehouseType: SegmentWarehouseDestination['warehouseConfig']['type'],
): string {
  const unique = index.unique ? 'UNIQUE ' : '';
  const indexType = getIndexTypeSQL(index.type, warehouseType);
  const columns = index.columns.join(', ');

  switch (warehouseType) {
    case 'postgres':
      return `CREATE ${unique}INDEX ${index.name} ON ${tableName} ${indexType}(${columns})`;
    case 'snowflake':
      // Snowflake doesn't support explicit indexes
      return `-- Snowflake handles indexing automatically for ${index.name}`;
    case 'bigquery':
      // BigQuery doesn't support traditional indexes
      return `-- BigQuery handles indexing automatically for ${index.name}`;
    case 'redshift':
      return `-- COMMENT: Consider adding ${unique}index on ${columns} for table ${tableName}`;
    default:
      return `CREATE ${unique}INDEX ${index.name} ON ${tableName}(${columns})`;
  }
}

function mapColumnType(
  type: WarehouseColumn['type'],
  warehouseType: SegmentWarehouseDestination['warehouseConfig']['type'],
  length?: number,
  precision?: number,
  scale?: number,
): string {
  switch (warehouseType) {
    case 'snowflake':
      return mapSnowflakeType(type, length, precision, scale);
    case 'bigquery':
      return mapBigQueryType(type, length, precision, scale);
    case 'redshift':
      return mapRedshiftType(type, length, precision, scale);
    case 'postgres':
      return mapPostgresType(type, length, precision, scale);
    default:
      return mapPostgresType(type, length, precision, scale);
  }
}

function mapSnowflakeType(
  type: WarehouseColumn['type'],
  length?: number,
  precision?: number,
  scale?: number,
): string {
  switch (type) {
    case 'varchar':
      return `VARCHAR(${length || 255})`;
    case 'text':
      return 'TEXT';
    case 'integer':
      return 'INTEGER';
    case 'bigint':
      return 'BIGINT';
    case 'decimal':
      return `DECIMAL(${precision || 10}, ${scale || 2})`;
    case 'float':
      return 'FLOAT';
    case 'boolean':
      return 'BOOLEAN';
    case 'timestamp':
      return 'TIMESTAMP_NTZ';
    case 'date':
      return 'DATE';
    case 'json':
      return 'VARIANT';
    default:
      return 'VARCHAR(255)';
  }
}

function mapBigQueryType(
  type: WarehouseColumn['type'],
  length?: number,
  precision?: number,
  scale?: number,
): string {
  switch (type) {
    case 'varchar':
      return 'STRING';
    case 'text':
      return 'STRING';
    case 'integer':
      return 'INT64';
    case 'bigint':
      return 'INT64';
    case 'decimal':
      return `NUMERIC(${precision || 10}, ${scale || 2})`;
    case 'float':
      return 'FLOAT64';
    case 'boolean':
      return 'BOOL';
    case 'timestamp':
      return 'TIMESTAMP';
    case 'date':
      return 'DATE';
    case 'json':
      return 'JSON';
    default:
      return 'STRING';
  }
}

function mapRedshiftType(
  type: WarehouseColumn['type'],
  length?: number,
  precision?: number,
  scale?: number,
): string {
  switch (type) {
    case 'varchar':
      return `VARCHAR(${length || 255})`;
    case 'text':
      return 'TEXT';
    case 'integer':
      return 'INTEGER';
    case 'bigint':
      return 'BIGINT';
    case 'decimal':
      return `DECIMAL(${precision || 10}, ${scale || 2})`;
    case 'float':
      return 'REAL';
    case 'boolean':
      return 'BOOLEAN';
    case 'timestamp':
      return 'TIMESTAMP';
    case 'date':
      return 'DATE';
    case 'json':
      return 'SUPER'; // Redshift's semi-structured data type
    default:
      return 'VARCHAR(255)';
  }
}

function mapPostgresType(
  type: WarehouseColumn['type'],
  length?: number,
  precision?: number,
  scale?: number,
): string {
  switch (type) {
    case 'varchar':
      return `VARCHAR(${length || 255})`;
    case 'text':
      return 'TEXT';
    case 'integer':
      return 'INTEGER';
    case 'bigint':
      return 'BIGINT';
    case 'decimal':
      return `DECIMAL(${precision || 10}, ${scale || 2})`;
    case 'float':
      return 'REAL';
    case 'boolean':
      return 'BOOLEAN';
    case 'timestamp':
      return 'TIMESTAMP';
    case 'date':
      return 'DATE';
    case 'json':
      return 'JSONB';
    default:
      return 'VARCHAR(255)';
  }
}

function formatDefaultValue(
  value: any,
  warehouseType: SegmentWarehouseDestination['warehouseConfig']['type'],
): string {
  if (typeof value === 'string') {
    return `'${value}'`;
  }
  if (typeof value === 'boolean') {
    return warehouseType === 'bigquery' ? (value ? 'TRUE' : 'FALSE') : value.toString();
  }
  return value.toString();
}

function generatePartitioningSQL(
  partitioning: WarehousePartitioning,
  warehouseType: SegmentWarehouseDestination['warehouseConfig']['type'],
): string {
  switch (warehouseType) {
    case 'snowflake':
      // Snowflake automatic clustering
      return `\nCLUSTER BY (${partitioning.column})`;
    case 'bigquery':
      // BigQuery partitioning
      return `\nPARTITION BY DATE(${partitioning.column})`;
    default:
      return '';
  }
}

function getIndexTypeSQL(
  type: WarehouseIndex['type'],
  warehouseType: SegmentWarehouseDestination['warehouseConfig']['type'],
): string {
  if (warehouseType !== 'postgres') return '';

  switch (type) {
    case 'btree':
      return 'USING BTREE ';
    case 'hash':
      return 'USING HASH ';
    case 'gin':
      return 'USING GIN ';
    case 'gist':
      return 'USING GIST ';
    default:
      return '';
  }
}

// Warehouse sync utilities
export function createSyncConfig(
  frequency: 'hourly' | 'daily' | 'weekly',
  time?: string,
  timezone = 'UTC',
): SegmentWarehouseDestination['warehouseConfig']['sync'] {
  return {
    frequency,
    time: time || getDefaultSyncTime(frequency),
    timezone,
  };
}

function getDefaultSyncTime(frequency: 'hourly' | 'daily' | 'weekly'): string {
  switch (frequency) {
    case 'hourly':
      return '00'; // Top of each hour
    case 'daily':
      return '02:00'; // 2 AM
    case 'weekly':
      return 'Sunday 02:00'; // Sunday at 2 AM
    default:
      return '02:00';
  }
}

// Query utilities for common warehouse operations
export const warehouseQueries = {
  getUserJourney: (userId: string, startDate: string, endDate: string) => `
    SELECT 
      timestamp,
      event,
      properties,
      context
    FROM tracks 
    WHERE user_id = '${userId}' 
      AND timestamp BETWEEN '${startDate}' AND '${endDate}'
    ORDER BY timestamp ASC
  `,

  getFunnelAnalysis: (events: string[], timeWindow = '7 days') => `
    WITH funnel_events AS (
      SELECT 
        user_id,
        event,
        timestamp,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY timestamp) as step_number
      FROM tracks 
      WHERE event IN (${events.map(e => `'${e}'`).join(', ')})
        AND timestamp >= CURRENT_DATE - INTERVAL '${timeWindow}'
    )
    SELECT 
      event,
      COUNT(DISTINCT user_id) as unique_users,
      step_number
    FROM funnel_events
    GROUP BY event, step_number
    ORDER BY step_number
  `,

  getCohortRetention: (cohortDate: string, periods: number) => `
    WITH cohort_users AS (
      SELECT DISTINCT user_id
      FROM tracks 
      WHERE DATE(timestamp) = '${cohortDate}'
    ),
    retention_data AS (
      SELECT 
        c.user_id,
        EXTRACT(DAY FROM t.timestamp - '${cohortDate}'::DATE) / 7 as week_number
      FROM cohort_users c
      JOIN tracks t ON c.user_id = t.user_id
      WHERE DATE(t.timestamp) BETWEEN '${cohortDate}' AND '${cohortDate}'::DATE + INTERVAL '${periods} weeks'
    )
    SELECT 
      week_number,
      COUNT(DISTINCT user_id) as retained_users
    FROM retention_data
    GROUP BY week_number
    ORDER BY week_number
  `,
};
