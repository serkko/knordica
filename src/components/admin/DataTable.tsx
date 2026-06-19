"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/layout/LocaleProvider";

interface Column {
  key: string;
  header: string;
  render?: (item: any) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  searchPlaceholder?: string;
  searchKey?: string; // key of field to filter on
  searchKeys?: string[]; // multiple fields to filter on
}

export function DataTable({
  columns,
  data,
  searchPlaceholder = "Buscar...",
  searchKey,
  searchKeys,
}: DataTableProps) {
  const { locale } = useLocale();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Handle sorting click
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Filter
    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item) => {
        if (searchKeys && searchKeys.length > 0) {
          return searchKeys.some((k) => {
            const val = item[k];
            return val && String(val).toLowerCase().includes(lowerSearch);
          });
        }
        if (searchKey) {
          const val = item[searchKey];
          return val && String(val).toLowerCase().includes(lowerSearch);
        }
        // Fallback to searching all text values in first level
        return Object.values(item).some(
          (val) => val && String(val).toLowerCase().includes(lowerSearch)
        );
      });
    }

    // Sort
    if (sortField) {
      result.sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        // Handles nested objects (like zone.name_es)
        if (sortField.includes(".")) {
          const parts = sortField.split(".");
          aVal = parts.reduce((obj, key) => obj?.[key], a);
          bVal = parts.reduce((obj, key) => obj?.[key], b);
        }

        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        return sortDirection === "asc"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    return result;
  }, [data, searchTerm, searchKey, searchKeys, sortField, sortDirection]);

  // Paginate
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search Input Bar */}
      <div className="relative max-w-sm w-full">
        <Search className="absolute top-1/2 left-3 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder={searchPlaceholder}
          className="h-10 w-full pl-9 pr-4 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden text-[var(--text)]"
        />
      </div>

      {/* Table Shell */}
      <div className="border border-[var(--border)] bg-[var(--surface)] rounded-sm overflow-hidden glass">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]/20 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display">
                {columns.map((col) => (
                  <th 
                    key={col.key} 
                    className="p-4 select-none"
                  >
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="flex items-center gap-1 hover:text-[var(--text)] transition-colors cursor-pointer"
                      >
                        <span>{col.header}</span>
                        {sortField === col.key ? (
                          sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3 opacity-30" />
                        )}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-12 text-center text-xs text-[var(--text-muted)] font-mono">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="h-6 w-6 opacity-60" />
                      <span>{locale === "es" ? "No se encontraron registros" : "No records found"}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => (
                  <tr 
                    key={item.id || idx} 
                    className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)]/40 transition-colors last:border-b-0"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="p-4 text-xs font-light text-[var(--text-2)] leading-normal">
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-2)]/10 flex items-center justify-between gap-4 text-xs">
            <span className="text-[var(--text-muted)] font-light">
              {locale === "es"
                ? `Mostrando ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, processedData.length)} de ${processedData.length}`
                : `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, processedData.length)} of ${processedData.length}`}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-xs flex items-center justify-center border border-[var(--border)] text-[var(--text)] disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 font-mono text-[var(--text)]">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-xs flex items-center justify-center border border-[var(--border)] text-[var(--text)] disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
