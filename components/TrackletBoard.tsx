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
import HelpDialog from './HelpDialog';
import { useTrackletStore } from '@/stores/useTrackletStore';
import UploadStatisticsDialog from './UploadStatisticsDialog';
import { useUploadStatistics } from '@/hooks/useUploadStatistics';
import { Badge } from '@/components/ui/badge';

const TrackletBoard: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<Map<string, File>>(new Map());
  const { tracklets, setTracklets } = useTrackletStore();

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

  const clearTracklets = () => {
    setTracklets([]);
  };

  const clearImages = () => {
    setUploadedImages(new Map());
  };



  const {
    trackletCount,
    totalImageCount,
    matchedImagesCount,
    showDialog,
    setShowDialog,
    handleConfirm,
    handleClear
  } = useUploadStatistics(tracklets, uploadedImages, clearTracklets, clearImages);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <CardTitle>Tracklet Management</CardTitle>
              {(tracklets.length > 0 || uploadedImages.size > 0) && (
                <div className="flex gap-2 items-center">
                  <Badge variant="outline" className="h-5">
                    Tracklets: {trackletCount}
                  </Badge>
                  <Badge variant="outline" className="h-5">
                    Images: {uploadedImages.size}
                  </Badge>
                  <Badge 
                    variant={matchedImagesCount < uploadedImages.size ? "destructive" : "outline"} 
                    className="h-5"
                  >
                    Matched: {matchedImagesCount}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <HelpDialog />
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
        <NewTrackletCreator />
      </div>

      <div className="mt-6">
        <ProgressiveTrackletManager uploadedImages={uploadedImages} />
      </div>

      <UploadStatisticsDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        trackletCount={trackletCount}
        imageCount={uploadedImages.size}
        matchedImagesCount={matchedImagesCount}
        onConfirm={handleConfirm}
        onClear={handleClear}
      />
    </div>
  );
};

export default TrackletBoard;