import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/core/http/api-error';
import { required } from '@/shared/validation/rules';
import { useForm } from './useForm';

const setup = (submit = vi.fn().mockResolvedValue('ok')) => {
  const form = useForm({
    initialValues: { name: '' },
    rules: { name: required('Falta el nombre') },
    submit,
  });
  return { form, submit };
};

describe('useForm', () => {
  it('hides errors until the field is touched', () => {
    const { form } = setup();

    expect(form.isValid.value).toBe(false);
    expect(form.errors.value.name).toBeUndefined();

    form.touch('name');

    expect(form.errors.value.name).toBe('Falta el nombre');
  });

  it('shows every error and skips the action when the form is invalid', async () => {
    const { form, submit } = setup();

    const result = await form.submit();

    expect(result).toBeUndefined();
    expect(submit).not.toHaveBeenCalled();
    expect(form.errors.value.name).toBe('Falta el nombre');
  });

  it('runs the action with the current values and exposes its result', async () => {
    const { form, submit } = setup();
    form.values.name = 'Juan';

    const pending = form.submit();
    expect(form.isSubmitting.value).toBe(true);

    await expect(pending).resolves.toBe('ok');
    expect(submit).toHaveBeenCalledWith({ name: 'Juan' });
    expect(form.isSubmitting.value).toBe(false);
    expect(form.submitError.value).toBeNull();
  });

  it('exposes the API message when the action fails', async () => {
    const failure = new ApiError(409, 'EMAIL_ALREADY_REGISTERED', 'Correo en uso');
    const { form } = setup(vi.fn().mockRejectedValue(failure));
    form.values.name = 'Juan';

    const result = await form.submit();

    expect(result).toBeUndefined();
    expect(form.submitError.value).toBe('Correo en uso');
    expect(form.isSubmitting.value).toBe(false);
  });

  it('falls back to a generic message for unexpected failures', async () => {
    const { form } = setup(vi.fn().mockRejectedValue(new Error('boom')));
    form.values.name = 'Juan';

    await form.submit();

    expect(form.submitError.value).toBe('Ocurrió un error inesperado. Inténtalo de nuevo.');
  });

  it('restores the initial state on reset', async () => {
    const { form } = setup();
    form.values.name = 'Juan';
    await form.submit();

    form.reset();

    expect(form.values.name).toBe('');
    expect(form.errors.value.name).toBeUndefined();
  });
});
