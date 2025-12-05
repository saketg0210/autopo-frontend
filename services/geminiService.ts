import { PurchaseOrderData, LineItem } from "../types";

// Base URL for backend API
const BACKEND_URL = "https://autopo-server.vercel.app";

/**
 * Helper: parse Gemini JSON response from proxy
 */
const parseGeminiResponseText = (res: any): any => {
  if (!res) return null;

  const maybeText = res?.text
    || res?.output?.[0]?.content?.[0]?.text
    || res?.candidates?.[0]?.content?.[0]?.text;

  if (!maybeText) return res;

  try {
    return typeof maybeText === "string" ? JSON.parse(maybeText) : maybeText;
  } catch (e) {
    return maybeText;
  }
};

/**
 * Analyze a document (purchase order)
 */
export const analyzeDocument = async (
  fileBase64: string,
  mimeType: string
): Promise<PurchaseOrderData> => {
  const textParts = [
    {
      text: `Analyze this Purchase Order. Extract ONLY these fields:
- customerInternalId
- customerRequestDate
- poNumber
- shipToSelect
- lineItems (item, quantity)
`
    }
  ];

  const resp = await fetch(`${BACKEND_URL}/api/analyzeDocument`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileBase64, mimeType, textParts })
  });

  if (!resp.ok) {
    const errJson = await resp.json().catch(() => ({ error: "unknown" }));
    throw new Error(`Server error ${resp.status}: ${JSON.stringify(errJson)}`);
  }

  const data = await resp.json();
  const extracted = parseGeminiResponseText(data);

  // Post-process line items
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US");
  const monthStr = today.toLocaleString("default", { month: "short" }).toUpperCase();

  const rawLineItems = extracted?.lineItems || [];
  const processedLineItems: LineItem[] = rawLineItems.map((item: any, index: number) => ({
    externalId: `DAR${monthStr}${(index + 1).toString().padStart(4, "0")}`,
    lineNumber: index + 1,
    item: item.item || "",
    quantity: item.quantity || 0,
    comments: ""
  }));

  const finalData: PurchaseOrderData = {
    customerInternalId: extracted?.customerInternalId || "",
    customerRequestDate: extracted?.customerRequestDate || "",
    poNumber: extracted?.poNumber || "",
    shipToSelect: extracted?.shipToSelect || "",
    date: formattedDate,
    salesOrderType: "Bulk",
    subbrand: "",
    comment: "",
    buySession: "",
    shippingCarrier: "",
    lineItems: processedLineItems
  };

  return finalData;
};

/**
 * Convert file to base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to read file as string"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

