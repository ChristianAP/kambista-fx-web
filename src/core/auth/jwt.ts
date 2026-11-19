interface TokenPayload {
  exp?: number;
}

const decodePayload = (token: string): TokenPayload | null => {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string, now: number = Date.now()): boolean => {
  const expiration = decodePayload(token)?.exp;
  return expiration === undefined || expiration * 1000 <= now;
};
