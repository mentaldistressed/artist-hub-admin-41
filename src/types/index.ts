export interface User {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "artist";
  avatar?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  role: 'artist' | 'admin';
  pseudonym?: string;
  telegram_contact?: string;
  name?: string;
  balance_rub: number;
  created_at: string;
  updated_at: string;
}