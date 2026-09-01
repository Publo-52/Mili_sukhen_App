import { MemoryItem } from '@/types';

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: "mem-sample-1",
    title: "Our Golden Hour Smile",
    type: "photo",
    url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1200&auto=format&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop",
    date: "Special Moments",
    location: "With Mili",
    description: "Every smile captured in a frame that lasts forever.",
    isFavorite: true,
    aspectRatio: "landscape",
    createdAt: "2025-10-14T00:00:00Z",
  },
  {
    id: "mem-sample-2",
    title: "Starlit Nights & Quiet Conversations",
    type: "photo",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=600&auto=format&fit=crop",
    date: "Stargazing",
    location: "Infinite Sky",
    description: "Under the celestial canopy, talking about our dreams.",
    isFavorite: true,
    aspectRatio: "landscape",
    createdAt: "2025-11-20T00:00:00Z",
  },
];

