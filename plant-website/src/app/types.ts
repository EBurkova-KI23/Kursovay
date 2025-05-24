// src/app/types.ts
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}
export interface CreatePlantDto {
  name: string;
  category_id: string; 
  description?: string;
  image?: string;
  care_info?: string;
  lighting?: string;
  watering?: string;
  temperature?: string;
  zona?: string;
  tolerance?: string;
  soil?: string;
  durability?: string;
  growth_info?: string;
}

export interface Plant {
  id: number;
  name: string;
  category_id: string;
  description?: string;
  image?: string;
  care_info?: string;
  lighting?: string;
  watering?: string;
  temperature?: string;
  zona?: string;
  tolerance?: string;
  soil?: string;
  durability?: string;
  growth_info?: string;
}

export interface SearchResponse {
  plants: Plant[];
  total: number;
}

export interface ErrorLog {
  id?: number;
  message: string;
  timestamp?: string;
  url?: string;
  status?: number;
}
