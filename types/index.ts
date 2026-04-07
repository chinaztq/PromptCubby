export interface Category {
  id: number;
  name: string;
  emoji: string;
  icon: string;
  sort_order: number;
  created_at: string;
  prompt_count?: number;
}

export interface Platform {
  id: number;
  name: string;
  slug: string;
  delivery_method: 'url_scheme' | 'clipboard';
  url_template?: string;
  color: string;
  bg_color: string;
}

export interface Variable {
  id: number;
  prompt_id: number;
  name: string;
  hint: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date';
  options?: string; // JSON string for select/radio/checkbox options
  default_value?: string;
  required: boolean;
  sort_order: number;
}

export interface Prompt {
  id: number;
  title: string;
  description: string;
  content: string;
  category_id: number;
  category_name?: string;
  category_emoji?: string;
  category_icon?: string;
  created_at: string;
  updated_at: string;
  platforms?: Platform[];
  variables?: Variable[];
  variable_count?: number;
}

export interface PromptWithDetails extends Prompt {
  platforms: Platform[];
  variables: Variable[];
}

export interface CreatePromptInput {
  title: string;
  description?: string;
  content: string;
  category_id: number;
  platform_ids: number[];
  variables: Omit<Variable, 'id' | 'prompt_id'>[];
}

export interface UpdatePromptInput extends CreatePromptInput {
  id: number;
}
