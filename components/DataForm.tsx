import React, { useState } from 'react';
import { PurchaseOrderData, LineItem } from '../types';
import { CopyIcon, DownloadIcon, CheckCircleIcon } from './Icons';

interface DataFormProps {
  data: PurchaseOrderData;
  onChange: (data: PurchaseOrderData) => void;
}

export const DataForm: React.FC<DataFormProps> = ({ data, onChange }) => {
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleInputChange = (field: keyof PurchaseOrderData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedItems = [...data.lineItems];
    // @ts-ignore
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    onChange({ ...data, lineItems: updatedItems });
  };

  // Logic to generate the tab-separated string for Google Sheets paste
  // Matches the exact 15 columns requested
  const generateSheetData = (separator: string = '\t') => {
    const header = [
      'External ID',          // A
      'Customer Internal ID', // B
      'Subbrand',             // C
      'Date',                 // D
      'Customer Request Date',// E
      'PO #',                 // F
      'Comment',              // G
      'Sales Order Type',     // H
      'Buy Session',          // I
      'Ship To Select',       // J
      'Shipping Carrier',     // K
      'Line Number',          // L
      'Item',                 // M
      'Quantity',             // N
      'Comments'              // O
    ];

    const rows = data.lineItems.map(item => [
      item.externalId || '',          // A (Row specific)
      data.customerInternalId || '',  // B
      data.subbrand || '',            // C
      data.date || '',                // D
      data.customerRequestDate || '', // E
      data.poNumber || '',            // F
      data.comment || '',             // G
      data.salesOrderType || '',      // H
      data.buySession || '',          // I
      data.shipToSelect || '',        // J
      data.shippingCarrier || '',     // K
      item.lineNumber || '',          // L (Row specific)
      item.item || '',                // M
      item.quantity || '',            // N
      item.comments || ''             // O
    ]);

    return [header.join(separator), ...rows.map(r => r.join(separator))].join('\n');
  };

  const copyToClipboard = () => {
    const tsvData = generateSheetData('\t');
    navigator.clipboard.writeText(tsvData).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const downloadCSV = () => {
    const csvData = generateSheetData(',');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PO_${data.poNumber || 'extraction'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h2 className="text-xl font-bold text-gray-800">Review & Export</h2>
           <p className="text-sm text-gray-500">
             <span className="text-green-600 font-medium">Green</span> columns extracted. 
             <span className="text-blue-600 font-medium ml-1">Blue</span> columns generated.
           </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm font-medium"
          >
            {copyFeedback ? <CheckCircleIcon /> : <CopyIcon />}
            <span className="ml-2">{copyFeedback ? 'Copied!' : 'Copy for Sheets'}</span>
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition text-sm font-medium"
          >
            <DownloadIcon />
            <span className="ml-2">CSV</span>
          </button>
        </div>
      </div>

      {/* Header Fields (Common for all lines) */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Header Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1">
             <label className="block text-xs font-medium text-green-700 mb-1">Cust. Internal ID (Green)</label>
             <input type="text" value={data.customerInternalId || ''} onChange={(e) => handleInputChange('customerInternalId', e.target.value)} className="w-full rounded-md border-gray-300 border px-3 py-1.5 text-sm focus:ring-green-500 focus:border-green-500" />
          </div>
          <div className="col-span-1">
             <label className="block text-xs font-medium text-blue-700 mb-1">Date (Blue - Today)</label>
             <input type="text" value={data.date || ''} onChange={(e) => handleInputChange('date', e.target.value)} className="w-full rounded-md border-gray-300 border px-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
           <div className="col-span-1">
             <label className="block text-xs font-medium text-green-700 mb-1">Request Date (Green)</label>
             <input type="text" value={data.customerRequestDate || ''} onChange={(e) => handleInputChange('customerRequestDate', e.target.value)} className="w-full rounded-md border-gray-300 border px-3 py-1.5 text-sm focus:ring-green-500 focus:border-green-500" />
          </div>
          <div className="col-span-1">
             <label className="block text-xs font-medium text-green-700 mb-1">PO # (Green)</label>
             <input type="text" value={data.poNumber || ''} onChange={(e) => handleInputChange('poNumber', e.target.value)} className="w-full rounded-md border-gray-300 border px-3 py-1.5 text-sm focus:ring-green-500 focus:border-green-500" />
          </div>
          
          <div className="col-span-1">
             <label className="block text-xs font-medium text-blue-700 mb-1">Order Type (Blue)</label>
             <input type="text" value={data.salesOrderType || 'Bulk'} onChange={(e) => handleInputChange('salesOrderType', e.target.value)} className="w-full rounded-md border-gray-300 border px-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="col-span-2">
             <label className="block text-xs font-medium text-green-700 mb-1">Ship To Select (Green)</label>
             <input type="text" value={data.shipToSelect || ''} onChange={(e) => handleInputChange('shipToSelect', e.target.value)} className="w-full rounded-md border-gray-300 border px-3 py-1.5 text-sm focus:ring-green-500 focus:border-green-500" />
          </div>
           {/* Orange Fields minimized as they are blank by default */}
           <div className="col-span-1">
             <label className="block text-xs font-medium text-orange-700/60 mb-1">Subbrand (Orange)</label>
             <input type="text" value={data.subbrand || ''} onChange={(e) => handleInputChange('subbrand', e.target.value)} className="w-full rounded-md border-gray-300 border px-3 py-1.5 text-sm bg-gray-50" placeholder="Blank" />
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-36">External ID</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-16">Line #</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-green-700 uppercase tracking-wider">Item</th>
              <th className="px-4 py-2 text-right text-xs font-bold text-green-700 uppercase tracking-wider w-24">Qty</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-orange-700/60 uppercase tracking-wider w-48">Comments</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.lineItems.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2">
                   {/* Blue Column: External ID */}
                  <input
                    type="text"
                    value={item.externalId || ''}
                    onChange={(e) => handleLineItemChange(idx, 'externalId', e.target.value)}
                    className="w-full border-gray-200 rounded text-sm px-2 py-1 bg-blue-50/30 text-blue-800 font-medium"
                  />
                </td>
                <td className="px-4 py-2 text-center text-sm text-gray-500">
                   {/* Blue Column: Line # */}
                   {item.lineNumber}
                </td>
                <td className="px-4 py-2">
                   {/* Green Column: Item */}
                  <input
                    type="text"
                    value={item.item || ''}
                    onChange={(e) => handleLineItemChange(idx, 'item', e.target.value)}
                    className="w-full border-gray-200 rounded text-sm px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2">
                   {/* Green Column: Qty */}
                  <input
                    type="number"
                    value={item.quantity || 0}
                    onChange={(e) => handleLineItemChange(idx, 'quantity', parseFloat(e.target.value))}
                    className="w-full border-gray-200 rounded text-sm px-2 py-1 text-right"
                  />
                </td>
                <td className="px-4 py-2">
                   {/* Orange Column: Comments */}
                  <input
                    type="text"
                    value={item.comments || ''}
                    onChange={(e) => handleLineItemChange(idx, 'comments', e.target.value)}
                    className="w-full border-gray-200 rounded text-sm px-2 py-1 bg-gray-50"
                    placeholder="Blank"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.lineItems.length === 0 && (
          <div className="p-4 text-center text-gray-400 text-sm">No line items found</div>
        )}
      </div>
    </div>
  );
};