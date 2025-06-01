// Export Mantine Table components
import { Table as MantineTable, type TableProps as MantineTableProps, type TableTheadProps, type TableTbodyProps, type TableTfootProps, type TableTrProps, type TableThProps, type TableTdProps, type TableCaptionProps } from '@mantine/core';
import type React from 'react';

export const Table: React.FC<MantineTableProps> = MantineTable;
export type TableProps = MantineTableProps;

// For compatibility, re-export Table sub-components
export const TableHeader: React.FC<TableTheadProps> = MantineTable.Thead;
export const TableBody: React.FC<TableTbodyProps> = MantineTable.Tbody;
export const TableFooter: React.FC<TableTfootProps> = MantineTable.Tfoot;
export const TableRow: React.FC<TableTrProps> = MantineTable.Tr;
export const TableHead: React.FC<TableThProps> = MantineTable.Th;
export const TableCell: React.FC<TableTdProps> = MantineTable.Td;
export const TableCaption: React.FC<TableCaptionProps> = MantineTable.Caption;
