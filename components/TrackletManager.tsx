'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShapeProvider, type ShapeType } from './ShapeProvider';
import { ChevronDown, ChevronUp, Merge } from 'lucide-react';

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
  // State for selected images
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  // State for collapsed tracklets
  const [collapsedTracklets, setCollapsedTracklets] = useState<Set<string>>(new Set());

  const toggleImageSelection = (imagePath: string, event: React.MouseEvent) => {
    const newSelection = new Set(selectedImages);
    if (event.ctrlKey || event.metaKey) {
      // Toggle single selection with Ctrl/Cmd
      if (newSelection.has(imagePath)) {
        newSelection.delete(imagePath);
      } else {
        newSelection.add(imagePath);
      }
    } else if (event.shiftKey && selectedImages.size > 0) {
      // Range selection with Shift
      const lastSelected = Array.from(selectedImages)[selectedImages.size - 1];
      const [trackletId, startIndex] = findImagePosition(lastSelected);
      const [currentTrackletId, currentIndex] = findImagePosition(imagePath);
      
      if (trackletId === currentTrackletId) {
        const tracklet = tracklets.find(t => t.tracklet_id === trackletId);
        if (tracklet) {
          const start = Math.min(startIndex, currentIndex);
          const end = Math.max(startIndex, currentIndex);
          tracklet.images.slice(start, end + 1).forEach(img => {
            newSelection.add(img.path);
          });
        }
      }
    } else {
      // Single selection without modifiers
      newSelection.clear();
      newSelection.add(imagePath);
    }
    setSelectedImages(newSelection);
  };

  const findImagePosition = (imagePath: string): [string, number] => {
    for (const tracklet of tracklets) {
      const index = tracklet.images.findIndex(img => img.path === imagePath);
      if (index !== -1) {
        return [tracklet.tracklet_id, index];
      }
    }
    return ['', -1];
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const newTracklets = [...tracklets];
    const sourceTracklet = newTracklets[parseInt(source.droppableId)];
    const destTracklet = newTracklets[parseInt(destination.droppableId)];

    // Handle multiple selected images if the dragged item is part of the selection
    if (selectedImages.has(result.draggableId)) {
      const selectedPaths = Array.from(selectedImages);
      const movedImages: TrackletImage[] = [];
      
      // Remove all selected images from their source tracklets
      newTracklets.forEach(tracklet => {
        const imagesToKeep: TrackletImage[] = [];
        const imagesToMove: TrackletImage[] = [];
        
        tracklet.images.forEach(image => {
          if (selectedPaths.includes(image.path)) {
            imagesToMove.push(image);
          } else {
            imagesToKeep.push(image);
          }
        });
        
        tracklet.images = imagesToKeep;
        movedImages.push(...imagesToMove);
      });

      // Add all selected images to the destination tracklet
      destTracklet.images.splice(destination.index, 0, ...movedImages);
    } else {
      // Handle single image drag
      const [movedImage] = sourceTracklet.images.splice(source.index, 1);
      destTracklet.images.splice(destination.index, 0, movedImage);
    }

    onTrackletUpdate(newTracklets);
    setSelectedImages(new Set());
  };

  const toggleTrackletCollapse = (trackletId: string) => {
    const newCollapsed = new Set(collapsedTracklets);
    if (newCollapsed.has(trackletId)) {
      newCollapsed.delete(trackletId);
    } else {
      newCollapsed.add(trackletId);
    }
    setCollapsedTracklets(newCollapsed);
  };

  const handleMergeTracklet = (sourceTrackletId: string, targetTrackletId: string) => {
    const newTracklets = tracklets.map(tracklet => {
      if (tracklet.tracklet_id === targetTrackletId) {
        const sourceTracklet = tracklets.find(t => t.tracklet_id === sourceTrackletId);
        return {
          ...tracklet,
          images: [...tracklet.images, ...(sourceTracklet?.images || [])]
        };
      }
      return tracklet;
    }).filter(tracklet => tracklet.tracklet_id !== sourceTrackletId);

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
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto"
                        onClick={() => toggleTrackletCollapse(tracklet.tracklet_id)}
                      >
                        {collapsedTracklets.has(tracklet.tracklet_id) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronUp className="h-4 w-4" />
                        }
                      </Button>
                      <span>Tracklet {tracklet.tracklet_id}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({tracklet.images.length} shapes)
                      </span>
                    </CardTitle>
                    <div className="flex gap-2">
                      {tracklets.length > 1 && (
                        <select
                          className="text-sm bg-background border rounded-md px-2 py-1"
                          onChange={(e) => {
                            if (e.target.value) {
                              handleMergeTracklet(tracklet.tracklet_id, e.target.value);
                            }
                          }}
                          value=""
                        >
                          <option value="">Merge into...</option>
                          {tracklets
                            .filter(t => t.tracklet_id !== tracklet.tracklet_id)
                            .map(t => (
                              <option key={t.tracklet_id} value={t.tracklet_id}>
                                Tracklet {t.tracklet_id}
                              </option>
                            ))
                          }
                        </select>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {!collapsedTracklets.has(tracklet.tracklet_id) && (
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
                              onClick={(e) => toggleImageSelection(image.path, e)}
                              className={`relative group cursor-pointer ${
                                snapshot.isDragging ? 'opacity-50' : ''
                              } ${
                                selectedImages.has(image.path) ? 
                                'ring-2 ring-primary' : ''
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
                )}
              </Card>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default TrackletManager;