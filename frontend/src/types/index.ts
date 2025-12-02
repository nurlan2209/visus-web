export interface ServiceItem {
  icon: string;
  title: string;
  text: string;
  cta?: string;
}

export interface FactItem {
  title: string;
  text: string;
}

export interface Review {
  id: number;
  patientName: string;
  rating: number;
  textRu?: string;
  textKk?: string;
  videoUrl?: string;
  posterUrl?: string;
}

export interface CallbackPayload {
  name: string;
  phone: string;
}

export interface Doctor {
  id: number;
  name: string;
  role: string;
  experienceYears: number;
  descriptionRu?: string;
  descriptionKk?: string;
  photoUrl?: string;
}

export interface ServiceApiItem {
  id: number;
  slug: string;
  titleRu: string;
  titleKk: string;
  shortDescriptionRu?: string;
  shortDescriptionKk?: string;
  fullDescriptionRu?: string;
  fullDescriptionKk?: string;
  isActive: boolean;
}

export interface MediaAsset {
  id: number;
  category: string;
  title?: string;
  description?: string;
  photoUrl?: string;
}
