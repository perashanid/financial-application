import { useState } from 'react';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function usePagination(initialLimit: number = 10) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: initialLimit,
    total: 0,
    pages: 0,
  });

  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const setLimit = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  const setTotal = (total: number) => {
    const pages = Math.ceil(total / pagination.limit);
    setPagination((prev) => ({ ...prev, total, pages }));
  };

  const nextPage = () => {
    if (pagination.page < pagination.pages) {
      setPage(pagination.page + 1);
    }
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      setPage(pagination.page - 1);
    }
  };

  return {
    pagination,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    prevPage,
  };
}
