/**
 * Sample video clips for real-time testing of 60 FPS playback,
 * Skia GPU shader filters, and aspect ratio transformations.
 */

export interface SampleMediaItem {
  id: string;
  title: string;
  tag: string;
  duration: number;
  videoUrl: string;
  posterUrl: string;
  recommendedFilter: 'NORMAL' | 'NEON_GLOW' | 'GRAYSCALE' | 'SEPIA';
  description: string;
}

export const SAMPLE_MEDIA_LIST: SampleMediaItem[] = [
  {
    id: 'cyberpunk-city',
    title: 'Cyberpunk Neon Streets',
    tag: 'Neon High-Contrast',
    duration: 15.0,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80',
    recommendedFilter: 'NEON_GLOW',
    description: 'High-speed cinematic lights, ideal for Skia Neon Glow chromatic bloom and SkSL shader testing.'
  },
  {
    id: 'skate-action',
    title: 'Extreme Skate Park 60FPS',
    tag: 'Fast Action Motion',
    duration: 12.0,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1520045884218-a66e13385802?auto=format&fit=crop&w=600&q=80',
    recommendedFilter: 'NORMAL',
    description: 'Rapid movement and air flips; ideal for testing 60 FPS hardware playback and 0.5x slow-mo speed curve.'
  },
  {
    id: 'coastal-sunset',
    title: 'Golden Sunset Coastline',
    tag: 'Warm Vintage Landscape',
    duration: 14.0,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    recommendedFilter: 'SEPIA',
    description: 'Lush dynamic lighting, perfect for testing Sepia tone matrix and luminance transforms.'
  },
  {
    id: 'abstract-motion',
    title: 'Sci-Fi Abstract Geometry',
    tag: 'Monochrome Tech',
    duration: 10.0,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
    recommendedFilter: 'GRAYSCALE',
    description: 'Clean geometry and contrast lines, optimal for Grayscale color grading and subtitle overlay alignment.'
  }
];
