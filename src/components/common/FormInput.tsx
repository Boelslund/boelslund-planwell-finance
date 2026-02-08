import { ErrorMessage } from './ErrorMessage';

interface FormInputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  required?: boolean;
}

/**
 * Reusable form input component with label, input, and error display
 */
export function FormInput({
  id,
  label,
  type,
  value,
  onChange,
  error,
  autoComplete,
  autoFocus,
  required = true,
}: FormInputProps) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required={required}
        aria-required={required}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? true : undefined}
      />
      {error && <ErrorMessage id={`${id}-error`}>{error}</ErrorMessage>}
    </>
  );
}
