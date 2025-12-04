import React, { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { DataForm } from './components/DataForm';
import { analyzeDocument, fileToBase64 } from './services/geminiService';
import { PurchaseOrderData, AnalysisStatus } from './types';
import { FileIcon, LoadingSpinner, CheckCircleIcon, BrainIcon } from './components/Icons';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [data, setData] = useState<PurchaseOrderData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setStatus(AnalysisStatus.ANALYZING);
    setErrorMsg(null);
    setData(null);

    // Create a local preview URL
    const previewUrl = URL.createObjectURL(selectedFile);
    setFilePreview(previewUrl);

    try {
      const base64 = await fileToBase64(selectedFile);
      const extractedData = await analyzeDocument(base64, selectedFile.type);
      setData(extractedData);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setStatus(AnalysisStatus.ERROR);
      setErrorMsg(err.message || "Failed to analyze document.");
    }
  };

  const loadDemoData = () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US');
    const monthStr = today.toLocaleString('default', { month: 'short' }).toUpperCase();
    
    const demoData: PurchaseOrderData = {
      customerInternalId: "2513", // Example from your list
      subbrand: "",
      date: formattedDate,
      customerRequestDate: "2025-12-01",
      poNumber: "DEMO-PO-2025",
      comment: "",
      salesOrderType: "Bulk",
      buySession: "",
      shipToSelect: "123 Distribution Center, NY",
      shippingCarrier: "",
      lineItems: [
        {
          externalId: `DAR${monthStr}0001`,
          lineNumber: 1,
          item: "Mens Performance Tee - Black / L",
          quantity: 500,
          comments: ""
        },
        {
          externalId: `DAR${monthStr}0002`,
          lineNumber: 2,
          item: "Mens Performance Tee - Black / XL",
          quantity: 250,
          comments: ""
        }
      ]
    };
    
    setFile(null);
    setFilePreview(null);
    setData(demoData);
    setStatus(AnalysisStatus.SUCCESS);
  };

  const reset = () => {
    setFile(null);
    setFilePreview(null);
    setStatus(AnalysisStatus.IDLE);
    setData(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Navbar */}
      {/* <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center bg-indigo-600 rounded-lg p-2 mr-3">
                <BrainIcon />
                <span className="ml-2 font-bold text-white text-lg">AutoPO</span>
              </div>
              <div className="hidden md:flex flex-col ml-2">
                 <span className="font-semibold text-gray-800 leading-tight">Intelligent Document Processing</span>
                 <span className="text-xs text-gray-500">Powered by Gemini 2.5 Flash</span>
              </div>
            </div>
            <div className="flex items-center">
               <span className="text-sm text-gray-500 mr-4 hidden md:block">No training required • Zero-shot extraction</span>
               <a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="text-indigo-600 text-sm hover:underline font-medium">
                 API Docs
               </a>
            </div>
          </div>
        </div>
      </nav> */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Info Banner for the User's "Training" Question */}
        {/* <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-8 flex items-start">
           <div className="flex-shrink-0 mt-1">
             <BrainIcon />
           </div>
           <div className="ml-3">
             <h3 className="text-sm font-medium text-indigo-800">Do I need to train a model?</h3>
             <div className="mt-1 text-sm text-indigo-700">
               <p>
                 No! We use <strong>Gemini 2.5 Flash</strong> which is a "Multimodal" model. It is pre-trained to understand documents, images, and text relations instantly. 
                 Simply define the fields you want (as we did in the code schema), and it handles the rest.
               </p>
             </div>
           </div>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          
          {/* Left Column: Input & Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">1. Upload Document</h2>
                <p className="text-sm text-gray-500">Upload a Purchase Order (PDF or Image) to begin analysis.</p>
              </div>
              
              {!file && status !== AnalysisStatus.SUCCESS ? (
                <FileUploader onFileSelect={handleFileSelect} />
              ) : file ? (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <FileIcon />
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button 
                        onClick={reset}
                        className="text-xs text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded-md hover:bg-red-50 transition"
                      >
                        Remove
                      </button>
                   </div>
                   
                   {/* Preview Area */}
                   <div className="relative aspect-[3/4] w-full bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
                      {file.type.includes('image') ? (
                         <img src={filePreview!} alt="Preview" className="w-full h-full object-contain" />
                      ) : (
                         <object data={filePreview!} type={file.type} className="w-full h-full">
                            <div className="flex items-center justify-center h-full text-gray-500">
                              <p>PDF Preview Not Available</p>
                            </div>
                         </object>
                      )}
                      
                      {/* Overlay Loading State */}
                      {status === AnalysisStatus.ANALYZING && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                          <LoadingSpinner />
                          <p className="mt-4 text-indigo-700 font-medium animate-pulse">Analyzing Document Structure...</p>
                          <p className="text-xs text-indigo-500 mt-1">Extracting Line Items & Totals</p>
                        </div>
                      )}
                   </div>
                </div>
              ) : (
                // Demo Mode State
                <div className="border border-gray-200 rounded-lg p-8 bg-gray-50 text-center h-64 flex flex-col items-center justify-center">
                  <span className="text-indigo-500 mb-2">
                    <BrainIcon />
                  </span>
                  <p className="text-gray-900 font-medium">Demo Mode</p>
                  <p className="text-sm text-gray-500 mb-4">Viewing sample data layout</p>
                  <button 
                    onClick={reset}
                    className="text-sm text-indigo-600 font-medium hover:underline"
                  >
                    Reset to Upload
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Output Data */}
          <div className="space-y-6">
             <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-900">2. Review Data</h2>
                {status === AnalysisStatus.SUCCESS && (
                  <span className="flex items-center text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <CheckCircleIcon />
                    <span className="ml-1">{file ? 'Extraction Complete' : 'Demo Data Loaded'}</span>
                  </span>
                )}
             </div>

             {status === AnalysisStatus.IDLE && (
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center h-[500px]">
                  <div className="p-4 bg-indigo-50 rounded-full mb-4">
                    <BrainIcon />
                  </div>
                  <h3 className="text-gray-900 font-medium text-lg">Waiting for Document</h3>
                  <p className="text-gray-500 mt-2 max-w-xs mb-6">Upload a file to see the AI automatically extract key information into a structured form.</p>
                  
                  <button 
                    onClick={loadDemoData}
                    className="text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition shadow-sm"
                  >
                    Preview with Demo Data
                  </button>
               </div>
             )}

             {status === AnalysisStatus.ANALYZING && (
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-[500px] animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-20 bg-gray-200 rounded mb-6"></div>
                  <div className="space-y-3">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
               </div>
             )}

             {status === AnalysisStatus.ERROR && (
               <div className="bg-red-50 rounded-xl border border-red-200 p-6 flex items-start">
                  <div className="text-red-500 mr-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-red-800 font-medium">Extraction Failed</h3>
                    <p className="text-red-600 text-sm mt-1">{errorMsg}</p>
                    <button onClick={reset} className="mt-4 text-sm font-medium text-red-700 hover:text-red-900 underline">Try Again</button>
                  </div>
               </div>
             )}

             {status === AnalysisStatus.SUCCESS && data && (
               <DataForm data={data} onChange={setData} />
             )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;