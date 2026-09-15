import React from 'react';

interface SensorDataPaginationProps {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  startEntry: number;
  endEntry: number;
  onPageChange: (page: number) => void;
}

export const SensorDataPagination: React.FC<SensorDataPaginationProps> = ({
  currentPage,
  totalPages,
  totalEntries,
  startEntry,
  endEntry,
  onPageChange,
}) => {
  // Tạo danh sách số trang cần hiển thị
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 px-1 select-none">
      {/* Bên trái: Thông tin entries chuẩn định dạng wireframe, cỡ chữ 14.5px rõ ràng */}
      <div className="text-[14.5px] text-slate-600 font-normal">
        Showing <strong className="font-bold text-slate-800">{startEntry}</strong> to{' '}
        <strong className="font-bold text-slate-800">{endEntry}</strong> of{' '}
        <strong className="font-bold text-slate-800">{totalEntries}</strong> entries
      </div>

      {/* Bên phải: Nút Previous, Số trang, Next */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Nút Previous */}
        <button
          onClick={() => !isPrevDisabled && onPageChange(currentPage - 1)}
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

          const isActive = item === currentPage;
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
          onClick={() => !isNextDisabled && onPageChange(currentPage + 1)}
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
