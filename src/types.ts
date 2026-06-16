export interface Artwork {
  title: string;
  series: string;
  chain: string;
  platform: string;
  thumb: string;
  image: string;
  lore: string;
  collectUrl: string;
  mediaType?: 'image' | 'video';
}

export interface Platform {
  name: string;
  tagline: string;
  url: string;
  icon: string;
}

export interface Chain {
  name: string;
  url: string;
  icon: string;
}

export interface Collection {
  title: string;
  tagline: string;
  image: string;
  url: string;
  mediaType?: 'image' | 'video';
  isEmpty?: boolean;
}

export interface Event {
  id: string;
  slug: string;
  display_name: string;
  cover_image_url: string | null;
  google_drive_folder_id: string | null;
  auto_approve_photos: boolean;
  sync_interval_minutes: number;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  event_id: string;
  image_url: string;
  thumbnail_url: string | null;
  original_filename: string;
  is_visible: boolean;
  taken_at: string | null;
  created_at: string;
  google_drive_file_id: string | null;
}
