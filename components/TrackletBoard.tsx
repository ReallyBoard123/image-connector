'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import JSONUploader from './JSONUploader';
import TrackletManager from './TrackletManager';
import NewTrackletCreator from './NewTrackletCreator';
import TrackletExporter from './TrackletExporter';
import { ShapeType } from './ShapeProvider';

export interface TrackletImage {
  name: string;
  path: string;
  shape: ShapeType;
  color: string;
}

export interface Tracklet {
  tracklet_id: string;
  images: TrackletImage[];
}

const TrackletBoard: React.FC = () => {
  const [tracklets, setTracklets] = useState<Tracklet[]>([]);

  const handleFileUpload = (loadedTracklets: Tracklet[]) => {
    setTracklets(loadedTracklets);
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
            <CardTitle>Shape Tracklet Management</CardTitle>
            <TrackletExporter tracklets={tracklets} />
          </div>
        </CardHeader>
        <CardContent>
          <JSONUploader onFileUpload={handleFileUpload} />
        </CardContent>
      </Card>

      {/* New Tracklet Creator */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <NewTrackletCreator
          existingTracklets={tracklets}
          onNewTracklet={handleNewTracklet}
        />
      </div>

      {/* Tracklet Manager */}
      <div className="mt-6">
        <TrackletManager
          tracklets={tracklets}
          onTrackletUpdate={handleTrackletUpdate}
        />
      </div>
    </div>
  );
};

export default TrackletBoard;