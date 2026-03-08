'use client'

import useSWR from 'swr'

// World Bank API indicator codes
export const INDICATORS = {
  // Financial
  GDP_CURRENT: { code: 'NY.GDP.MKTP.CD', name: 'GDP (Current US$)', unit: '$', category: 'financial' },
  GDP_PER_CAPITA: { code: 'NY.GDP.PCAP.PP.CD', name: 'GDP per Capita (PPP)', unit: '$', category: 'financial' },
  GDP_GROWTH: { code: 'NY.GDP.MKTP.KD.ZG', name: 'GDP Growth (Annual %)', unit: '%', category: 'financial' },
  INFLATION: { code: 'FP.CPI.TOTL.ZG', name: 'Inflation Rate (Annual %)', unit: '%', category: 'financial' },
  UNEMPLOYMENT: { code: 'SL.UEM.TOTL.ZS', name: 'Unemployment (% of Labor Force)', unit: '%', category: 'financial' },
  GOVT_DEBT: { code: 'GC.DOD.TOTL.GD.ZS', name: 'Government Debt (% of GDP)', unit: '%', category: 'financial' },
  GINI: { code: 'SI.POV.GINI', name: 'Gini Index (Inequality)', unit: '', category: 'financial' },
  MILITARY_SPEND: { code: 'MS.MIL.XPND.GD.ZS', name: 'Military Spending (% of GDP)', unit: '%', category: 'financial' },

  // Crime & Safety
  HOMICIDE_RATE: { code: 'VC.IHR.PSRC.P5', name: 'Intentional Homicides (per 100k)', unit: '', category: 'crime' },

  // Immigration
  NET_MIGRATION: { code: 'SM.POP.NETM', name: 'Net Migration', unit: '', category: 'immigration' },
  REFUGEE_ORIGIN: { code: 'SM.POP.REFG.OR', name: 'Refugees by Origin', unit: '', category: 'immigration' },
  REFUGEE_ASYLUM: { code: 'SM.POP.REFG', name: 'Refugees by Asylum Country', unit: '', category: 'immigration' },
  INTL_MIGRANT_STOCK: { code: 'SM.POP.TOTL.ZS', name: 'International Migrant Stock (% of Population)', unit: '%', category: 'immigration' },
  POPULATION: { code: 'SP.POP.TOTL', name: 'Total Population', unit: '', category: 'immigration' },
  POP_GROWTH: { code: 'SP.POP.GROW', name: 'Population Growth (Annual %)', unit: '%', category: 'immigration' },

  // Tax
  TAX_REVENUE: { code: 'GC.TAX.TOTL.GD.ZS', name: 'Tax Revenue (% of GDP)', unit: '%', category: 'tax' },
  GOVT_REVENUE: { code: 'GC.REV.XGRT.GD.ZS', name: 'Government Revenue (% of GDP)', unit: '%', category: 'tax' },
  TRADE_TAX: { code: 'GC.TAX.INTT.RV.ZS', name: 'Trade Tax (% of Revenue)', unit: '%', category: 'tax' },
  GOODS_TAX: { code: 'GC.TAX.GSRV.RV.ZS', name: 'Goods & Services Tax (% of Revenue)', unit: '%', category: 'tax' },
  INCOME_TAX: { code: 'GC.TAX.YPKG.RV.ZS', name: 'Income Tax (% of Revenue)', unit: '%', category: 'tax' },
  GOVT_EXPENSE: { code: 'GC.XPN.TOTL.GD.ZS', name: 'Government Expense (% of GDP)', unit: '%', category: 'tax' },
} as const

export type IndicatorKey = keyof typeof INDICATORS

export interface WorldBankDataPoint {
  country: string
  countryCode: string
  year: number
  value: number | null
  indicator: string
}

export interface Country {
  code: string
  name: string
  region: string
}

