import { create } from 'zustand';
import { Tracklet } from '@/lib/types';

interface ImageMapping {
  originalTrackletId: string;
  imageName: string;
}

export interface TrackletChange {
  id: string;
  timestamp: number;
  type: 'MOVE' | 'MERGE' | 'CREATE' | 'INITIAL_LOAD' | 'UPDATE_ALIAS';
  description: string;
  sourceTrackletId?: string;
  destinationTrackletId?: string;
  movedImages: string[];
  previousState: Tracklet[];
  currentState: Tracklet[];
}

interface TrackletState {
  tracklets: Tracklet[];
  changes: TrackletChange[];
  initialized: boolean;
  imageOriginsMap: Map<string, ImageMapping>;
  setTracklets: (tracklets: Tracklet[]) => void;
  moveImages: (params: {
    sourceTrackletId: string;
    destinationTrackletId: string;
    imageNames: string[];
    destinationIndex: number;
  }) => void;
  mergeTracklets: (sourceTrackletId: string, destinationTrackletId: string) => void;
  createTracklet: (newTracklet: Tracklet) => void;
  setTrackletAlias: (trackletId: string, alias: string) => void;
  addChange: (change: Omit<TrackletChange, 'id' | 'timestamp'>) => void;
  undoChange: (changeId: string) => void;
  clearChanges: () => void;
}

export const useTrackletStore = create<TrackletState>((set, get) => ({
  tracklets: [],
  changes: [],
  initialized: false,
  imageOriginsMap: new Map(),

  setTracklets: (tracklets) => {
    const { initialized } = get();
    const imageMap = new Map<string, ImageMapping>();
    
    tracklets.forEach(tracklet => {
      tracklet.images.forEach(img => {
        const [originalTrackletId, imageName] = img.name.split('_');
        imageMap.set(img.name, { originalTrackletId, imageName });
      });
    });

    set({ tracklets, imageOriginsMap: imageMap });
    
    if (!initialized) {
      const change: Omit<TrackletChange, 'id' | 'timestamp'> = {
        type: 'INITIAL_LOAD',
        description: 'Initial tracklets loaded',
        movedImages: [],
        previousState: [],
        currentState: tracklets
      };
      get().addChange(change);
      set({ initialized: true });
    }
  },

  moveImages: ({ sourceTrackletId, destinationTrackletId, imageNames, destinationIndex }) => {
    const state = get();
    const previousState = JSON.parse(JSON.stringify(state.tracklets));
    const newTracklets = [...state.tracklets];

    const movedImages: string[] = [];
    newTracklets.forEach(tracklet => {
      if (imageNames.length > 0) {
        tracklet.images = tracklet.images.filter(img => {
          if (imageNames.includes(img.name)) {
            movedImages.push(img.name);
            return false;
          }
          return true;
        });
      }
    });

    const destTracklet = newTracklets.find(t => t.tracklet_id === destinationTrackletId);
    if (destTracklet) {
      const imagesToAdd = movedImages.map(name => ({ name }));
      destTracklet.images.splice(destinationIndex, 0, ...imagesToAdd);
    }

    const description = `Moved ${movedImages.length} image${movedImages.length > 1 ? 's' : ''} from Tracklet ${sourceTrackletId} to Tracklet ${destinationTrackletId}`;

    state.addChange({
      type: 'MOVE',
      description,
      sourceTrackletId,
      destinationTrackletId,
      movedImages,
      previousState,
      currentState: newTracklets
    });

    set({ tracklets: newTracklets });
  },

  mergeTracklets: (sourceTrackletId, destinationTrackletId) => {
    const state = get();
    const previousState = JSON.parse(JSON.stringify(state.tracklets));
    const newTracklets = state.tracklets.map(tracklet => {
      if (tracklet.tracklet_id === destinationTrackletId) {
        const sourceTracklet = state.tracklets.find(t => t.tracklet_id === sourceTrackletId);
        return {
          ...tracklet,
          images: [...tracklet.images, ...(sourceTracklet?.images || [])]
        };
      }
      return tracklet;
    }).filter(tracklet => tracklet.tracklet_id !== sourceTrackletId);

    const change: Omit<TrackletChange, 'id' | 'timestamp'> = {
      type: 'MERGE',
      description: `Merged Tracklet ${sourceTrackletId} into Tracklet ${destinationTrackletId}`,
      sourceTrackletId,
      destinationTrackletId,
      movedImages: [],
      previousState,
      currentState: newTracklets
    };

    state.addChange(change);
    set({ tracklets: newTracklets });
  },

  createTracklet: (newTracklet) => {
    const state = get();
    const previousState = JSON.parse(JSON.stringify(state.tracklets));
    const newTracklets = [...state.tracklets, newTracklet];

    const change: Omit<TrackletChange, 'id' | 'timestamp'> = {
      type: 'CREATE',
      description: `Created new tracklet ${newTracklet.tracklet_id}`,
      movedImages: [],
      previousState,
      currentState: newTracklets
    };

    state.addChange(change);
    set({ tracklets: newTracklets });
  },

  setTrackletAlias: (trackletId, alias) => {
    const state = get();
    const previousState = JSON.parse(JSON.stringify(state.tracklets));
    const newTracklets = state.tracklets.map(tracklet => {
      if (tracklet.tracklet_id === trackletId) {
        return { ...tracklet, tracklet_alias: alias };
      }
      return tracklet;
    });

    const change: Omit<TrackletChange, 'id' | 'timestamp'> = {
      type: 'UPDATE_ALIAS',
      description: `Updated alias for Tracklet ${trackletId} to "${alias}"`,
      sourceTrackletId: trackletId,
      movedImages: [],
      previousState,
      currentState: newTracklets
    };

    state.addChange(change);
    set({ tracklets: newTracklets });
  },

  addChange: (change) => {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    set((state) => ({
      changes: [...state.changes, { ...change, id, timestamp }]
    }));
  },

  undoChange: (changeId) => {
    set((state) => {
      const changeIndex = state.changes.findIndex(c => c.id === changeId);
      if (changeIndex === -1) return state;

      const change = state.changes[changeIndex];
      return {
        tracklets: change.previousState,
        changes: state.changes.slice(0, changeIndex)
      };
    });
  },

  clearChanges: () => set({ changes: [] })
}));