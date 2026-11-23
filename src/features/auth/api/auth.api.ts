import type { Session, SessionUser } from '@/core/auth/session';
import { http } from '@/core/http/http-client';

export interface Credentials {
  email: string;
  password: string;
}

export interface Registration extends Credentials {
  nombre: string;
}

interface SessionResponse {
  access_token: string;
  refresh_token: string;
  usuario: SessionUser;
}

const toSession = ({ access_token, refresh_token, usuario }: SessionResponse): Session => ({
  token: access_token,
  refreshToken: refresh_token,
  user: usuario,
});

export const authApi = {
  register: (registration: Registration) =>
    http.post<SessionUser>('/auth/register', registration, { authenticated: false }),

  login: async (credentials: Credentials): Promise<Session> =>
    toSession(
      await http.post<SessionResponse>('/auth/login', credentials, { authenticated: false }),
    ),

  refresh: async (refreshToken: string): Promise<Session> =>
    toSession(
      await http.post<SessionResponse>(
        '/auth/refresh',
        { refresh_token: refreshToken },
        { authenticated: false },
      ),
    ),

  logout: (refreshToken: string) =>
    http.post<void>('/auth/logout', { refresh_token: refreshToken }, { authenticated: false }),
};
