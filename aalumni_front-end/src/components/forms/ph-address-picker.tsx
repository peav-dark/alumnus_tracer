"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/* ── Types ─────────────────────────────────────────── */

export type PhAddressValue = {
  region: string;
  regionCode: string;
  province: string;
  provinceCode: string;
  cityMun: string;
  cityMunCode: string;
  barangay: string;
  barangayCode: string;
};

export const EMPTY_PH_ADDRESS: PhAddressValue = {
  region: "",
  regionCode: "",
  province: "",
  provinceCode: "",
  cityMun: "",
  cityMunCode: "",
  barangay: "",
  barangayCode: "",
};

type GeoItem = { name: string; [key: string]: string };

/* ── Lazy-loaded PSGC data ─────────────────────────── */

let psgcModule: typeof import("phil-reg-prov-mun-brgy") | null = null;
let psgcLoading: Promise<typeof import("phil-reg-prov-mun-brgy")> | null = null;

function loadPsgc() {
  if (psgcModule) {
    return Promise.resolve(psgcModule);
  }

  if (!psgcLoading) {
    psgcLoading = import("phil-reg-prov-mun-brgy").then((mod) => {
      psgcModule = mod;
      return mod;
    });
  }

  return psgcLoading;
}

/* ── Component ─────────────────────────────────────── */

export function PhAddressPicker({
  value,
  onChange,
  disabled = false,
  className = "",
}: {
  value: PhAddressValue;
  onChange: (value: PhAddressValue) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(!!psgcModule);
  const [psgc, setPsgc] = useState(psgcModule);

  useEffect(() => {
    if (psgcModule) {
      setPsgc(psgcModule);
      setLoaded(true);
      return;
    }

    void loadPsgc().then((mod) => {
      setPsgc(mod);
      setLoaded(true);
    });
  }, []);

  const regions = useMemo(
    () => sortByName(psgc?.regions ?? []),
    [psgc],
  );

  const provincesForRegion = useMemo(
    () =>
      value.regionCode && psgc
        ? sortByName(psgc.getProvincesByRegion(value.regionCode))
        : [],
    [psgc, value.regionCode],
  );

  const citiesForProvince = useMemo(
    () =>
      value.provinceCode && psgc
        ? sortByName(psgc.getCityMunByProvince(value.provinceCode))
        : [],
    [psgc, value.provinceCode],
  );

  const barangaysForCity = useMemo(
    () =>
      value.cityMunCode && psgc
        ? sortByName(psgc.getBarangayByMun(value.cityMunCode))
        : [],
    [psgc, value.cityMunCode],
  );

  const handleRegion = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const option = e.target.selectedOptions[0];

      onChange({
        region: option?.text ?? "",
        regionCode: e.target.value,
        province: "",
        provinceCode: "",
        cityMun: "",
        cityMunCode: "",
        barangay: "",
        barangayCode: "",
      });
    },
    [onChange],
  );

  const handleProvince = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const option = e.target.selectedOptions[0];

      onChange({
        ...value,
        province: option?.text ?? "",
        provinceCode: e.target.value,
        cityMun: "",
        cityMunCode: "",
        barangay: "",
        barangayCode: "",
      });
    },
    [onChange, value],
  );

  const handleCity = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const option = e.target.selectedOptions[0];

      onChange({
        ...value,
        cityMun: option?.text ?? "",
        cityMunCode: e.target.value,
        barangay: "",
        barangayCode: "",
      });
    },
    [onChange, value],
  );

  const handleBarangay = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const option = e.target.selectedOptions[0];

      onChange({
        ...value,
        barangay: option?.text ?? "",
        barangayCode: e.target.value,
      });
    },
    [onChange, value],
  );

  if (!loaded) {
    return (
      <div className={`grid gap-3 sm:grid-cols-2 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-11 animate-pulse rounded-md bg-gray-2 dark:bg-dark-2" />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${className}`}>
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-dark-5 dark:text-dark-6">
          Region
        </span>
        <select
          value={value.regionCode}
          onChange={handleRegion}
          disabled={disabled}
          className={selectClassName}
        >
          <option value="">Select Region</option>
          {regions.map((r, idx) => (
            <option key={`${r.reg_code}-${idx}`} value={r.reg_code}>
              {r.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-bold text-dark-5 dark:text-dark-6">
          Province
        </span>
        <select
          value={value.provinceCode}
          onChange={handleProvince}
          disabled={disabled || !value.regionCode}
          className={selectClassName}
        >
          <option value="">Select Province</option>
          {provincesForRegion.map((p, idx) => (
            <option key={`${p.prov_code}-${idx}`} value={p.prov_code}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-bold text-dark-5 dark:text-dark-6">
          City / Municipality
        </span>
        <select
          value={value.cityMunCode}
          onChange={handleCity}
          disabled={disabled || !value.provinceCode}
          className={selectClassName}
        >
          <option value="">Select City / Municipality</option>
          {citiesForProvince.map((c, idx) => (
            <option key={`${c.mun_code}-${idx}`} value={c.mun_code}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-bold text-dark-5 dark:text-dark-6">
          Barangay
        </span>
        <select
          value={value.barangayCode}
          onChange={handleBarangay}
          disabled={disabled || !value.cityMunCode}
          className={selectClassName}
        >
          <option value="">Select Barangay</option>
          {barangaysForCity.map((b, idx) => (
            <option key={`${b.brgy_code}-${idx}`} value={b.brgy_code}>
              {b.name}
            </option>
          ))}
        </select>
      </label>

      {value.barangay && value.cityMun && value.province && value.region && (
        <div className="col-span-full rounded-md bg-primary/[0.06] px-3 py-2 text-xs font-semibold text-primary">
          📍 {value.barangay}, {value.cityMun}, {value.province}, {value.region}
        </div>
      )}
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────── */

/** Format a PhAddressValue into a single readable string */
export function formatPhAddress(addr: PhAddressValue): string {
  return [addr.barangay, addr.cityMun, addr.province, addr.region]
    .filter(Boolean)
    .join(", ");
}

/** Parse a formatted address string back into a partial PhAddressValue (display only) */
export function parsePhAddressString(str: string): PhAddressValue {
  const parts = str.split(", ").map((s) => s.trim());

  return {
    barangay: parts[0] ?? "",
    barangayCode: "",
    cityMun: parts[1] ?? "",
    cityMunCode: "",
    province: parts[2] ?? "",
    provinceCode: "",
    region: parts[3] ?? "",
    regionCode: "",
  };
}

function sortByName<T extends GeoItem>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

const selectClassName =
  "min-h-11 w-full rounded-md border border-stroke bg-white px-3 py-2 text-sm font-medium text-dark outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-gray-2 disabled:opacity-60 dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:disabled:bg-dark-2";
