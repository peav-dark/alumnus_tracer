"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export type JQueryDataTableFilter = {
  id: string;
  label: string;
  column: number;
  match?: "contains" | "exact";
  placeholder: string;
  options: Array<{
    label: string;
    value: string;
  }>;
};

type JQueryDataTableOptions = {
  pageLength?: number;
  order?: Array<[number, "asc" | "desc"]>;
  searchable?: boolean;
  paging?: boolean;
  info?: boolean;
  filters?: JQueryDataTableFilter[];
  compactFilters?: boolean;
  compactFilterGridTemplate?: string;
};

type JQueryDataTableProps = JQueryDataTableOptions & {
  children: ReactNode;
};

export function JQueryDataTable({
  children,
  pageLength = 10,
  searchable = true,
  paging = true,
  info = true,
  filters = [],
  compactFilters = false,
  compactFilterGridTemplate,
}: JQueryDataTableProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [activePageLength, setActivePageLength] = useState(pageLength);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVisible, setTotalVisible] = useState(0);

  // Apply search/filter/pagination by toggling the native `hidden` attribute on
  // <tr> elements.  We never replace or clone DOM nodes — React still owns the
  // entire tree and all onClick handlers remain live.
  const applyVisibility = useCallback(() => {
    if (!wrapperRef.current) return;

    const tbody = wrapperRef.current.querySelector("tbody");
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll<HTMLTableRowElement>(":scope > tr"));

    const search = searchTerm.toLowerCase().trim();

    // Determine which rows match the search + filter criteria.
    const matching: HTMLTableRowElement[] = [];

    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll<HTMLElement>("td"));

      // Global search: any cell contains the term.
      if (search) {
        const rowText = cells.map((c) => c.textContent ?? "").join(" ").toLowerCase();
        if (!rowText.includes(search)) {
          row.hidden = true;
          continue;
        }
      }

      // Column-level filters.
      let filtered = false;
      for (const filter of filters) {
        const value = activeFilters[filter.id] ?? "";
        if (!value) continue;
        const cellText = (cells[filter.column]?.textContent ?? "").trim();
        if (filter.match === "exact") {
          if (cellText !== value) { filtered = true; break; }
        } else {
          if (!cellText.toLowerCase().includes(value.toLowerCase())) { filtered = true; break; }
        }
      }

      if (filtered) {
        row.hidden = true;
        continue;
      }

      matching.push(row);
    }

    setTotalVisible(matching.length);

    // Clamp current page if needed.
    const totalPages = Math.max(1, Math.ceil(matching.length / activePageLength));
    const safePage = Math.min(currentPage, totalPages);

    const start = (safePage - 1) * activePageLength;
    const end = start + activePageLength;

    // Show only the paginated slice of matching rows.
    for (let i = 0; i < matching.length; i++) {
      matching[i].hidden = !paging || (i >= start && i < end) ? false : true;
    }
  }, [searchTerm, activeFilters, filters, activePageLength, currentPage, paging]);

  // Run visibility logic after every relevant state change.
  // We use a short timeout so React has finished painting the children first.
  useEffect(() => {
    const id = setTimeout(applyVisibility, 0);
    return () => clearTimeout(id);
  }, [applyVisibility]);

  // Also re-run when children change (e.g. after router.refresh() adds new rows).
  const prevChildrenRef = useRef<ReactNode>(null);
  useEffect(() => {
    if (prevChildrenRef.current !== children) {
      prevChildrenRef.current = children;
      const id = setTimeout(applyVisibility, 0);
      return () => clearTimeout(id);
    }
  }, [children, applyVisibility]);

  function updateFilter(filter: JQueryDataTableFilter, value: string) {
    setCurrentPage(1);
    setActiveFilters((prev) => ({ ...prev, [filter.id]: value }));
  }

  function clearFilters() {
    setCurrentPage(1);
    setSearchTerm("");
    setActiveFilters({});
  }

  const totalPages = Math.max(1, Math.ceil(totalVisible / activePageLength));
  const startRow = totalVisible === 0 ? 0 : (currentPage - 1) * activePageLength + 1;
  const endRow = Math.min(currentPage * activePageLength, totalVisible);

  const wrapperStyle = compactFilterGridTemplate
    ? ({ "--compact-filter-grid": compactFilterGridTemplate } as CSSProperties)
    : undefined;

  return (
    <div
      className={`jquery-data-table${compactFilters ? " jquery-data-table--compact" : ""}`}
      style={wrapperStyle}
    >
      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      {(filters.length > 0 || searchable) && (
        <div className="jquery-data-table__filters">
          {searchable && (
            <label className="jquery-data-table__filter jquery-data-table__filter--search">
              <span>Search</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => { setCurrentPage(1); setSearchTerm(e.target.value); }}
                placeholder="Search table..."
              />
            </label>
          )}
          {filters.map((filter) => (
            <label key={filter.id} className="jquery-data-table__filter">
              <span>{filter.label}</span>
              <select
                value={activeFilters[filter.id] ?? ""}
                onChange={(e) => updateFilter(filter, e.target.value)}
              >
                <option value="">{filter.placeholder}</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          ))}
          {paging && (
            <label className="jquery-data-table__filter jquery-data-table__filter--length">
              <span>Show</span>
              <select
                value={activePageLength}
                onChange={(e) => { setCurrentPage(1); setActivePageLength(Number(e.target.value)); }}
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>{n} entries</option>
                ))}
              </select>
            </label>
          )}
          <button type="button" onClick={clearFilters}>Reset</button>
        </div>
      )}

      {/* ── Table (React fully owns this DOM — no DataTables involvement) ──── */}
      <div ref={wrapperRef}>
        {children}
      </div>

      {/* ── Footer: info + pagination ───────────────────────────────────────── */}
      {(info || paging) && (
        <div className="jquery-data-table__footer">
          {info && (
            <p className="jquery-data-table__info">
              {totalVisible === 0
                ? "No matching records found"
                : `Showing ${startRow}–${endRow} of ${totalVisible} entries`}
            </p>
          )}
          {paging && totalPages > 1 && (
            <div className="jquery-data-table__pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
                .reduce<(number | "…")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="jquery-data-table__page-ellipsis">…</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={currentPage === p ? "jquery-data-table__page--active" : ""}
                      onClick={() => setCurrentPage(p as number)}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
