export interface TrackletImage {
  name: string;
}

export interface Tracklet {
  tracklet_id: string;
  tracklet_alias?: string;
  images: TrackletImage[];
}