"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

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

type DataTableApi = {
  search: (term: string) => DataTableApi;
  column: (index: number) => {
    search: (
      term: string,
      regex?: boolean,
      smart?: boolean,
      caseInsensitive?: boolean,
    ) => DataTableApi;
  };
  page: {
    len: (length: number) => DataTableApi;
  };
  draw: () => DataTableApi;
  destroy: () => void;
};

type JQueryDataTableFactory = new (
  table: HTMLTableElement,
  options: Record<string, unknown>,
) => DataTableApi;

declare global {
  interface Window {
    jQuery?: unknown;
    $?: unknown;
    DataTable?: JQueryDataTableFactory;
  }
}

const JQUERY_SCRIPT_ID = "jquery-datatables-jquery";
const DATATABLES_SCRIPT_ID = "jquery-datatables-core";
const DATATABLES_STYLE_ID = "jquery-datatables-style";
const JQUERY_SRC = "https://code.jquery.com/jquery-3.7.1.min.js";
const DATATABLES_SRC =
  "https://cdn.datatables.net/2.0.8/js/dataTables.min.js";
const DATATABLES_STYLE =
  "https://cdn.datatables.net/2.0.8/css/dataTables.dataTables.min.css";

let assetsPromise: Promise<void> | null = null;

export function JQueryDataTable({
  children,
  pageLength = 10,
  order = [],
  searchable = true,
  paging = true,
  info = true,
  filters = [],
  compactFilters = false,
  compactFilterGridTemplate,
}: JQueryDataTableProps) {
  // Ref used only to snapshot the initial table HTML before handing off to DataTables.
  const snapshotRef = useRef<HTMLDivElement | null>(null);
  // Ref for the container that holds the frozen HTML — React never touches its children.
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const dataTableRef = useRef<DataTableApi | null>(null);
  const tableId = useId().replace(/:/g, "");

  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activePageLength, setActivePageLength] = useState(pageLength);
  const [isTableReady, setIsTableReady] = useState(false);

  // Snapshot the rendered table HTML and freeze it so React never reconciles
  // the nodes that DataTables will mutate.
  const [frozenHtml, setFrozenHtml] = useState<string | null>(null);

  // Step 1 — after the hidden children div mounts, grab its inner HTML once.
  useEffect(() => {
    if (frozenHtml !== null || !snapshotRef.current) return;
    const table = snapshotRef.current.querySelector("table");
    if (table) {
      setFrozenHtml(table.outerHTML);
    }
  // Only run once — frozenHtml starts as null and we set it here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step 2 — once the frozen HTML is in the DOM, initialise DataTables on it.
  useEffect(() => {
    if (frozenHtml === null) return;

    let dataTable: DataTableApi | null = null;
    let disposed = false;

    loadDataTableAssets().then(() => {
      if (disposed || !tableContainerRef.current || !window.DataTable) {
        return;
      }

      const table = tableContainerRef.current.querySelector("table");
      if (!table) return;

      table.id ||= `datatable-${tableId}`;
      table.classList.add("display", "w-full");

      dataTable = new window.DataTable(table, {
        destroy: true,
        pageLength,
        order,
        searching: searchable,
        paging,
        info,
        autoWidth: false,
        layout: {
          topStart: null,
          topEnd: null,
        },
        language: {
          search: "",
          searchPlaceholder: "Search table...",
          lengthMenu: "Show _MENU_ entries",
          emptyTable: "No records available",
          zeroRecords: "No matching records found",
        },
      });

      dataTableRef.current = dataTable;
      setIsTableReady(true);
    });

    return () => {
      disposed = true;
      setIsTableReady(false);
      dataTableRef.current = null;
      dataTable?.destroy();
    };
  // Re-initialise only when the frozen snapshot or core options change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frozenHtml, info, order, pageLength, paging, searchable, tableId]);

  // Step 3 — apply filter/search/page-length changes to the live DataTable.
  useEffect(() => {
    if (!isTableReady || !dataTableRef.current) return;

    const dataTable = dataTableRef.current;
    dataTable.search(searchTerm);

    for (const filter of filters) {
      const value = activeFilters[filter.id] ?? "";

      if (filter.match === "exact" && value) {
        dataTable
          .column(filter.column)
          .search(`^\\s*${escapeRegex(value)}\\s*$`, true, false, true);
        continue;
      }

      dataTable.column(filter.column).search(value);
    }

    dataTable.page.len(activePageLength).draw();
  }, [activeFilters, activePageLength, filters, isTableReady, searchTerm]);

  function updateFilter(filter: JQueryDataTableFilter, value: string) {
    setActiveFilters((current) => ({
      ...current,
      [filter.id]: value,
    }));
  }

  function clearFilters() {
    setActiveFilters({});
    setSearchTerm("");
  }

  function updateSearch(value: string) {
    setSearchTerm(value);
  }

  function updatePageLength(value: string) {
    setActivePageLength(Number(value));
  }

  const wrapperStyle = compactFilterGridTemplate
    ? ({
        "--compact-filter-grid": compactFilterGridTemplate,
      } as CSSProperties)
    : undefined;

  return (
    <div
      className={`jquery-data-table${compactFilters ? " jquery-data-table--compact" : ""}`}
      style={wrapperStyle}
    >
      {(filters.length > 0 || searchable) && (
        <div className="jquery-data-table__filters">
          {searchable && (
            <label className="jquery-data-table__filter jquery-data-table__filter--search">
              <span>Search</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Search table..."
              />
            </label>
          )}
          {filters.map((filter) => (
            <label key={filter.id} className="jquery-data-table__filter">
              <span>{filter.label}</span>
              <select
                value={activeFilters[filter.id] ?? ""}
                onChange={(event) => updateFilter(filter, event.target.value)}
              >
                <option value="">{filter.placeholder}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          {paging && (
            <label className="jquery-data-table__filter jquery-data-table__filter--length">
              <span>Show</span>
              <select
                value={activePageLength}
                onChange={(event) => updatePageLength(event.target.value)}
              >
                {[10, 25, 50, 100].map((length) => (
                  <option key={length} value={length}>
                    {length} entries
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="button" onClick={clearFilters}>
            Reset
          </button>
        </div>
      )}

      {/*
        Hidden div — React renders children here so we can snapshot the HTML.
        It is hidden with aria-hidden and display:none so it doesn't affect layout.
      */}
      {frozenHtml === null && (
        <div ref={snapshotRef} aria-hidden="true" style={{ display: "none" }}>
          {children}
        </div>
      )}

      {/*
        Once we have the snapshot, render it via dangerouslySetInnerHTML so
        React never touches those DOM nodes again — DataTables owns them now.
      */}
      {frozenHtml !== null && (
        <div
          ref={tableContainerRef}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: frozenHtml }}
        />
      )}
    </div>
  );
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function loadDataTableAssets() {
  if (assetsPromise) {
    return assetsPromise;
  }

  assetsPromise = new Promise<void>((resolve, reject) => {
    loadStyle(DATATABLES_STYLE_ID, DATATABLES_STYLE);
    loadScript(JQUERY_SCRIPT_ID, JQUERY_SRC)
      .then(() => loadScript(DATATABLES_SCRIPT_ID, DATATABLES_SRC))
      .then(resolve)
      .catch(reject);
  });

  return assetsPromise;
}

function loadStyle(id: string, href: string) {
  if (document.getElementById(id)) {
    return;
  }

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function loadScript(id: string, src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;

    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.body.appendChild(script);
  });
}
