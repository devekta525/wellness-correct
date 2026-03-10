import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

/**
 * Build the visible page range with ellipsis markers.
 * Always shows the first and last page, and up to `siblings` pages
 * either side of the current page.
 *
 * Returns an array of numbers or the string 'ellipsis'.
 */
const buildPageList = (currentPage, totalPages, siblings = 1) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblings, 1);
  const rightSibling = Math.min(currentPage + siblings, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const pages = [1];

  if (showLeftEllipsis) {
    pages.push('ellipsis-left');
  } else {
    for (let i = 2; i < leftSibling; i++) pages.push(i);
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== totalPages) pages.push(i);
  }

  if (showRightEllipsis) {
    pages.push('ellipsis-right');
  } else {
    for (let i = rightSibling + 1; i < totalPages; i++) pages.push(i);
  }

  pages.push(totalPages);

  return pages;
};

const PageButton = ({ page, currentPage, onPageChange }) => {
  const isActive = page === currentPage;
  return (
    <button
      onClick={() => onPageChange(page)}
      aria-label={`Go to page ${page}`}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'min-w-[2.25rem] h-9 px-3 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
        isActive
          ? 'bg-primary-600 text-white shadow-sm'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
      ].join(' ')}
    >
      {page}
    </button>
  );
};

/**
 * Pagination – page navigation control.
 *
 * Props
 * -----
 * currentPage    number   1-based active page.
 * totalPages     number   Total number of pages.
 * onPageChange   func     Called with the new page number.
 * siblings       number   Pages shown either side of current (default: 1).
 * showFirstLast  bool     Show fast-forward to first/last (default: false).
 * className      string   Extra wrapper classes.
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblings = 1,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const pages = buildPageList(currentPage, totalPages, siblings);

  const prev = () => currentPage > 1 && onPageChange(currentPage - 1);
  const next = () => currentPage < totalPages && onPageChange(currentPage + 1);

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-1 ${className}`}
    >
      {/* Previous */}
      <button
        onClick={prev}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page buttons */}
      {pages.map((page, idx) =>
        typeof page === 'string' ? (
          <span
            key={page}
            className="h-9 w-9 flex items-center justify-center text-gray-400 dark:text-gray-500 select-none"
            aria-hidden="true"
          >
            <MoreHorizontal className="w-4 h-4" />
          </span>
        ) : (
          <PageButton
            key={page}
            page={page}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        )
      )}

      {/* Next */}
      <button
        onClick={next}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default Pagination;
