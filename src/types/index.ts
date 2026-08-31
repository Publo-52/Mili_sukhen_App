export type SectionType = 'home' | 'projects' | 'turtle' | 'memories' | 'love-notes';

export type ProjectCategory = 
  | 'Websites' 
  | 'Python Turtle' 
  | 'Creative Projects' 
  | 'Special Projects' 
  | 'Interactive Experiences';

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  detailedStory?: string;
  category: ProjectCategory;
  url: string;
  githubUrl?: string;
  thumbnail: string;
  screenshots?: string[];
  technologies: string[];
  createdAt: string;
  featured: boolean;
  order: number;
  tags?: string[];
  iframeSupported?: boolean;
  themeGradient?: string;
  themeGlow?: string;
  themeAccent?: string;
  themeBadge?: string;
  themeBorder?: string;
  themeTextAccent?: string;
}

export interface TurtleCreation {
  id: string;
  title: string;
  slug: string;
  description: string;
  artworkImage: string;
  pythonScript: string;
  createdAt: string;
  category: string;
  inspiration: string;
  tags: string[];
  featured: boolean;
  canvasDrawingType?: 'heart' | 'rose' | 'galaxy' | 'tree' | 'mandala' | 'spiral' | 'love-app' | 'teddy' | 'rose-day' | 'opencv-sketch';
}

export interface MemoryMilestone {
  id: string;
  year: string;
  date: string;
  title: string;
  description: string;
  emotionalNote: string;
  image?: string;
  projectLink?: string;
  projectTitle?: string;
  badge?: string;
  location?: string;
}

export interface LoveNote {
  id: string;
  title: string;
  snippet: string;
  fullMessage: string;
  date: string;
  moodTag: 'gentle' | 'deep' | 'poetic' | 'playful' | 'promise' | 'future' | string;
  isFavorite?: boolean;
}

export interface DirectMessage {
  id: string;
  sender: string;
  senderRole?: 'mili' | 'sukhen';
  senderPhone?: string;
  message: string;
  mood?: string;
  createdAt: string;
  read: boolean;
  reply?: string;
  replyToId?: string;
  replyToText?: string;
  reaction?: string;
  isVoiceNote?: boolean;
  voiceDuration?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'sticker' | 'voice';
}

export interface AppConfig {
  appName: string;
  recipientName: string;
  creatorName: string;
  anniversaryDate: string; // ISO format or YYYY-MM-DD
  contactVisibility: 'PUBLIC' | 'PRIVATE';
  adminPasscode: string;
  surprisePasscode: string;
  contactPasscode: string;
  socials: {
    creatorPhone?: string;
    creatorEmail?: string;
    creatorWhatsapp?: string;
    recipientPhone?: string;
    recipientEmail?: string;
    recipientWhatsapp?: string;
  };
}
