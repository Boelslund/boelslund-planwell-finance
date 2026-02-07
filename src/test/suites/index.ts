/**
 * Shared test suites for consistent testing across components
 * 
 * Import individual suites or use this index for all suites:
 * 
 * @example
 * // Import specific suites
 * import { runFormAccessibilityTests } from '../../test/suites/accessibility';
 * 
 * @example
 * // Import all suites
 * import { 
 *   runFormAccessibilityTests,
 *   runFormRenderingTests,
 *   runFormValidationTests
 * } from '../../test/suites';
 */

// Accessibility test suites
export {
  runFormAccessibilityTests,
  runFormErrorAccessibilityTests,
  runKeyboardNavigationTests,
  runLoadingStateAccessibilityTests,
} from './accessibility';

// Rendering test suite
export { runComponentRenderingTests } from './rendering';

// Validation test suite
export { runFormValidationTests } from './validation';

// Submission test suite
export { runSuccessfulSubmissionTests } from './submission';

// Error handling test suite
export { runErrorHandlingTests } from './error-handling';

// User experience test suite
export { runUserExperienceTests } from './user-experience';
