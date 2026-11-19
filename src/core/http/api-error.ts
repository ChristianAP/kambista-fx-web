export interface FieldError {
  field: string;
  message: string;
}

interface ErrorBody {
  code: string;
  message: string;
  details?: FieldError[];
}

const GENERIC_MESSAGE = 'Ocurrió un error inesperado. Inténtalo de nuevo.';
const NETWORK_MESSAGE =
  'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';

const isErrorBody = (body: unknown): body is ErrorBody =>
  typeof body === 'object' &&
  body !== null &&
  'code' in body &&
  'message' in body &&
  typeof body.message === 'string';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: FieldError[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static network(): ApiError {
    return new ApiError(0, 'NETWORK_ERROR', NETWORK_MESSAGE);
  }

  static fromResponse(status: number, body: unknown): ApiError {
    return isErrorBody(body)
      ? new ApiError(status, body.code, body.message, body.details)
      : new ApiError(status, 'UNKNOWN_ERROR', GENERIC_MESSAGE);
  }
}

export const toErrorMessage = (error: unknown): string => {
  if (!(error instanceof ApiError)) {
    return GENERIC_MESSAGE;
  }

  return error.details.length > 0
    ? error.details.map(({ message }) => message).join('. ')
    : error.message;
};
