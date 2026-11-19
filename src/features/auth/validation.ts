import { all, emailFormat, maxLength, minLength, required } from '@/shared/validation/rules';

export const nameRule = all(
  required('Ingresa tu nombre'),
  minLength(2, 'El nombre debe tener al menos 2 caracteres'),
  maxLength(100, 'El nombre no puede superar los 100 caracteres'),
);

export const emailRule = all(
  required('Ingresa tu correo electrónico'),
  emailFormat('Ingresa un correo electrónico válido'),
);

export const currentPasswordRule = required('Ingresa tu contraseña');

export const newPasswordRule = all(
  required('Crea una contraseña'),
  minLength(8, 'La contraseña debe tener al menos 8 caracteres'),
  maxLength(72, 'La contraseña no puede superar los 72 caracteres'),
);
