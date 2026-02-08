import { ReactNode } from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  children: ReactNode;
  id?: string;
}

/**
 * Reusable error message component with consistent styling
 */
export function ErrorMessage({ children, id }: ErrorMessageProps) {
  return (
    <div id={id} className="error-message">
      {children}
    </div>
  );
}
