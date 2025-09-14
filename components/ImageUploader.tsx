
import React, { useState, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (base64: string, mimeType: string) => void;
  imagePreview: string | null;
  setImagePreview: (url: string | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imagePreview, setImagePreview }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onImageUpload(base64String, file.type);
        setImagePreview(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
       const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onImageUpload(base64String, file.type);
        setImagePreview(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  }

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="relative w-full h-48 sm:h-64 border-2 border-dashed border-gray-600 rounded-lg flex flex-col justify-center items-center text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-colors cursor-pointer bg-gray-800/50"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      {imagePreview ? (
        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg p-2" />
      ) : (
        <div className="text-center">
          <UploadIcon className="mx-auto h-12 w-12" />
          <p className="mt-2">Drag & drop an image here</p>
          <p className="text-sm">or click to select a file</p>
          <p className="text-xs mt-4">Use a photo of an object, a person, or even a pet!</p>
        </div>
      )}
    </div>
  );
};
