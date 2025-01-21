'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressiveTrackletManager from './ProgressiveTrackletManager';
import NewTrackletCreator from './NewTrackletCreator';
import TrackletExporter from './TrackletExporter';
import { Tracklet } from '@/lib/types';
import ImageUploader from './ImageUploader';
import JSONUploader from './JSONUploader';
import { LogDrawer } from './LogDrawer';
import { useTrackletStore } from '@/stores/useTrackletStore';

const TrackletBoard: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<Map<string, File>>(new Map());
  const { setTracklets, createTracklet } = useTrackletStore();

  const handleFileUpload = (loadedTracklets: Tracklet[]) => {
    setTracklets(loadedTracklets);
  };

  const handleImagesUpload = (files: File[]) => {
    setUploadedImages(prev => {
      const newImages = new Map(prev);
      files.forEach(file => {
        newImages.set(file.name, file);
      });
      return newImages;
    });
  };

  const handleNewTracklet = (newTracklet: Tracklet) => {
    createTracklet(newTracklet);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tracklet Management</CardTitle>
            <div className="flex gap-2">
              <LogDrawer />
              <TrackletExporter />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <JSONUploader onFileUpload={handleFileUpload} />
          <ImageUploader onImagesUpload={handleImagesUpload} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <NewTrackletCreator
          existingTracklets={useTrackletStore().tracklets}
          onNewTracklet={handleNewTracklet}
        />
      </div>

      <div className="mt-6">
        <ProgressiveTrackletManager uploadedImages={uploadedImages} />
      </div>
    </div>
  );
};

export default TrackletBoard;