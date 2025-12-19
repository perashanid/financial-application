import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import clsx from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter((page) => {
    return (
      page === 1 ||
      page === totalPages ||
      (page >= currentPage - 1 && page <= currentPage + 1)
    );
  });

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={clsx(
          'p-2 rounded-md',
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
        )}
      >
        <FiChevronLeft className="h-5 w-5" />
      </button>

      {visiblePages.map((page, index) => {
        const prevPage = visiblePages[index - 1];
        const showEllipsis = prevPage && page - prevPage > 1;

        return (
          <React.Fragment key={page}>
            {showEllipsis && <span className="px-2 text-gray-500">...</span>}
            <button
              onClick={() => onPageChange(page)}
              className={clsx(
                'px-4 py-2 rounded-md text-sm font-medium',
                page === currentPage
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              {page}
            </button>
          </React.Fragment>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={clsx(
          'p-2 rounded-md',
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
        )}
      >
        <FiChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Pagination;
