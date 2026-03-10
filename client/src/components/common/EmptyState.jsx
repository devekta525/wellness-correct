import { PackageOpen } from 'lucide-react';

/**
 * EmptyState – illustrated empty / zero-result placeholder.
 *
 * Props
 * -----
 * icon          ReactNode   Icon component to render (defaults to PackageOpen).
 * title         string      Main heading (required).
 * description   string      Supporting text.
 * actionLabel   string      CTA button label. Rendered only when provided.
 * onAction      func        Called when the CTA button is clicked.
 * className     string      Extra wrapper classes.
 */
const EmptyState = ({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Icon container – support both function components and ForwardRef (e.g. lucide-react) */}
      <div className="mb-5 flex items-center justify-center w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900/20">
        {(typeof Icon === 'function' || (Icon && typeof Icon === 'object' && typeof Icon.render === 'function')) ? (
          <Icon
            className="w-9 h-9 text-primary-500 dark:text-primary-400"
            aria-hidden="true"
            strokeWidth={1.5}
          />
        ) : (
          Icon
        )}
      </div>

      {/* Title */}
      {title && (
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
          {title}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
          {description}
        </p>
      )}

      {/* CTA */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-sm font-medium px-5 py-2.5 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
