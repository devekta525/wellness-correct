import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Info, X } from 'lucide-react';

/**
 * ConfirmDialog – lightweight confirmation dialog.
 *
 * Props
 * -----
 * isOpen        bool     Controls visibility.
 * onClose       func     Called when the dialog is dismissed without confirming.
 * onConfirm     func     Called when the user clicks the confirm button.
 * title         string   Dialog heading.
 * message       string   Supporting body text.
 * confirmLabel  string   Label for the confirm button (default: 'Confirm').
 * cancelLabel   string   Label for the cancel button (default: 'Cancel').
 * isDanger      bool     Uses red destructive styling on the confirm button.
 * isLoading     bool     Disables buttons and shows loading state on confirm.
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  isLoading = false,
}) => {
  const confirmRef = useRef(null);
  const cancelRef = useRef(null);

  // Keyboard handling: Escape to close, Tab to trap focus
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab') {
        const focusable = [cancelRef.current, confirmRef.current].filter(Boolean);
        if (focusable.length < 2) return;
        if (e.shiftKey) {
          if (document.activeElement === focusable[0]) {
            e.preventDefault();
            focusable[focusable.length - 1].focus();
          }
        } else {
          if (document.activeElement === focusable[focusable.length - 1]) {
            e.preventDefault();
            focusable[0].focus();
          }
        }
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Focus the cancel button by default (safe choice for destructive actions)
      setTimeout(() => cancelRef.current?.focus(), 0);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const confirmBtnClass = isDanger
    ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 focus:ring-red-500 text-white'
    : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500 text-white';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby={message ? 'confirm-message' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 shadow-2xl animate-slide-up overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-3 right-3 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="px-6 pt-6 pb-5">
          {/* Icon */}
          <div
            className={[
              'mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full',
              isDanger
                ? 'bg-red-50 dark:bg-red-900/20'
                : 'bg-primary-50 dark:bg-primary-900/20',
            ].join(' ')}
          >
            {isDanger ? (
              <AlertTriangle
                className="w-7 h-7 text-red-500"
                aria-hidden="true"
                strokeWidth={1.75}
              />
            ) : (
              <Info
                className="w-7 h-7 text-primary-500"
                aria-hidden="true"
                strokeWidth={1.75}
              />
            )}
          </div>

          {/* Title */}
          <h2
            id="confirm-title"
            className="text-center text-base font-semibold text-gray-900 dark:text-white mb-2"
          >
            {title}
          </h2>

          {/* Message */}
          {message && (
            <p
              id="confirm-message"
              className="text-center text-sm text-gray-500 dark:text-gray-400 leading-relaxed"
            >
              {message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          {/* Cancel */}
          <button
            ref={cancelRef}
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
          >
            {cancelLabel}
          </button>

          {/* Confirm */}
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={isLoading}
            className={[
              'flex-1 rounded-xl text-sm font-medium py-2.5 transition-colors shadow-sm',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              confirmBtnClass,
            ].join(' ')}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Processing…
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
