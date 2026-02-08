import { useState } from 'react';

export interface UseAuthFormOptions {
  initialValues: Record<string, string>;
  onSubmit: () => Promise<void>;
}

export interface AuthFormState {
  values: Record<string, string>;
  errors: Record<string, string>;
  loading: boolean;
  authError: string;
}

/**
 * Custom hook for managing auth form state and validation
 */
export function useAuthForm({ initialValues, onSubmit }: UseAuthFormOptions) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const setValue = (field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const setError = (field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const resetErrors = () => {
    setErrors({});
    setAuthError("");
  };

  const validateRequired = (field: string, message: string): boolean => {
    if (!values[field] || !values[field].trim()) {
      setError(field, message);
      return false;
    }
    return true;
  };

  const validatePasswordMatch = (passwordField: string, confirmField: string): boolean => {
    if (values[passwordField] !== values[confirmField]) {
      setError(confirmField, "Passwords do not match");
      return false;
    }
    return true;
  };

  const validatePasswordLength = (field: string, minLength: number): boolean => {
    if (values[field] && values[field].length < minLength) {
      setError(field, `Password must be at least ${minLength} characters`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();

    try {
      setLoading(true);
      await onSubmit();
    } catch (error) {
      // Error handling is done in the onSubmit callback
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    values,
    errors,
    loading,
    authError,
    setValue,
    setError,
    setAuthError,
    resetErrors,
    validateRequired,
    validatePasswordMatch,
    validatePasswordLength,
    handleSubmit,
  };
}
