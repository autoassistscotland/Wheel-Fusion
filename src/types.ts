export interface Claim {
  id: string;
  userId: string;
  type: 'accident' | 'overcharge' | 'misconduct' | 'cancellation';
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  details: string;
  location: string;
  createdAt: string;
  updatedAt?: string;
}

export interface KBArticle {
  id: string;
  category: string;
  title: string;
  keywords: string[];
  content: string;
  summary: string;
  lastUpdated: string;
  priority: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'user' | 'admin';
  createdAt: string;
}
