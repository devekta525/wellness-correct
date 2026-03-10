/**
 * Toggle switch – consistent appearance and correct knob positioning across the app.
 * Track: 48×24px. Knob: 16×16px, vertically centered, 4px from edges when off/on.
 *
 * @param {boolean} checked   – controlled state
 * @param {function} onChange – (e) => void
 * @param {string} className  – extra classes on the track (e.g. dark mode)
 * @param {string} role       – default 'switch' for accessibility
 */
const Toggle = ({ checked, onChange, className = '', role = 'switch', 'aria-label': ariaLabel }) => (
  <button
    type="button"
    role={role}
    aria-checked={checked}
    aria-label={ariaLabel}
    onClick={onChange}
    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'} ${className}`}
  >
    <span
      className={`absolute left-0 top-1/2 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-7 -translate-y-1/2' : 'translate-x-1 -translate-y-1/2'}`}
      aria-hidden
    />
  </button>
);

export default Toggle;
