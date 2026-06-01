import { ChangeEvent } from 'react';
import { ErrorMessage } from './ErrorMessage';

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local';

interface BaseFormInputProps {
  id: string;
  label: string;
  error?: string;
  autoFocus?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

interface TextInputProps extends BaseFormInputProps {
  type: InputType;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

interface TextareaProps extends BaseFormInputProps {
  type: 'textarea';
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  cols?: number;
}

interface SelectProps extends BaseFormInputProps {
  type: 'select';
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

interface CheckboxProps extends BaseFormInputProps {
  type: 'checkbox';
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

interface RadioProps extends BaseFormInputProps {
  type: 'radio';
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  value: string;
  name: string;
}

type FormInputProps = TextInputProps | TextareaProps | SelectProps | CheckboxProps | RadioProps;

/**
 * Reusable form input component with label, input, and error display
 * Supports text inputs, textarea, select dropdowns, checkboxes, and radio buttons
 */
export function FormInput(props: FormInputProps) {
  const {
    id,
    label,
    error,
    autoFocus,
    required = true,
    disabled = false,
    className = '',
  } = props;

  const ariaLabel = 'aria-label' in props ? props['aria-label'] : undefined;

  const commonProps = {
    id,
    autoFocus,
    required,
    disabled,
    className,
    'aria-required': required,
    'aria-describedby': error ? `${id}-error` : undefined,
    'aria-invalid': error ? true : undefined,
    'aria-label': ariaLabel,
  };

  const renderInput = () => {
    switch (props.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            placeholder={props.placeholder}
            value={props.value}
            onChange={props.onChange}
            rows={props.rows}
            cols={props.cols}
          />
        );

      case 'select':
        return (
          <select
            {...commonProps}
            value={props.value}
            onChange={props.onChange}
          >
            {props.placeholder && (
              <option value="" disabled>
                {props.placeholder}
              </option>
            )}
            {props.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <input
            {...commonProps}
            type="checkbox"
            checked={props.checked}
            onChange={props.onChange}
            value={props.value}
          />
        );

      case 'radio':
        return (
          <input
            {...commonProps}
            type="radio"
            checked={props.checked}
            onChange={props.onChange}
            value={props.value}
            name={props.name}
          />
        );

      default:
        return (
          <input
            {...commonProps}
            type={props.type}
            placeholder={props.placeholder}
            value={props.value}
            onChange={props.onChange}
            autoComplete={props.autoComplete}
            min={props.min}
            max={props.max}
            step={props.step}
          />
        );
    }
  };

  // For checkbox and radio, use inline label layout
  const isInlineLabel = props.type === 'checkbox' || props.type === 'radio';

  return (
    <>
      {isInlineLabel ? (
        <div className={`inline-label-wrapper ${className}`}>
          {renderInput()}
          <label htmlFor={id}>{label}</label>
        </div>
      ) : (
        <>
          <label htmlFor={id}>{label}</label>
          {renderInput()}
        </>
      )}
      {error && <ErrorMessage id={`${id}-error`}>{error}</ErrorMessage>}
    </>
  );
}
