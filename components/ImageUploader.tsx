import React, { useCallback, useState, useRef } from 'react';
import { UploadIcon, CameraIcon, TrashIcon } from './IconComponents';

interface ImageUploaderProps {
  onFilesChange: (files: File[]) => void;
  files: File[];
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesChange, files, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = (newFiles: FileList | null) => {
    if (newFiles && newFiles.length > 0) {
      const imageFiles = Array.from(newFiles).filter(file => file.type.startsWith('image/'));
      onFilesChange([...files, ...imageFiles]);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    onFilesChange(files.filter((_, index) => index !== indexToRemove));
  };
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleAddFiles(e.dataTransfer.files);
    }
  }, [files, onFilesChange]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const triggerFileDialog = () => fileInputRef.current?.click();
  const triggerCameraDialog = () => cameraInputRef.current?.click();

  return (
    <div className="w-full">
      {files.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
              {files.map((file, index) => (
                  <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden shadow-md border border-gray-100">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${index}`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        onLoad={e => URL.revokeObjectURL(e.currentTarget.src)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                          <button 
                              onClick={() => handleRemoveFile(index)}
                              className="w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 shadow-lg"
                              aria-label="Remove image"
                          >
                            <TrashIcon />
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}

      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`relative border border-dashed rounded-3xl p-8 text-center transition-all duration-300 ${
            isDragging 
            ? 'border-green-400 bg-green-50/50 scale-[1.02]' 
            : 'border-slate-300 bg-slate-50 hover:border-green-300 hover:bg-white'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={(e) => handleAddFiles(e.target.files)}
          disabled={isLoading}
        />
        <input
          type="file"
          ref={cameraInputRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleAddFiles(e.target.files)}
          disabled={isLoading}
        />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-3 rounded-full transition-colors ${isDragging ? 'bg-green-100 text-green-600' : 'bg-white text-slate-400 shadow-sm'}`}>
            <UploadIcon />
          </div>
          
          <div className="space-y-1">
              <p className="text-slate-600 font-medium">
                Sube tus fotos aquí
              </p>
              <p className="text-slate-400 text-xs">JPG, PNG permitidos</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={triggerFileDialog}
              disabled={isLoading}
              className="px-5 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-full hover:bg-slate-700 disabled:bg-slate-300 transition-all shadow-lg shadow-slate-200 hover:shadow-xl"
            >
              Galería
            </button>
            <button
              onClick={triggerCameraDialog}
              disabled={isLoading}
              className="inline-flex items-center px-5 py-2.5 bg-white text-slate-700 border border-slate-200 text-sm font-medium rounded-full hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-sm hover:shadow-md"
            >
              <CameraIcon />
              <span className="ml-2">Cámara</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};