'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TrackletManager from './TrackletManager';
import NewTrackletCreator from './NewTrackletCreator';
import TrackletExporter from './TrackletExporter';
import { Tracklet } from '@/lib/types';
import ImageUploader from './ImageUploader';
import JSONUploader from './JSONUploader';


const TrackletBoard: React.FC = () => {
  const [tracklets, setTracklets] = useState<Tracklet[]>([]);
  const [uploadedImages, setUploadedImages] = useState<Map<string, File>>(new Map());

  const handleFileUpload = (loadedTracklets: Tracklet[]) => {
    setTracklets(loadedTracklets);
  };

  const handleImagesUpload = (files: File[]) => {
    const newImages = new Map(uploadedImages);
    files.forEach(file => {
      newImages.set(file.name, file);
    });
    setUploadedImages(newImages);
  };

  const handleTrackletUpdate = (updatedTracklets: Tracklet[]) => {
    setTracklets(updatedTracklets);
  };

  const handleNewTracklet = (newTracklet: Tracklet) => {
    setTracklets([...tracklets, newTracklet]);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tracklet Management</CardTitle>
            <TrackletExporter tracklets={tracklets} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <JSONUploader onFileUpload={handleFileUpload} />
          <ImageUploader onImagesUpload={handleImagesUpload} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <NewTrackletCreator
          existingTracklets={tracklets}
          onNewTracklet={handleNewTracklet}
        />
      </div>

      <div className="mt-6">
        <TrackletManager
          tracklets={tracklets}
          onTrackletUpdate={handleTrackletUpdate}
          uploadedImages={uploadedImages}
        />
      </div>
    </div>
  );
};

export default TrackletBoard