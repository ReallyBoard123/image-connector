'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Tracklet, TrackletImage } from '@/lib/types';
import ImageZoomPreview, { useZoomToggle } from './ImageZoomPreview';


interface TrackletManagerProps {
  tracklets: Tracklet[];
  onTrackletUpdate: (updatedTracklets: Tracklet[]) => void;
  uploadedImages: Map<string, File>;
}

export const TrackletManager: React.FC<TrackletManagerProps> = ({
  tracklets,
  onTrackletUpdate,
  uploadedImages
}) => {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [collapsedTracklets, setCollapsedTracklets] = useState<Set<string>>(new Set());
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const isZoomEnabled = useZoomToggle();

  const handleMouseMove = (event: React.MouseEvent) => {
    setHoverPosition({
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleMouseEnter = (imageName: string) => {
    setHoveredImage(imageName);
  };

  const handleMouseLeave = () => {
    setHoveredImage(null);
  };

  const toggleImageSelection = (imageName: string, event: React.MouseEvent) => {
    const newSelection = new Set(selectedImages);
    if (event.ctrlKey || event.metaKey) {
      if (newSelection.has(imageName)) {
        newSelection.delete(imageName);
      } else {
        newSelection.add(imageName);
      }
    } else if (event.shiftKey && selectedImages.size > 0) {
      const lastSelected = Array.from(selectedImages)[selectedImages.size - 1];
      const [trackletId, startIndex] = findImagePosition(lastSelected);
      const [currentTrackletId, currentIndex] = findImagePosition(imageName);
      
      if (trackletId === currentTrackletId) {
        const tracklet = tracklets.find(t => t.tracklet_id === trackletId);
        if (tracklet) {
          const start = Math.min(startIndex, currentIndex);
          const end = Math.max(startIndex, currentIndex);
          tracklet.images.slice(start, end + 1).forEach(img => {
            newSelection.add(img.name);
          });
        }
      }
    } else {
      newSelection.clear();
      newSelection.add(imageName);
    }
    setSelectedImages(newSelection);
  };

  const findImagePosition = (imageName: string): [string, number] => {
    for (const tracklet of tracklets) {
      const index = tracklet.images.findIndex(img => img.name === imageName);
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

    if (selectedImages.has(result.draggableId)) {
      const selectedNames = Array.from(selectedImages);
      const movedImages: TrackletImage[] = [];
      
      newTracklets.forEach(tracklet => {
        const imagesToKeep: TrackletImage[] = [];
        const imagesToMove: TrackletImage[] = [];
        
        tracklet.images.forEach(image => {
          if (selectedNames.includes(image.name)) {
            imagesToMove.push(image);
          } else {
            imagesToKeep.push(image);
          }
        });
        
        tracklet.images = imagesToKeep;
        movedImages.push(...imagesToMove);
      });

      destTracklet.images.splice(destination.index, 0, ...movedImages);
    } else {
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
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-4">
          {tracklets.map((tracklet, trackletIndex) => (
            <Droppable key={tracklet.tracklet_id} droppableId={trackletIndex.toString()}>
              {(provided, snapshot) => (
                <Card 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="w-full"
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
                          ({tracklet.images.length} images)
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
                      <div className="flex flex-wrap gap-2">
                        {tracklet.images.map((image, index) => (
                          <Draggable
                            key={image.name}
                            draggableId={image.name}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={(e) => toggleImageSelection(image.name, e)}
                                onMouseEnter={() => handleMouseEnter(image.name)}
                                onMouseLeave={handleMouseLeave}
                                onMouseMove={handleMouseMove}
                                className={`relative group cursor-pointer ${
                                  snapshot.isDragging ? 'opacity-50' : ''
                                } ${
                                  selectedImages.has(image.name) ? 
                                  'ring-2 ring-primary' : ''
                                }`}
                              >
                                <div className="w-24 h-24 bg-muted rounded-md overflow-hidden transition-colors hover:bg-muted/80">
                                  {uploadedImages.has(image.name) && (
                                    <img 
                                      src={URL.createObjectURL(uploadedImages.get(image.name)!)}
                                      alt={image.name}
                                      className="w-full h-full object-contain"
                                    />
                                  )}
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

      <ImageZoomPreview
        imageName={hoveredImage}
        imageUrl={hoveredImage && uploadedImages.has(hoveredImage) ? 
          URL.createObjectURL(uploadedImages.get(hoveredImage)!) : null}
        position={hoverPosition}
        enabled={isZoomEnabled}
      />
    </>
  );
};

export default TrackletManager;