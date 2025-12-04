import React, { useCallback } from 'react';
import { UploadIcon } from './Icons';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, disabled }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileSelect(e.dataTransfer.files[0]);
      }
    },
    [onFileSelect, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      if (e.target.files && e.target.files[0]) {
        onFileSelect(e.target.files[0]);
      }
    },
    [onFileSelect, disabled]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 flex flex-col items-center justify-center h-64 bg-white ${
        disabled
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
          : 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer'
      }`}
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept="image/*,application/pdf"
        onChange={handleChange}
        disabled={disabled}
      />
      <label htmlFor="fileInput" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
        <UploadIcon />
        <p className="mt-4 text-lg font-medium text-gray-700">
          Drop your PO here, or <span className="text-indigo-600">browse</span>
        </p>
        <p className="mt-2 text-sm text-gray-500">Supports PDF, JPG, PNG</p>
      </label>
    </div>
  );
};