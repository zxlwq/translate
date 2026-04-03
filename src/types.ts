export type Direction = 'zh-to-en' | 'en-to-zh';
export type ProviderId = 'gemini' | 'ark' | 'qwen' | 'nvidia' | 'kilo' | 'offline';
export type TranslateMode = 'all' | 'values-only';

export interface SavedPrompt {
  id: number;
  source_text: string;
  target_text: string;
  model: string;
  provider: string;
  created_at: string;
}

export interface ModelOption {
  id: string;
  name: string;
}

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  models: ModelOption[];
  endpoint?: string;
  envKey: string;
}

export interface Template {
  title: string;
  content: string;
}
