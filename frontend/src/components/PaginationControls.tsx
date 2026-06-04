import type { PagedResult } from "../types/paginationTypes";

type PaginationControlsProps = {
  pagination: Pick<
    PagedResult<unknown>,
    "page" | "pageSize" | "totalItems" | "totalPages" | "hasPreviousPage" | "hasNextPage"
  >;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
};

function PaginationControls({
  pagination,
  isLoading = false,
  onPageChange,
}: PaginationControlsProps) {
  if (pagination.totalItems <= pagination.pageSize) {
    return null;
  }

  const firstVisibleItem = (pagination.page - 1) * pagination.pageSize + 1;
  const lastVisibleItem = Math.min(
    pagination.page * pagination.pageSize,
    pagination.totalItems,
  );

  return (
    <nav className="pagination" aria-label="Paginación">
      <p className="pagination-info">
        {firstVisibleItem}-{lastVisibleItem} de {pagination.totalItems}
      </p>

      <div className="pagination-actions">
        <button
          type="button"
          className="pagination-button"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={!pagination.hasPreviousPage || isLoading}
        >
          &larr;
        </button>

        <span className="pagination-page">
          Página {pagination.page} de {pagination.totalPages}
        </span>

        <button
          type="button"
          className="pagination-button"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!pagination.hasNextPage || isLoading}
        >
          &rarr;
        </button>
      </div>
    </nav>
  );
}

export default PaginationControls;
