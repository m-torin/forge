// Export Mantine Table components
import { Table as MantineTable, type TableProps as MantineTableProps } from '@mantine/core';

export const Table = MantineTable;
export type TableProps = MantineTableProps;

// For compatibility, re-export Table sub-components
export const TableHeader = MantineTable.Thead;
export const TableBody = MantineTable.Tbody;
export const TableFooter = MantineTable.Tfoot;
export const TableRow = MantineTable.Tr;
export const TableHead = MantineTable.Th;
export const TableCell = MantineTable.Td;
export const TableCaption = MantineTable.Caption;
