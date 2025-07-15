'use client';

import { APPLE_BREAKPOINTS, RESPONSIVE } from '#/lib/ui-constants';
import { cn } from '#/lib/utils';
import { useViewportSize } from '@mantine/hooks';
import { useTheme } from 'next-themes';
import { parse, unparse } from 'papaparse';
import { memo, useEffect, useMemo, useState } from 'react';
import DataGrid, { textEditor } from 'react-data-grid';

import 'react-data-grid/lib/styles.css';

type SheetEditorProps = {
  content: string;
  saveContent: (content: string, isCurrentVersion: boolean) => void;
  status: string;
  isCurrentVersion: boolean;
  currentVersionIndex: number;
};

const MIN_ROWS = 50;
const MIN_COLS = 26;

const PureSpreadsheetEditor = ({
  content,
  saveContent,
  status: _status,
  isCurrentVersion: _isCurrentVersion,
}: SheetEditorProps) => {
  const { resolvedTheme } = useTheme();
  const { width: windowWidth } = useViewportSize();

  // Responsive column configuration
  const isMobile = windowWidth < APPLE_BREAKPOINTS.IPAD_MINI;
  const isTablet =
    windowWidth >= APPLE_BREAKPOINTS.IPAD_MINI && windowWidth < APPLE_BREAKPOINTS.IPAD_PRO_12;

  const parseData = useMemo(() => {
    if (!content) return Array(MIN_ROWS).fill(Array(MIN_COLS).fill(''));
    const result = parse<string[]>(content, { skipEmptyLines: true });

    const paddedData = result.data.map(row => {
      const paddedRow = [...row];
      while (paddedRow.length < MIN_COLS) {
        paddedRow.push('');
      }
      return paddedRow;
    });

    while (paddedData.length < MIN_ROWS) {
      paddedData.push(Array(MIN_COLS).fill(''));
    }

    return paddedData;
  }, [content]);

  const columns = useMemo(() => {
    // Responsive row number column
    const rowNumberColumn = {
      key: 'rowNumber',
      name: '',
      frozen: true,
      width: isMobile ? 40 : 50,
      renderCell: ({ rowIdx }: { rowIdx: number }) => rowIdx + 1,
      cellClass: 'border-t border-r dark:bg-zinc-950 dark:text-zinc-50',
      headerCellClass: 'border-t border-r dark:bg-zinc-900 dark:text-zinc-50',
    };

    // Responsive column width based on device
    const columnWidth = isMobile ? 100 : isTablet ? 110 : 120;

    const dataColumns = Array.from({ length: MIN_COLS }, (_, i) => ({
      key: i.toString(),
      name: String.fromCharCode(65 + i),
      renderEditCell: textEditor,
      width: columnWidth,
      cellClass: cn(`border-t dark:bg-zinc-950 dark:text-zinc-50`, {
        'border-l': i !== 0,
      }),
      headerCellClass: cn(`border-t dark:bg-zinc-900 dark:text-zinc-50`, {
        'border-l': i !== 0,
      }),
    }));

    return [rowNumberColumn, ...dataColumns];
  }, [isMobile, isTablet]);

  const initialRows = useMemo(() => {
    return parseData.map((row, rowIndex) => {
      const rowData: any = {
        id: rowIndex,
        rowNumber: rowIndex + 1,
      };

      columns.slice(1).forEach((col, colIndex) => {
        rowData[col.key] = row[colIndex] || '';
      });

      return rowData;
    });
  }, [parseData, columns]);

  const [localRows, setLocalRows] = useState(initialRows);

  useEffect(() => {
    setLocalRows(initialRows);
  }, [initialRows]);

  const generateCsv = (data: any[][]) => {
    return unparse(data);
  };

  const handleRowsChange = (newRows: any[]) => {
    setLocalRows(newRows);

    const updatedData = newRows.map(row => {
      return columns.slice(1).map(col => row[col.key] || '');
    });

    const newCsvContent = generateCsv(updatedData);
    saveContent(newCsvContent, true);
  };

  return (
    <div
      className={`${RESPONSIVE.LAYOUT.CONTENT_MOBILE} overflow-auto`}
      style={{
        height: isMobile ? 'clamp(400px, 60vh, 70vh)' : '100%',
        fontSize: isMobile ? '14px' : '16px',
      }}
    >
      <DataGrid
        className={resolvedTheme === 'dark' ? 'rdg-dark' : 'rdg-light'}
        columns={columns}
        rows={localRows}
        enableVirtualization
        onRowsChange={handleRowsChange}
        onCellClick={args => {
          if (args.column.key !== 'rowNumber') {
            args.selectCell(true);
          }
        }}
        style={{
          height: '100%',
          minHeight: isMobile ? '400px' : '500px',
        }}
        defaultColumnOptions={{
          resizable: !isMobile, // Disable resize on mobile for better touch experience
          sortable: true,
        }}
      />
    </div>
  );
};

function areEqual(prevProps: SheetEditorProps, nextProps: SheetEditorProps) {
  return (
    prevProps.currentVersionIndex === nextProps.currentVersionIndex &&
    prevProps.isCurrentVersion === nextProps.isCurrentVersion &&
    !(prevProps.status === 'streaming' && nextProps.status === 'streaming') &&
    prevProps.content === nextProps.content &&
    prevProps.saveContent === nextProps.saveContent
  );
}

export const SpreadsheetEditor = memo(PureSpreadsheetEditor, areEqual);
