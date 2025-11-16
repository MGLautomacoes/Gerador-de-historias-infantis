export type UserStatus = 'active' | 'inactive' | 'pending';
export type UserRole = 'tenant' | 'superadmin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string | null;
  ddi?: string | null;
}

export interface Scene {
  id: number;
  dialogo: string;
  prompt_imagem: string;
  prompt_diretor: string;
  imageUrl?: string;
  isGenerating?: boolean;
  videoUrl?: string;
  isAnimating?: boolean;
}

export interface YouTubeThumbnail {
  prompt_16_9: string;
  prompt_9_16: string;
  descricao_youtube: string;
  imageUrl_16_9?: string;
  imageUrl_9_16?: string;
  isGenerating_16_9?: boolean;
  isGenerating_9_16?: boolean;
}

export interface ProductionPlan {
  titulo: string;
  youtube_thumbnail?: YouTubeThumbnail;
  cenas: Scene[];
}

export interface CharacterLibrary {
  [key: string]: string;
}

export interface NewCharacterPayload {
    name: string;
    description: string;
    imageUrl: string;
}

// Types for N8N Webhook Integration
export type WebhookEvent = 'user.created' | 'user.invited' | 'user.activated' | 'user.deactivated';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  user: Partial<User>; // Not all user fields might be available for all events
}