// Major countries with ISO2 codes grouped by region
export const COUNTRIES: Country[] = [
  // North America
  { code: 'US', name: 'United States', region: 'North America' },
  { code: 'CA', name: 'Canada', region: 'North America' },
  { code: 'MX', name: 'Mexico', region: 'North America' },
  // Europe
  { code: 'GB', name: 'United Kingdom', region: 'Europe' },
  { code: 'DE', name: 'Germany', region: 'Europe' },
  { code: 'FR', name: 'France', region: 'Europe' },
  { code: 'IT', name: 'Italy', region: 'Europe' },
  { code: 'ES', name: 'Spain', region: 'Europe' },
  { code: 'NL', name: 'Netherlands', region: 'Europe' },
  { code: 'SE', name: 'Sweden', region: 'Europe' },
  { code: 'NO', name: 'Norway', region: 'Europe' },
  { code: 'CH', name: 'Switzerland', region: 'Europe' },
  { code: 'PL', name: 'Poland', region: 'Europe' },
  { code: 'AT', name: 'Austria', region: 'Europe' },
  { code: 'BE', name: 'Belgium', region: 'Europe' },
  { code: 'IE', name: 'Ireland', region: 'Europe' },
  { code: 'PT', name: 'Portugal', region: 'Europe' },
  { code: 'GR', name: 'Greece', region: 'Europe' },
  { code: 'DK', name: 'Denmark', region: 'Europe' },
  { code: 'FI', name: 'Finland', region: 'Europe' },
  { code: 'CZ', name: 'Czech Republic', region: 'Europe' },
  { code: 'RO', name: 'Romania', region: 'Europe' },
  { code: 'HU', name: 'Hungary', region: 'Europe' },
  // Asia Pacific
  { code: 'JP', name: 'Japan', region: 'Asia Pacific' },
  { code: 'CN', name: 'China', region: 'Asia Pacific' },
  { code: 'IN', name: 'India', region: 'Asia Pacific' },
  { code: 'KR', name: 'South Korea', region: 'Asia Pacific' },
  { code: 'AU', name: 'Australia', region: 'Asia Pacific' },
  { code: 'NZ', name: 'New Zealand', region: 'Asia Pacific' },
  { code: 'SG', name: 'Singapore', region: 'Asia Pacific' },
  { code: 'ID', name: 'Indonesia', region: 'Asia Pacific' },
  { code: 'TH', name: 'Thailand', region: 'Asia Pacific' },
  { code: 'MY', name: 'Malaysia', region: 'Asia Pacific' },
  { code: 'PH', name: 'Philippines', region: 'Asia Pacific' },
  { code: 'VN', name: 'Vietnam', region: 'Asia Pacific' },
  // South America
  { code: 'BR', name: 'Brazil', region: 'South America' },
  { code: 'AR', name: 'Argentina', region: 'South America' },
  { code: 'CL', name: 'Chile', region: 'South America' },
  { code: 'CO', name: 'Colombia', region: 'South America' },
  { code: 'PE', name: 'Peru', region: 'South America' },
  { code: 'VE', name: 'Venezuela', region: 'South America' },
  // Middle East & Africa
  { code: 'ZA', name: 'South Africa', region: 'Middle East & Africa' },
  { code: 'SA', name: 'Saudi Arabia', region: 'Middle East & Africa' },
  { code: 'AE', name: 'UAE', region: 'Middle East & Africa' },
  { code: 'IL', name: 'Israel', region: 'Middle East & Africa' },
  { code: 'TR', name: 'Turkey', region: 'Middle East & Africa' },
  { code: 'EG', name: 'Egypt', region: 'Middle East & Africa' },
  { code: 'NG', name: 'Nigeria', region: 'Middle East & Africa' },
  { code: 'KE', name: 'Kenya', region: 'Middle East & Africa' },
  // Eastern Europe & Central Asia
  { code: 'RU', name: 'Russia', region: 'Eastern Europe & Central Asia' },
  { code: 'UA', name: 'Ukraine', region: 'Eastern Europe & Central Asia' },
]

// Default set of interesting countries to compare
export const DEFAULT_COUNTRIES = ['US', 'GB', 'DE', 'JP', 'CN', 'BR', 'IN', 'AU']

// Country colors for charts
export const COUNTRY_COLORS: Record<string, string> = {
  US: '#3B82F6', GB: '#EF4444', DE: '#F59E0B', FR: '#8B5CF6', JP: '#EC4899',
  CN: '#EF4444', IN: '#F97316', AU: '#10B981', CA: '#6366F1', BR: '#22C55E',
  MX: '#14B8A6', IT: '#06B6D4', ES: '#F43F5E', KR: '#A855F7', ZA: '#84CC16',
  RU: '#64748B', NL: '#FF6B35', SE: '#0EA5E9', NO: '#D946EF', CH: '#F472B6',
  PL: '#FB923C', AT: '#34D399', BE: '#818CF8', IE: '#2DD4BF', PT: '#FCD34D',
  GR: '#60A5FA', DK: '#C084FC', FI: '#4ADE80', CZ: '#FB7185', RO: '#FBBF24',
  HU: '#A78BFA', NZ: '#38BDF8', SG: '#F87171', ID: '#FACC15', TH: '#4ADE80',
  MY: '#2DD4BF', PH: '#F472B6', VN: '#FCA5A5', AR: '#93C5FD', CL: '#86EFAC',
  CO: '#FDE68A', PE: '#C4B5FD', VE: '#67E8F9', SA: '#34D399', AE: '#818CF8',
  IL: '#60A5FA', TR: '#FB923C', EG: '#FCD34D', NG: '#4ADE80', KE: '#F87171',
  UA: '#38BDF8',
}

