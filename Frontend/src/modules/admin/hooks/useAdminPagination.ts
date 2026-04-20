import { useMemo, useState } from "react";

export function useAdminPagination(defaultPage = 1, defaultLimit = 10) {
  const [page, setPage] = useState(defaultPage);
  const [limit, setLimit] = useState(defaultLimit);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const goNext = () => setPage((prev) => Math.min(totalPages, prev + 1));
  const goPrev = () => setPage((prev) => Math.max(1, prev - 1));

  return {
    page,
    limit,
    total,
    totalPages,
    setPage,
    setLimit,
    setTotal,
    goNext,
    goPrev,
  };
}
