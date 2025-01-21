import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTrackletStore } from '@/stores/useTrackletStore';
import ImageZoomPreview, { useZoomToggle } from './ImageZoomPreview';
import { Tracklet, TrackletImage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTrackletMerger, TrackletMergeOverlay } from './TrackletMerger';
import { useToast } from '@/hooks/use-toast';

interface ProgressiveTrackletManagerProps {
  uploadedImages: Map<string, File>;
}

const IMAGES_PER_VIEW = 2;
const TRACKLETS_PER_PAGE = [12, 24, 36, 48];
const URL_CACHE_LIMIT = 100; // Maximum number of cached URLs

const ProgressiveTrackletManager: React.FC<ProgressiveTrackletManagerProps> = ({ uploadedImages }) => {
  const { tracklets } = useTrackletStore();
  const { toast } = useToast();
  const { toggleTrackletSelection, isTrackletSelected, selectedTracklets } = useTrackletMerger();
  const [currentPage, setCurrentPage] = useState(1);
  const [trackletsPerPage, setTrackletsPerPage] = useState(TRACKLETS_PER_PAGE[0]);
  const [imageIndices, setImageIndices] = useState<Map<string, number>>(new Map());
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [urlCache, setUrlCache] = useState<Map<string, { url: string, lastAccessed: number }>>(new Map());
  const isZoomEnabled = useZoomToggle();

  const totalPages = Math.ceil(tracklets.length / trackletsPerPage);
  const startIndex = (currentPage - 1) * trackletsPerPage;
  const visibleTracklets = useMemo(() => 
    tracklets.slice(startIndex, startIndex + trackletsPerPage),
    [tracklets, startIndex, trackletsPerPage]
  );

  // URL Cache Management
  const cleanUrlCache = useCallback(() => {
    if (urlCache.size > URL_CACHE_LIMIT) {
      const entries = Array.from(urlCache.entries());
      entries.sort((a, b) => b[1].lastAccessed - a[1].lastAccessed);
      
      const toRemove = entries.slice(URL_CACHE_LIMIT);
      const newCache = new Map(entries.slice(0, URL_CACHE_LIMIT));
      
      toRemove.forEach(([_, { url }]) => {
        URL.revokeObjectURL(url);
      });
      
      setUrlCache(newCache);
    }
  }, [urlCache]);

  const getImageUrl = useCallback((imageName: string) => {
    if (!uploadedImages.has(imageName)) return null;
    
    const cached = urlCache.get(imageName);
    if (cached) {
      if (Date.now() - cached.lastAccessed > 5000) {  // Update timestamp every 5 seconds
        setTimeout(() => {
          setUrlCache(prev => new Map(prev).set(imageName, {
            ...cached,
            lastAccessed: Date.now()
          }));
        }, 0);
      }
      return cached.url;
    }
    
    const url = URL.createObjectURL(uploadedImages.get(imageName)!);
    setTimeout(() => {
      setUrlCache(prev => {
        if (prev.has(imageName)) return prev;
        const next = new Map(prev).set(imageName, {
          url,
          lastAccessed: Date.now()
        });
        if (next.size > URL_CACHE_LIMIT) {
          cleanUrlCache();
        }
        return next;
      });
    }, 0);
    
    return url;
  }, [uploadedImages, urlCache, cleanUrlCache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      urlCache.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleNext = (trackletId: string, maxIndex: number) => {
    setImageIndices(prev => {
      const currentIndex = prev.get(trackletId) || 0;
      const nextIndex = currentIndex + IMAGES_PER_VIEW;
      return new Map(prev).set(trackletId, nextIndex >= maxIndex ? 0 : nextIndex);
    });
  };

  const handlePrevious = (trackletId: string, maxIndex: number) => {
    setImageIndices(prev => {
      const currentIndex = prev.get(trackletId) || 0;
      const prevIndex = currentIndex - IMAGES_PER_VIEW;
      return new Map(prev).set(trackletId, prevIndex < 0 ? Math.max(0, maxIndex - IMAGES_PER_VIEW) : prevIndex);
    });
  };

  const handlePageChange = useCallback((newPage: number) => {
    const oldStartIndex = (currentPage - 1) * trackletsPerPage;
    const oldVisibleTracklets = tracklets.slice(oldStartIndex, oldStartIndex + trackletsPerPage);
    const currentlyVisibleImages = new Set(oldVisibleTracklets.flatMap(t => 
      t.images
        .slice(imageIndices.get(t.tracklet_id) || 0, (imageIndices.get(t.tracklet_id) || 0) + IMAGES_PER_VIEW)
        .map(img => img.name)
    ));
    
    // Clean up URLs that aren't currently visible and aren't recently accessed
    const threshold = Date.now() - 30000; // 30 seconds
    urlCache.forEach(({ url, lastAccessed }, imageName) => {
      if (!currentlyVisibleImages.has(imageName) && lastAccessed < threshold) {
        URL.revokeObjectURL(url);
        setUrlCache(prev => {
          const next = new Map(prev);
          next.delete(imageName);
          return next;
        });
      }
    });

    setCurrentPage(newPage);
  }, [currentPage, trackletsPerPage, tracklets, imageIndices, urlCache]);

  const renderTracklet = useCallback((tracklet: Tracklet) => {
    const startIndex = imageIndices.get(tracklet.tracklet_id) || 0;
    const visibleImages = tracklet.images.slice(startIndex, startIndex + IMAGES_PER_VIEW);
    const hasNext = tracklet.images.length > IMAGES_PER_VIEW;
    const hasPrevious = startIndex > 0;

    return (
      <TrackletMergeOverlay
        key={tracklet.tracklet_id}
        isSelected={isTrackletSelected(tracklet.tracklet_id)}
        onClick={(e) => toggleTrackletSelection(tracklet.tracklet_id, e)}
      >
        <div className="border rounded-lg p-2 bg-background">
          <div className="mb-2">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">Tracklet {tracklet.tracklet_id}</span>
              <span className="text-xs text-muted-foreground">
                ({startIndex + 1}-{Math.min(startIndex + IMAGES_PER_VIEW, tracklet.images.length)}/{tracklet.images.length})
              </span>
            </div>
          </div>
          <div className="relative group">
            <div className="flex items-center justify-center gap-1">
              {visibleImages.map((image: TrackletImage) => {
                const imageUrl = getImageUrl(image.name);
                return (
                  <div
                    key={image.name}
                    onMouseEnter={() => setHoveredImage(image.name)}
                    onMouseLeave={() => setHoveredImage(null)}
                    onMouseMove={(e: React.MouseEvent) => {
                      setHoverPosition({
                        x: e.clientX,
                        y: e.clientY
                      });
                    }}
                    className="relative w-24 h-24"
                  >
                    <div className="border rounded-md overflow-hidden w-full h-full">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={image.name}
                          className="w-full h-full object-contain bg-background"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-0.5 hidden group-hover:block">
                      {image.name}
                    </div>
                  </div>
                );
              })}
            </div>

            {hasPrevious && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 absolute -left-4 top-1/2 -translate-y-1/2 rounded-full bg-background opacity-70 hover:opacity-100 group-hover:block hidden"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious(tracklet.tracklet_id, tracklet.images.length);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            
            {hasNext && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 absolute -right-4 top-1/2 -translate-y-1/2 rounded-full bg-background opacity-70 hover:opacity-100 group-hover:block hidden"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext(tracklet.tracklet_id, tracklet.images.length);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </TrackletMergeOverlay>
    );
  }, [getImageUrl, handleNext, handlePrevious, imageIndices, isTrackletSelected, toggleTrackletSelection]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Tracklets per page:</span>
            <Select
              value={trackletsPerPage.toString()}
              onValueChange={(value) => {
                setTrackletsPerPage(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRACKLETS_PER_PAGE.map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedTracklets.size > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedTracklets.size} tracklet{selectedTracklets.size > 1 ? 's' : ''} selected (Press 'M' to merge)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {visibleTracklets.map(renderTracklet)}
      </div>

      <ImageZoomPreview
        imageName={hoveredImage}
        imageUrl={hoveredImage ? getImageUrl(hoveredImage) : null}
        position={hoverPosition}
        enabled={isZoomEnabled}
      />
    </div>
  );
};

export default ProgressiveTrackletManager;