import { Loader2 } from 'lucide-react';

const sizeMap = {
  sm: { spinner: 'w-4 h-4', text: 'text-xs', gap: 'gap-1.5' },
  md: { spinner: 'w-8 h-8', text: 'text-sm', gap: 'gap-2' },
  lg: { spinner: 'w-12 h-12', text: 'text-base', gap: 'gap-3' },
};

/**
 * Loader – animated spinner with optional label.
 *
 * Props
 * -----
 * size        'sm' | 'md' | 'lg'   (default: 'md')
 * text        string                Optional label rendered below the spinner.
 * fullScreen  bool                  Centres the loader in the viewport when true.
 * className   string                Extra classes applied to the wrapper.
 */
const Loader = ({ size = 'md', text, fullScreen = false, className = '' }) => {
  const { spinner, text: textSize, gap } = sizeMap[size] ?? sizeMap.md;

  const content = (
    <div className={`flex flex-col items-center justify-center ${gap} ${className}`}>
      <Loader2
        className={`${spinner} animate-spin text-primary-600 dark:text-primary-400`}
        aria-hidden="true"
      />
      {text && (
        <p className={`${textSize} font-medium text-gray-500 dark:text-gray-400 select-none`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
        role="status"
        aria-label={text ?? 'Loading'}
      >
        {content}
      </div>
    );
  }

  return (
    <div role="status" aria-label={text ?? 'Loading'}>
      {content}
    </div>
  );
};

export default Loader;
