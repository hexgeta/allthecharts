'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { COUNTRIES, Country, COUNTRY_COLORS } from '@/hooks/useWorldBankData'
import { X, ChevronDown, Search } from 'lucide-react'

interface CountrySelectorProps {
  selectedCountries: string[]
  onChange: (countries: string[]) => void
  maxSelections?: number
}

// Preset groups
const PRESETS = [
  { label: 'G7', codes: ['US', 'GB', 'DE', 'FR', 'IT', 'CA', 'JP'] },
  { label: 'BRICS', codes: ['BR', 'RU', 'IN', 'CN', 'ZA'] },
  { label: 'EU Big 4', codes: ['DE', 'FR', 'IT', 'ES'] },
  { label: 'English Speaking', codes: ['US', 'GB', 'CA', 'AU', 'NZ', 'IE'] },
  { label: 'Nordics', codes: ['SE', 'NO', 'DK', 'FI'] },
  { label: 'East Asia', codes: ['JP', 'CN', 'KR', 'SG'] },
  { label: 'Americas', codes: ['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO'] },
]

export default function CountrySelector({ selectedCountries, onChange, maxSelections = 12 }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const groupedCountries = useMemo(() => {
    const groups: Record<string, Country[]> = {}
    const filtered = search
      ? COUNTRIES.filter(c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase())
        )
      : COUNTRIES

    filtered.forEach(country => {
      if (!groups[country.region]) groups[country.region] = []
      groups[country.region].push(country)
    })
    return groups
  }, [search])

  const toggleCountry = (code: string) => {
    if (selectedCountries.includes(code)) {
      onChange(selectedCountries.filter(c => c !== code))
    } else if (selectedCountries.length < maxSelections) {
      onChange([...selectedCountries, code])
    }
  }

  const applyPreset = (codes: string[]) => {
    onChange(codes.slice(0, maxSelections))
  }

  return (
    <div className="space-y-3">
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(preset => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset.codes)}
            className="px-3 py-1.5 text-xs rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Selected countries pills */}
      <div className="flex flex-wrap gap-1.5">
        {selectedCountries.map(code => {
          const country = COUNTRIES.find(c => c.code === code)
          if (!country) return null
          return (
            <span
              key={code}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: (COUNTRY_COLORS[code] || '#3B82F6') + '33', border: `1px solid ${COUNTRY_COLORS[code] || '#3B82F6'}66` }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COUNTRY_COLORS[code] || '#3B82F6' }} />
              {country.name}
              <button
                onClick={() => toggleCountry(code)}
                className="ml-0.5 hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )
        })}
      </div>

      {/* Dropdown */}
      <div ref={containerRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-black border border-white/10 rounded-lg text-sm text-gray-300 hover:border-white/20 transition-colors"
        >
          <span>Add countries ({selectedCountries.length}/{maxSelections})</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto">
            {/* Search */}
            <div className="sticky top-0 bg-black/95 p-2 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search countries..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                  autoFocus
                />
              </div>
            </div>

            {Object.entries(groupedCountries).map(([region, countries]: [string, Country[]]) => (
              <div key={region}>
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white/5">
                  {region}
                </div>
                {countries.map(country => {
                  const isSelected = selectedCountries.includes(country.code)
                  const isDisabled = !isSelected && selectedCountries.length >= maxSelections
                  return (
                    <button
                      key={country.code}
                      onClick={() => !isDisabled && toggleCountry(country.code)}
                      disabled={isDisabled}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                        isSelected
                          ? 'text-white bg-white/10'
                          : isDisabled
                          ? 'text-gray-600 cursor-not-allowed'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-6">{country.code}</span>
                        {country.name}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COUNTRY_COLORS[country.code] || '#3B82F6' }} />
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
