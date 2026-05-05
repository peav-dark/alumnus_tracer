declare module "phil-reg-prov-mun-brgy" {
  type Region = { name: string; reg_code: string };
  type Province = { name: string; prov_code: string; reg_code: string };
  type CityMun = { name: string; mun_code: string; prov_code: string };
  type Barangay = { name: string; brgy_code: string; mun_code: string };

  export const regions: Region[];
  export const provinces: Province[];
  export const city_mun: CityMun[];
  export const barangays: Barangay[];

  export function getProvincesByRegion(regCode: string): Province[];
  export function getCityMunByProvince(provCode: string): CityMun[];
  export function getBarangayByMun(munCode: string): Barangay[];
}