// Fallback color for unknown countries
const getCountryColor = (code: string, index: number): string => {
  if (COUNTRY_COLORS[code]) return COUNTRY_COLORS[code]
  const fallbackColors = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4']
  return fallbackColors[index % fallbackColors.length]
}

export { getCountryColor }

// Fetcher for World Bank API
async function fetchWorldBankData(
  indicatorCode: string,
  countryCodes: string[],
  startYear: number = 1990,
  endYear: number = 2024
): Promise<WorldBankDataPoint[]> {
  const countryStr = countryCodes.join(';')
  const url = `https://api.worldbank.org/v2/country/${countryStr}/indicator/${indicatorCode}?date=${startYear}:${endYear}&format=json&per_page=15000`

  const response = await fetch(url)
  if (!response.ok) throw new Error(`API error: ${response.status}`)

  const json = await response.json()

  // World Bank API returns [metadata, data[]]
  if (!json || !json[1]) return []

  return json[1]
    .filter((item: any) => item.value !== null)
    .map((item: any) => ({
      country: item.country.value,
      countryCode: item.countryiso2code || item.country.id,
      year: parseInt(item.date),
      value: item.value,
      indicator: item.indicator.id,
    }))
    .sort((a: WorldBankDataPoint, b: WorldBankDataPoint) => a.year - b.year)
}

// SWR key builder
function buildKey(indicatorCode: string, countryCodes: string[], startYear: number, endYear: number) {
  return `worldbank:${indicatorCode}:${countryCodes.sort().join(',')}:${startYear}:${endYear}`
}

// Main hook for fetching World Bank data
export function useWorldBankIndicator(
  indicatorKey: IndicatorKey,
  countryCodes: string[],
  startYear: number = 1990,
  endYear: number = 2024
) {
  const indicator = INDICATORS[indicatorKey]

  const { data, error, isLoading } = useSWR(
    countryCodes.length > 0 ? buildKey(indicator.code, countryCodes, startYear, endYear) : null,
    () => fetchWorldBankData(indicator.code, countryCodes, startYear, endYear),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000 * 60, // 1 hour dedup
      keepPreviousData: true,
    }
  )

  return {
    data: data || [],
    error,
    isLoading,
    indicator,
  }
}

// Hook for fetching multiple indicators at once
export function useMultipleIndicators(
  indicatorKeys: IndicatorKey[],
  countryCodes: string[],
  startYear: number = 1990,
  endYear: number = 2024
) {
  const results = indicatorKeys.map(key => {
    const indicator = INDICATORS[key]
    const { data, error, isLoading } = useSWR(
      countryCodes.length > 0 ? buildKey(indicator.code, countryCodes, startYear, endYear) : null,
      () => fetchWorldBankData(indicator.code, countryCodes, startYear, endYear),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 60000 * 60,
        keepPreviousData: true,
      }
    )
    return { key, data: data || [], error, isLoading, indicator }
  })

  return {
    results,
    isLoading: results.some(r => r.isLoading),
    hasError: results.some(r => r.error),
  }
}

// Transform data into chart-ready format (year on x-axis, countries as series)
export function transformToChartData(
  data: WorldBankDataPoint[],
  countryCodes: string[]
): Array<Record<string, any>> {
  const yearMap = new Map<number, Record<string, any>>()

  data.forEach(point => {
    if (!yearMap.has(point.year)) {
      yearMap.set(point.year, { year: point.year })
    }
    const entry = yearMap.get(point.year)!
    // Use country code as the key
    const country = COUNTRIES.find(c => c.code === point.countryCode || c.name === point.country)
    if (country) {
      entry[country.code] = point.value
    }
  })

  return Array.from(yearMap.values()).sort((a, b) => a.year - b.year)
}
