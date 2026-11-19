import type { Session, SessionUser } from '@/core/auth/session';
import { http } from '@/core/http/http-client';

export interface Credentials {
  email: string;
  password: string;
}

export interface Registration extends Credentials {
  nombre: string;
}

interface LoginResponse {
  access_token: string;
  usuario: SessionUser;
}

export const authApi = {
  register: (registration: Registration) =>
    http.post<SessionUser>('/auth/register', registration, { authenticated: false }),

  login: async (credentials: Credentials): Promise<Session> => {
    const { access_token, usuario } = await http.post<LoginResponse>('/auth/login', credentials, {
      authenticated: false,
    });
    return { token: access_token, user: usuario };
  },
};
