export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  caption_en?: string;
  caption_bn?: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  file_url: string;
  is_published: boolean;
  created_at: string;
  body?: string;
  type?: string;
  department?: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  image_url: string;
  fee: number;
  duration: string;
  is_active: boolean;
  created_at: string;
}

export interface Teacher {
  id: string;
  name: string;
  designation: string;
  bio: string;
  image_url: string;
  facebook?: string;
  linkedin?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  teacher_id?: string;
  user_email?: string;
  subjects?: string;
  assigned_batches?: string;
}

export interface Gallery {
  id: string;
  title: string;
  image_url: string;
  category: string;
  created_at: string;
}

export interface Branch {
  id: string;
  branch_name: string;
  address: string;
  phone: string;
  map_link: string;
  created_at: string;
  name_en?: string;
  name_bn?: string;
}

export interface Testimonial {
  id: string;
  student_name: string;
  message: string;
  photo_url: string;
  rating: number;
  created_at: string;
}

export interface SuccessStory {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  banner_url: string;
  created_at: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image: string;
  is_published: boolean;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface ContactInfo {
  id: string;
  phone: string;
  email: string;
  address: string;
  facebook?: string;
  youtube?: string;
  whatsapp?: string;
}
