import { useState } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";

const DataTable = ({
  columns,
  data,
  loading = false,
  onSort,
  sortColumn,
  sortDirection,
  onRowClick,
  actions,
  emptyMessage = "No data available",
  emptyDescription = "There are no records to display.",
  // Pagination props
  currentPage = 1,
  totalPages = 1,
  itemsPerPage = 20,
  totalItems = 0,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const [selectedRows, setSelectedRows] = useState(new Set());

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(data.map(row => row.Id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id, checked) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  if (loading) {
    return <Loading type="table" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <Empty 
          title={emptyMessage}
          description={emptyDescription}
          icon="Database"
        />
      </div>
    );
  }

const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-6 py-4">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && onSort && (
                      <button
                        onClick={() => onSort(column.key)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ApperIcon
                          name={
                            sortColumn === column.key
                              ? sortDirection === "asc"
                                ? "ChevronUp"
                                : "ChevronDown"
                              : "ChevronsUpDown"
                          }
                          size={14}
                        />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-6 py-4 w-32">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <motion.tr
                key={row.Id}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                onClick={() => onRowClick?.(row)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={selectedRows.has(row.Id)}
                    onChange={(e) => handleSelectRow(row.Id, e.target.checked)}
                  />
                </td>
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex space-x-2">
                      {actions.map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                        >
                          <ApperIcon name={action.icon} size={16} />
                        </Button>
                      ))}
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {onPageChange && totalPages > 1 && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{totalItems}</span>{' '}
                  results
                </p>
                
                {onItemsPerPageChange && (
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-700">Show:</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
                      className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                )}
              </div>
              
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ApperIcon name="ChevronLeft" size={16} />
                  </button>
                  
                  {generatePageNumbers().map((page, index) => (
                    page === 'ellipsis' ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                          page === currentPage
                            ? 'z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                  
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <ApperIcon name="ChevronRight" size={16} />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;