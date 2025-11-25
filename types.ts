export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  base64Data: string;
  mimeType: string;
}

export interface GeneratedCard {
  id: string;
  imageUrl: string;
  timestamp: number;
  prompt: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface GenerationPlan {
  detailedDescription: string;
}

export type AspectRatio = '1:1' | '3:4' | '4:3' | '16:9' | '9:16';

export type ArtStyle = 'Photorealistic' | 'Oil Painting' | 'Cartoonish' | 'Vintage Film';