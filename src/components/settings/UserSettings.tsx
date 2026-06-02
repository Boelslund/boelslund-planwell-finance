import { FormEvent, useState, useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";
import { dateFormatOptions, themeOptions, languageOptions, DEFAULT_USER_SETTINGS, type UserSettings as UserSettingsType } from "../../services/userSettings";
import { ErrorMessage } from "../common/ErrorMessage";
import { FormInput } from "../common/FormInput";
import { Loading } from "../common/Loading";
import { useSettings } from "../../contexts/SettingsContext";
import { useAuth } from "../../contexts/AuthContext";

export function UserSettings() {
  const { user } = useAuth();
  const { settings, loading, error, updateSettings, refreshSettings } = useSettings();

  const [dateFormatInput, setDateFormatInput] = useState(settings?.dateFormat ?? DEFAULT_USER_SETTINGS.dateFormat);
  const [themeInput, setThemeInput] = useState(settings?.theme ?? DEFAULT_USER_SETTINGS.theme);
  const [languageInput, setLanguageInput] = useState(settings?.language ?? DEFAULT_USER_SETTINGS.language);
  const [emailNotificationsInput, setEmailNotificationsInput] = useState(
    settings?.notifications?.email ?? DEFAULT_USER_SETTINGS.notifications.email,
  );
  const [budgetAlertsInput, setBudgetAlertsInput] = useState(
    settings?.notifications?.budgetAlerts ?? DEFAULT_USER_SETTINGS.notifications.budgetAlerts,
  );
  const [monthlySummaryInput, setMonthlySummaryInput] = useState(
    settings?.notifications?.monthlySummary ?? DEFAULT_USER_SETTINGS.notifications.monthlySummary,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Track if we just successfully saved to prevent unnecessary warning
  const justSavedRef = useRef(false);

  // Check if form has unsaved changes
  const hasUnsavedChanges = settings ? (
    dateFormatInput !== settings.dateFormat ||
    themeInput !== settings.theme ||
    languageInput !== settings.language ||
    emailNotificationsInput !== settings.notifications.email ||
    budgetAlertsInput !== settings.notifications.budgetAlerts ||
    monthlySummaryInput !== settings.notifications.monthlySummary
  ) : false;

  // Use a ref to track if settings have been initialized
  const settingsInitializedRef = useRef(false);

  // Block navigation when there are unsaved changes (for in-app routing)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges &&
      !justSavedRef.current &&
      currentLocation.pathname !== nextLocation.pathname
  );

  // Update form state when settings load - only once to avoid cascading renders
  useEffect(() => {
    if (settings && !settingsInitializedRef.current) {
      settingsInitializedRef.current = true;
      // Queue state updates to avoid synchronous setState in effect
      Promise.resolve().then(() => {
        setDateFormatInput(settings.dateFormat);
        setThemeInput(settings.theme);
        setLanguageInput(settings.language);
        setEmailNotificationsInput(settings.notifications.email);
        setBudgetAlertsInput(settings.notifications.budgetAlerts);
        setMonthlySummaryInput(settings.notifications.monthlySummary);
      });
    }
  }, [settings]);

  // Reset the "just saved" flag when user makes changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      justSavedRef.current = false;
    }
  }, [hasUnsavedChanges]);

  // Warn user about unsaved changes when leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Don't warn if we just saved successfully
      if (hasUnsavedChanges && !justSavedRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      setUpdateError('You must be logged in to update settings');
      return;
    }

    try {
      setIsSaving(true);
      setUpdateError(null);
      setSaveSuccess(false);

      // Submit all current form values
      const updates: Partial<UserSettingsType> = {
        dateFormat: dateFormatInput as UserSettingsType['dateFormat'],
        theme: themeInput as UserSettingsType['theme'],
        language: languageInput as UserSettingsType['language'],
        notifications: {
          email: emailNotificationsInput,
          budgetAlerts: budgetAlertsInput,
          monthlySummary: monthlySummaryInput,
        },
      };

      await updateSettings(updates);
      setSaveSuccess(true);

      // Mark that we just saved successfully to prevent unnecessary warning
      justSavedRef.current = true;

      // Update local form state to match what we just saved
      // This ensures hasUnsavedChanges becomes false
      setDateFormatInput(updates.dateFormat!);
      setThemeInput(updates.theme!);
      setLanguageInput(updates.language!);
      setEmailNotificationsInput(updates.notifications!.email);
      setBudgetAlertsInput(updates.notifications!.budgetAlerts);
      setMonthlySummaryInput(updates.notifications!.monthlySummary);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const errorDetails = err instanceof Error ? err.message : 'Unknown error';
      setUpdateError(`Failed to update settings: ${errorDetails}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }

    try {
      setIsSaving(true);
      setUpdateError(null);
      setSaveSuccess(false);

      await updateSettings({
        dateFormat: DEFAULT_USER_SETTINGS.dateFormat,
        theme: DEFAULT_USER_SETTINGS.theme,
        language: DEFAULT_USER_SETTINGS.language,
        notifications: DEFAULT_USER_SETTINGS.notifications,
      });

      // Update local form state to match the defaults
      setDateFormatInput(DEFAULT_USER_SETTINGS.dateFormat);
      setThemeInput(DEFAULT_USER_SETTINGS.theme);
      setLanguageInput(DEFAULT_USER_SETTINGS.language);
      setEmailNotificationsInput(DEFAULT_USER_SETTINGS.notifications.email);
      setBudgetAlertsInput(DEFAULT_USER_SETTINGS.notifications.budgetAlerts);
      setMonthlySummaryInput(DEFAULT_USER_SETTINGS.notifications.monthlySummary);

      setSaveSuccess(true);
      setShowResetConfirm(false);

      // Mark that we just saved successfully
      justSavedRef.current = true;

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const errorDetails = err instanceof Error ? err.message : 'Unknown error';
      setUpdateError(`Failed to reset settings: ${errorDetails}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = async () => {
    await refreshSettings();
  };

  return (
    <div>
      {/* Navigation blocker dialog for in-app navigation */}
      {blocker.state === "blocked" && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="unsaved-changes-title"
        >
          <div
            style={{
              backgroundColor: 'var(--bg-primary, white)',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '400px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h2 id="unsaved-changes-title" style={{ marginTop: 0 }}>
              Unsaved Changes
            </h2>
            <p>
              You have unsaved changes. Are you sure you want to leave this page?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => blocker.reset()}
                style={{ padding: '0.5rem 1rem' }}
              >
                Stay
              </button>
              <button
                type="button"
                onClick={() => blocker.proceed()}
                style={{ padding: '0.5rem 1rem' }}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {!user && <p>Please sign in to manage your settings.</p>}

      {error && !updateError && (
        <div>
          <ErrorMessage id="error">{error}</ErrorMessage>
          <button type="button" onClick={handleRetry}>Retry</button>
        </div>
      )}
      {updateError && <ErrorMessage id="update-error">{updateError}</ErrorMessage>}
      {saveSuccess && (
        <div role="status" aria-live="polite" style={{ color: 'green', marginBottom: '1rem' }}>
          Settings updated successfully!
        </div>
      )}

      {loading ? (
        <Loading message="Loading settings..." />
      ) : !error && (
        <>
          <h1>User Settings</h1>
          <form onSubmit={handleSubmit}>

            <h2>General</h2>

            <FormInput
              id="dateFormat"
              label="Date Format"
              type="select"
              value={dateFormatInput}
              onChange={(e) => setDateFormatInput(e.target.value as UserSettingsType['dateFormat'])}
              options={dateFormatOptions}
              disabled={loading || isSaving}
              aria-label="Select date format"
            />

            <FormInput
              id="theme"
              label="Theme"
              type="select"
              value={themeInput}
              onChange={(e) => setThemeInput(e.target.value as UserSettingsType['theme'])}
              options={themeOptions}
              disabled={loading || isSaving}
              aria-label="Select theme"
            />

            <FormInput
              id="language"
              label="Language"
              type="select"
              value={languageInput}
              onChange={(e) => setLanguageInput(e.target.value as UserSettingsType['language'])}
              options={languageOptions}
              disabled={loading || isSaving}
              aria-label="Select language"
            />

            <fieldset>
              <legend><h2>Notifications</h2></legend>

              <FormInput
                id="emailNotifications"
                label="Email Notifications"
                type="checkbox"
                checked={emailNotificationsInput}
                onChange={(e) => setEmailNotificationsInput(e.target.checked)}
                required={false}
                disabled={loading || isSaving}
                aria-label="Enable email notifications"
              />

              <FormInput
                id="budgetAlerts"
                label="Budget Alerts"
                type="checkbox"
                checked={budgetAlertsInput}
                onChange={(e) => setBudgetAlertsInput(e.target.checked)}
                required={false}
                disabled={loading || isSaving}
                aria-label="Enable budget alerts"
              />

              <FormInput
                id="monthlySummary"
                label="Monthly Summary"
                type="checkbox"
                checked={monthlySummaryInput}
                onChange={(e) => setMonthlySummaryInput(e.target.checked)}
                required={false}
                disabled={loading || isSaving}
                aria-label="Enable monthly summary"
              />
            </fieldset>

            <button type="submit" disabled={loading || isSaving || !user}>
              {isSaving ? "Saving..." : "Update Settings"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading || isSaving}
              style={{ marginLeft: '1rem' }}
            >
              {showResetConfirm ? 'Confirm Reset to Defaults' : 'Reset to Defaults'}
            </button>

            {showResetConfirm && (
              <>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  style={{ marginLeft: '0.5rem' }}
                >
                  Cancel
                </button>
                <p style={{ marginTop: '1rem', color: 'orange' }}>
                  Are you sure you want to reset all settings to their default values?
                </p>
              </>
            )}

          </form>
        </>
      )}
    </div>
  );
}