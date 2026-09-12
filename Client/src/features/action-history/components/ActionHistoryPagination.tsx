import React from 'react';

interface ActionHistoryPaginationProps {
  currentPage?: number;
  totalPages?: number;
  totalEntries?: number;
  startEntry?: number;
  endEntry?: number;
  onPageChange: (page: number) => void;
}

export const ActionHistoryPagination: React.FC<ActionHistoryPaginationProps> = ({
  currentPage = 1,
  totalPages = 1,
  totalEntries = 0,
  startEntry = 0,
  endEntry = 0,
  onPageChange,
}) => {
  const safeCurrentPage = typeof currentPage === 'number' && !isNaN(currentPage) && currentPage > 0 ? currentPage : 1;
  const safeTotalPages = typeof totalPages === 'number' && !isNaN(totalPages) && totalPages > 0 ? totalPages : 1;
  const safeTotalEntries = typeof totalEntries === 'number' && !isNaN(totalEntries) ? totalEntries : 0;
  const safeStartEntry = typeof startEntry === 'number' && !isNaN(startEntry) ? startEntry : 0;
  const safeEndEntry = typeof endEntry === 'number' && !isNaN(endEntry) ? endEntry : 0;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (safeTotalPages <= 7) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      if (safeCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', safeTotalPages);
      } else if (safeCurrentPage >= safeTotalPages - 3) {
        pages.push(1, '...', safeTotalPages - 4, safeTotalPages - 3, safeTotalPages - 2, safeTotalPages - 1, safeTotalPages);
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', safeTotalPages);
      }
    }
    return pages;
  };

  const isPrevDisabled = safeCurrentPage <= 1;
  const isNextDisabled = safeCurrentPage >= safeTotalPages;

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 px-1 select-none">
      {/* Bên trái: Thông tin entries */}
      <div className="text-[14.5px] text-slate-600 font-normal">
        Showing <strong className="font-bold text-slate-800">{safeStartEntry}</strong> to{' '}
        <strong className="font-bold text-slate-800">{safeEndEntry}</strong> of{' '}
        <strong className="font-bold text-slate-800">{safeTotalEntries}</strong> entries
      </div>

      {/* Bên phải: Nút Previous, Số trang, Next */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Nút Previous */}
        <button
          onClick={() => !isPrevDisabled && onPageChange(safeCurrentPage - 1)}
          disabled={isPrevDisabled}
          className={`px-4 py-2 rounded-xl text-[13.5px] font-semibold border border-solid transition-all cursor-pointer ${
            isPrevDisabled
              ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
              : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 shadow-2xs'
          }`}
        >
          Previous
        </button>

        {/* Các nút số trang */}
        {getPageNumbers().map((item, idx) => {
          if (typeof item === 'string') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2.5 text-slate-400 text-sm font-bold">
                ...
              </span>
            );
          }

          const isActive = item === safeCurrentPage;
          return (
            <button
              key={`page-${item}-${idx}`}
              onClick={() => onPageChange(item)}
              className={`min-w-[38px] h-[38px] px-3 rounded-xl text-[13.5px] font-bold transition-all cursor-pointer border border-solid ${
                isActive
                  ? 'bg-[#0099FF] text-white border-[#0099FF] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-2xs'
              }`}
            >
              {item}
            </button>
          );
        })}

        {/* Nút Next */}
        <button
          onClick={() => !isNextDisabled && onPageChange(safeCurrentPage + 1)}
          disabled={isNextDisabled}
          className={`px-4 py-2 rounded-xl text-[13.5px] font-semibold border border-solid transition-all cursor-pointer ${
            isNextDisabled
              ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
              : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 shadow-2xs'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

