// src/services/geminiService.ts
import { PurchaseOrderData, LineItem } from "../types";

const parseGeminiResponseText = (res: any): any => {
  // Gemini response shapes can vary. Inspect the returned object during dev.
  // Common places: res.output[0].content[0].text  or res.candidates[0].content[0].text  or plain JSON string.
  if (!res) return null;
  // Try to find JSON string
  const maybeText = res?.text
    || res?.output?.[0]?.content?.[0]?.text
    || res?.candidates?.[0]?.content?.[0]?.text;
  if (!maybeText) return res;
  try {
    return typeof maybeText === "string" ? JSON.parse(maybeText) : maybeText;
  } catch (e) {
    // not JSON — return raw text
    return maybeText;
  }
};

export const analyzeDocument = async (
  fileBase64: string,
  mimeType: string
): Promise<PurchaseOrderData> => {
  // Build textParts with your extraction prompt and schema config
  const textParts = [
    {
      text: `Analyze this Purchase Order. Extract specific data points.

EXTRACT ONLY THESE FIELDS (Green Columns):
- customerInternalId
- customerRequestDate
- poNumber
- shipToSelect
- lineItems (item, quantity)
`
    }
  ];

  const config = {
    responseMimeType: "application/json",
    // if you have a schema to pass, include it here
    // responseSchema: poSchema
  };

  const resp = await fetch("/api/analyzeDocument", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileBase64, mimeType, textParts, config })
  });

  if (!resp.ok) {
    const errJson = await resp.json().catch(()=>({error:"unknown"}));
    throw new Error(`Server error ${resp.status}: ${JSON.stringify(errJson)}`);
  }

  const data = await resp.json();
  const extracted = parseGeminiResponseText(data);

  // Post-process (your Blue & Orange logic)
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US');
  const monthStr = today.toLocaleString('default', { month: 'short' }).toUpperCase();

  const rawLineItems = extracted?.lineItems || [];
  const processedLineItems: LineItem[] = (rawLineItems || []).map((item: any, index: number) => {
    const serial = (index + 1).toString().padStart(4, '0');
    return {
      externalId: `DAR${monthStr}${serial}`,
      lineNumber: index + 1,
      item: item.item || '',
      quantity: item.quantity || 0,
      comments: ''
    };
  });

  const finalData: PurchaseOrderData = {
    customerInternalId: extracted?.customerInternalId || '',
    customerRequestDate: extracted?.customerRequestDate || '',
    poNumber: extracted?.poNumber || '',
    shipToSelect: extracted?.shipToSelect || '',
    date: formattedDate,
    salesOrderType: 'Bulk',
    subbrand: '',
    comment: '',
    buySession: '',
    shippingCarrier: '',
    lineItems: processedLineItems
  };

  return finalData;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to read file as string"));
      }
    };
    reader.onerror = error => reject(error);
  });
};
