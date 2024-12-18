'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImagesUpload: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onImagesUpload(acceptedFiles);
  }, [onImagesUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    }
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
      <p className="text-sm text-muted-foreground">
        {isDragActive ? 
          'Drop the images here...' : 
          'Drag & drop images here, or click to select'}
      </p>
    </div>
  );
};

export default ImageUploader