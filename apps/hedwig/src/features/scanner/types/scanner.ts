export interface ScanResult {
  barcodeType?: BarcodeType;
  data: string;
  id: string;
  note?: string;
  productData?: {
    id: string;
    name: string;
    [key: string]: any;
  };
  timestamp: number;
  type: string;
}

export interface ScannerProps {
  onError?: (error: string) => void;
  onScan: (result: ScanResult) => void;
}

export interface HistoryItem extends ScanResult {
  formattedDate: string;
}

export type BarcodeType =
  | 'qr'
  | 'pdf417'
  | 'aztec'
  | 'ean13'
  | 'ean8'
  | 'upc_a'
  | 'upc_e'
  | 'code39'
  | 'code93'
  | 'code128'
  | 'codabar'
  | 'itf'
  | 'rss14'
  | 'rssexpanded'
  | 'unknown';

export interface ScannerState {
  error: string | null;
  hasPermission: boolean | null;
  scanned: boolean;
  scanning: boolean;
}
