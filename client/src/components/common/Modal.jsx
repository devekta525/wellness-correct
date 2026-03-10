import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

/**
 * Modal – accessible, portal-based modal dialog.
 *
 * Props
 * -----
 * isOpen       bool      Controls visibility.
 * onClose      func      Called when the user closes the modal.
 * title        string    Rendered in the header.
 * children     node      Modal body content.
 * size         'sm'|'md'|'lg'|'xl'  (default: 'md')
 * hideCloseBtn bool      Hide the × button when true.
 * className    string    Extra classes for the panel.
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  hideCloseBtn = false,
  className = '',
}) => {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  const didFocusPanel = useRef(false);

  // Trap focus inside the modal while open
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = panelRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      // Move focus to the panel only when first opening (not on every re-render), so typing in inputs isn't interrupted
      if (!didFocusPanel.current) {
        didFocusPanel.current = true;
        setTimeout(() => panelRef.current?.focus(), 0);
      }
    } else {
      didFocusPanel.current = false;
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previouslyFocused.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={[
          'relative w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 shadow-2xl',
          'outline-none animate-slide-up my-auto',
          sizeClasses[size] ?? sizeClasses.md,
          className,
        ].join(' ')}
      >
        {/* Header */}
        {(title || !hideCloseBtn) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-gray-900 dark:text-white truncate"
              >
                {title}
              </h2>
            )}
            {!hideCloseBtn && (
              <button
                onClick={onClose}
                className="ml-auto flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
