"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Inbox, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export interface Column<T> {
  key: string;
  label_es: string;
  label_en: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface BulkAction<T> {
  label_es: string;
  label_en: string;
  action: (selected: T[]) => void;
  variant?: "danger" | "default";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  locale: string;
  keyExtractor: (item: T) => string;
  searchKeys?: string[];
  bulkActions?: BulkAction<T>[];
  emptyLabel_es?: string;
  emptyLabel_en?: string;
  pageSize?: number;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  locale,
  keyExtractor,
  searchKeys = [],
  bulkActions = [],
  emptyLabel_es = "No se encontraron registros",
  emptyLabel_en = "No records found",
  pageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleSort = (key: string) => {
    if (sortField === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return data;
    return data.filter((item) =>
      searchKeys.some((k) => {
        const val = item[k];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number")
        return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const allSelectedOnPage = paginated.every((i) => selected.has(keyExtractor(i)));

  const toggleSelectAll = () => {
    if (allSelectedOnPage) {
      setSelected((s) => {
        const next = new Set(s);
        paginated.forEach((i) => next.delete(keyExtractor(i)));
        return next;
      });
    } else {
      setSelected((s) => {
        const next = new Set(s);
        paginated.forEach((i) => next.add(keyExtractor(i)));
        return next;
      });
    }
  };

  const toggleRow = (key: string) => {
    setSelected((s) => {
      const next = new Set(s);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const selectedItems = data.filter((i) => selected.has(keyExtractor(i)));

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative max-w-xs w-full">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={locale === "es" ? "Buscar..." : "Search..."}
            className="h-9 w-full pl-9 pr-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:outline-none text-[var(--text)] placeholder:text-[var(--text-muted)]"
          />
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && bulkActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-[10px] text-[var(--text-muted)] font-mono">
              {selected.size} {locale === "es" ? "seleccionados" : "selected"}
            </span>
            {bulkActions.map((action) => (
              <button
                key={action.label_es}
                onClick={() => { action.action(selectedItems); setSelected(new Set()); }}
                className={`px-3 py-1.5 text-[10px] font-semibold rounded-xs transition-colors cursor-pointer ${
                  action.variant === "danger"
                    ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                    : "bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-hover)] border border-[var(--border)]"
                }`}
              >
                {locale === "es" ? action.label_es : action.label_en}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div className="border border-[var(--border)] rounded-sm overflow-hidden bg-[var(--surface)]">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[var(--text-muted)] text-xs">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{locale === "es" ? "Cargando..." : "Loading..."}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]/30 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display">
                  {bulkActions.length > 0 && (
                    <th className="w-10 p-3">
                      <input
                        type="checkbox"
                        checked={allSelectedOnPage && paginated.length > 0}
                        onChange={toggleSelectAll}
                        className="accent-[var(--accent)] cursor-pointer"
                      />
                    </th>
                  )}
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3">
                      {col.sortable ? (
                        <button
                          onClick={() => handleSort(col.key)}
                          className="flex items-center gap-1 hover:text-[var(--text)] transition-colors cursor-pointer"
                        >
                          {locale === "es" ? col.label_es : col.label_en}
                          {sortField === col.key ? (
                            sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3 opacity-30" />
                          )}
                        </button>
                      ) : (
                        <span>{locale === "es" ? col.label_es : col.label_en}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (bulkActions.length > 0 ? 1 : 0)}
                      className="py-14 text-center text-xs text-[var(--text-muted)]"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Inbox className="h-6 w-6 opacity-40" />
                        <span>{locale === "es" ? emptyLabel_es : emptyLabel_en}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((item) => {
                    const key = keyExtractor(item);
                    const isSelected = selected.has(key);
                    return (
                      <motion.tr
                        key={key}
                        layout
                        className={`border-b border-[var(--border)] last:border-b-0 transition-colors ${
                          isSelected ? "bg-[var(--accent)]/5" : "hover:bg-[var(--surface-2)]/30"
                        }`}
                      >
                        {bulkActions.length > 0 && (
                          <td className="w-10 px-3 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRow(key)}
                              className="accent-[var(--accent)] cursor-pointer"
                            />
                          </td>
                        )}
                        {columns.map((col) => (
                          <td key={col.key} className="px-4 py-3 text-xs text-[var(--text-2)]">
                            {col.render ? col.render(item) : String(item[col.key] ?? "")}
                          </td>
                        ))}
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>
            {locale === "es"
              ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, sorted.length)} de ${sorted.length}`
              : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, sorted.length)} of ${sorted.length}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-7 w-7 flex items-center justify-center border border-[var(--border)] rounded-xs disabled:opacity-30 hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 font-mono">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-7 w-7 flex items-center justify-center border border-[var(--border)] rounded-xs disabled:opacity-30 hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
