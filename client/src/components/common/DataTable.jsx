import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { SkeletonTable } from './SkeletonLoader';
import { EmptyState } from './EmptyState';

export const DataTable = ({
  columns,
  data = [],
  loading = false,
  searchPlaceholder = 'Search records...',
  filterKey,
  filterOptions = [],
  pageSize = 10,
  title,
  subtitle,
  actions,
  emptyTitle = 'No data found',
  emptyDescription = 'No records available for the current filters.'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => {
      // 1. Filter dropdown match
      if (filterKey && selectedFilter !== 'All') {
        const itemVal = String(item[filterKey] || '').toLowerCase();
        if (itemVal !== selectedFilter.toLowerCase()) return false;
      }

      // 2. Global search text match across all string/number fields
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matches = Object.values(item).some((val) => {
          if (typeof val === 'string' || typeof val === 'number') {
            return String(val).toLowerCase().includes(term);
          }
          if (val && typeof val === 'object') {
            return Object.values(val).some((subVal) =>
              String(subVal).toLowerCase().includes(term)
            );
          }
          return false;
        });
        if (!matches) return false;
      }

      return true;
    });
  }, [data, searchTerm, filterKey, selectedFilter]);

  // Pagination Logic
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, validPage, pageSize]);

  if (loading) {
    return <SkeletonTable rows={pageSize} cols={columns.length} />;
  }

  return (
    <div className="card-surface overflow-hidden">
      {/* Header Bar */}
      {(title || filterOptions.length > 0 || searchPlaceholder || actions) && (
        <div className="p-5 border-b border-dark-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-dark-300 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-dark-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field pl-9 py-2 text-xs"
              />
            </div>

            {/* Filter Dropdown */}
            {filterOptions.length > 0 && (
              <div className="relative flex items-center">
                <Filter className="w-3.5 h-3.5 text-dark-400 absolute left-3 pointer-events-none" />
                <select
                  value={selectedFilter}
                  onChange={(e) => {
                    setSelectedFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input-field pl-8 pr-8 py-2 text-xs appearance-none bg-dark-850 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  {filterOptions.map((opt) => (
                    <option key={opt.value || opt} value={opt.value || opt}>
                      {opt.label || opt}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Extra Action Buttons */}
            {actions}
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-dark-850/80 text-dark-300 uppercase tracking-wider font-semibold border-b border-dark-700">
            <tr>
              {columns.map((col, idx) => (
                <th key={col.key || idx} className={`px-5 py-3.5 ${col.headerClass || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700/60 bg-dark-800">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="hover:bg-dark-750/50 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td key={col.key || colIdx} className={`px-5 py-4 ${col.cellClass || ''}`}>
                      {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-5 py-3.5 border-t border-dark-700 flex items-center justify-between text-xs text-dark-300 bg-dark-850/50">
          <div>
            Showing <span className="font-semibold text-slate-200">{(validPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-200">
              {Math.min(validPage * pageSize, totalItems)}
            </span>{' '}
            of <span className="font-semibold text-slate-200">{totalItems}</span> results
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={validPage === 1}
              className="p-1.5 rounded-lg border border-dark-700 hover:bg-dark-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validPage === 1}
              className="p-1.5 rounded-lg border border-dark-700 hover:bg-dark-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-dark-750 border border-dark-600 rounded-lg text-slate-200 font-medium">
              Page {validPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validPage === totalPages}
              className="p-1.5 rounded-lg border border-dark-700 hover:bg-dark-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={validPage === totalPages}
              className="p-1.5 rounded-lg border border-dark-700 hover:bg-dark-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
