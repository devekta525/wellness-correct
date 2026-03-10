import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';

const RECENT_KEY = 'Wellness_fuel_recent_searches';
const MAX_RECENT = 5;

const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const saveRecentSearch = (term) => {
  if (!term.trim()) return;
  const existing = getRecentSearches().filter((s) => s !== term);
  const updated = [term, ...existing].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
};

/**
 * SearchBar – full-featured search input with recent search history.
 *
 * Props
 * -----
 * onSearch      func      Called with the search string when submitted.
 * placeholder   string    Input placeholder text.
 * defaultValue  string    Pre-populated query value.
 * className     string    Extra wrapper classes.
 * autoFocus     bool      Focus input on mount.
 */
const SearchBar = ({
  onSearch,
  placeholder = 'Search for products…',
  defaultValue = '',
  className = '',
  autoFocus = false,
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Load recent searches when the dropdown opens
  useEffect(() => {
    if (isFocused) setRecentSearches(getRecentSearches());
  }, [isFocused]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = useCallback(
    (term = query) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      saveRecentSearch(trimmed);
      setQuery(trimmed);
      setIsFocused(false);
      onSearch?.(trimmed);
    },
    [query, onSearch]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (term) => {
    handleSubmit(term);
  };

  const handleRemoveRecent = (e, term) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const showDropdown = isFocused && recentSearches.length > 0 && !query.trim();

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input row */}
      <div
        className={[
          'flex items-center gap-2 w-full rounded-xl border bg-white dark:bg-gray-800 px-4 py-2.5 transition-shadow',
          isFocused
            ? 'border-primary-500 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
        ].join(' ')}
      >
        <Search
          className="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />

        <input
          ref={inputRef}
          type="search"
          value={query}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
          aria-label="Search"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={handleClear}
            className="flex-shrink-0 rounded-full p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Search submit button */}
        <button
          onClick={() => handleSubmit()}
          className="flex-shrink-0 rounded-lg bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-medium px-3 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
          aria-label="Submit search"
        >
          Search
        </button>
      </div>

      {/* Recent searches dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-40 mt-1.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden animate-fade-in">
          <p className="flex items-center gap-1.5 px-4 pt-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            <Clock className="w-3 h-3" />
            Recent searches
          </p>
          <ul role="listbox" aria-label="Recent searches">
            {recentSearches.map((term) => (
              <li key={term} role="option" aria-selected="false">
                <button
                  onClick={() => handleSuggestionClick(term)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors text-left group"
                >
                  <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-primary-400 transition-colors" />
                  <span className="flex-1 truncate">{term}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleRemoveRecent(e, term)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRemoveRecent(e, term)}
                    className="opacity-0 group-hover:opacity-100 rounded p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all focus:outline-none focus:opacity-100"
                    aria-label={`Remove ${term} from recent searches`}
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
