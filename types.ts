export interface LineItem {
  externalId: string; // Col A (Auto-generated per line logic: DAR + Month + Serial)
  lineNumber: number; // Col L (Sequential 1, 2, 3...)
  item: string; // Col M (Extracted)
  quantity: number; // Col N (Extracted)
  comments: string; // Col O (Blank)
}

export interface PurchaseOrderData {
  customerInternalId: string; // Col B (Extracted/Mapped)
  subbrand: string; // Col C (Blank)
  date: string; // Col D (Today's Date)
  customerRequestDate: string; // Col E (Extracted)
  poNumber: string; // Col F (Extracted)
  comment: string; // Col G (Blank)
  salesOrderType: string; // Col H (Always 'Bulk')
  buySession: string; // Col I (Blank)
  shipToSelect: string; // Col J (Extracted - Ship To Address)
  shippingCarrier: string; // Col K (Blank)
  lineItems: LineItem[];
}

export interface ExtractedDataResponse {
  success: boolean;
  data?: PurchaseOrderData;
  error?: string;
  rawText?: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}