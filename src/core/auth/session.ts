export type Role = 'user' | 'admin';

export interface SessionUser {
  id: string;
  nombre: string;
  email: string;
  rol: Role;
}

export interface Session {
  token: string;
  user: SessionUser;
}
