'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tracklet } from '@/lib/types';

interface JSONUploaderProps {
  onFileUpload: (tracklets: Tracklet[]) => void;
}

const JSONUploader: React.FC<JSONUploaderProps> = ({ onFileUpload }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          const trackletsData = jsonData.tracklets || jsonData;
          
          // Ensure tracklet_alias is preserved if it exists in the loaded data
          const processedTracklets = trackletsData.map((tracklet: any) => ({
            ...tracklet,
            tracklet_alias: tracklet.tracklet_alias || undefined
          }));
          
          onFileUpload(processedTracklets);
          setFile(uploadedFile);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(uploadedFile);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="json-upload">Upload Tracklets JSON</Label>
        <div className="flex gap-4 items-center">
          <Input 
            id="json-upload"
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="cursor-pointer"
          />
          {file && (
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              Loaded: {file.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JSONUploader