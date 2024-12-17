'use client';

import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShapeProvider, type ShapeType } from './ShapeProvider';

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

interface TrackletManagerProps {
  tracklets: Tracklet[];
  onTrackletUpdate: (updatedTracklets: Tracklet[]) => void;
}

export const TrackletManager: React.FC<TrackletManagerProps> = ({
  tracklets,
  onTrackletUpdate,
}) => {
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const newTracklets = [...tracklets];
    const sourceTracklet = newTracklets[parseInt(source.droppableId)];
    const destTracklet = newTracklets[parseInt(destination.droppableId)];

    const [movedImage] = sourceTracklet.images.splice(source.index, 1);
    destTracklet.images.splice(destination.index, 0, movedImage);

    onTrackletUpdate(newTracklets);
  };

  if (tracklets.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <CardTitle>No Tracklets Available</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload a JSON file or create a new tracklet to get started
          </p>
        </div>
      </Card>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tracklets.map((tracklet, trackletIndex) => (
          <Droppable key={tracklet.tracklet_id} droppableId={trackletIndex.toString()}>
            {(provided, snapshot) => (
              <Card 
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`h-fit ${snapshot.isDraggingOver ? 'bg-muted/50' : ''}`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>Tracklet {tracklet.tracklet_id}</span>
                    <span className="text-sm text-muted-foreground">
                      {tracklet.images.length} shapes
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {tracklet.images.map((image, index) => (
                      <Draggable
                        key={image.path}
                        draggableId={image.path}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`relative group ${
                              snapshot.isDragging ? 'opacity-50 ring-2 ring-primary' : ''
                            }`}
                          >
                            <div className="w-full aspect-square bg-muted rounded-md overflow-hidden p-4 transition-colors hover:bg-muted/80">
                              <ShapeProvider 
                                type={image.shape} 
                                color={image.color}
                              />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 hidden group-hover:block rounded-b-md">
                              {image.name}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </CardContent>
              </Card>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default TrackletManager;