'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CountrySelector from '@/components/social-trends/CountrySelector'
import FinancialCharts from '@/components/social-trends/FinancialCharts'
import CrimeCharts from '@/components/social-trends/CrimeCharts'
import ImmigrationCharts from '@/components/social-trends/ImmigrationCharts'
import TaxCharts from '@/components/social-trends/TaxCharts'
import { DEFAULT_COUNTRIES } from '@/hooks/useWorldBankData'
import { TrendingUp, Shield, Users, Receipt, Calendar } from 'lucide-react'

type Category = 'financial' | 'crime' | 'immigration' | 'tax'

const CATEGORIES: { key: Category; label: string; icon: React.ReactNode; description: string }[] = [
  { key: 'financial', label: 'Financial', icon: <TrendingUp className="w-4 h-4" />, description: 'GDP, inflation, unemployment, debt & inequality' },
  { key: 'crime', label: 'Crime & Safety', icon: <Shield className="w-4 h-4" />, description: 'Homicide rates, military spending' },
  { key: 'immigration', label: 'Immigration', icon: <Users className="w-4 h-4" />, description: 'Migration flows, refugees, population' },
  { key: 'tax', label: 'Tax & Spending', icon: <Receipt className="w-4 h-4" />, description: 'Tax revenue, government spending by type' },
]

const YEAR_RANGES = [
  { label: '1990-2024', start: 1990, end: 2024 },
  { label: '2000-2024', start: 2000, end: 2024 },
  { label: '2010-2024', start: 2010, end: 2024 },
  { label: '2015-2024', start: 2015, end: 2024 },
]

export default function SocialTrendsPage() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(DEFAULT_COUNTRIES)
  const [activeCategory, setActiveCategory] = useState<Category>('financial')
  const [yearRange, setYearRange] = useState({ start: 2000, end: 2024 })

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-black to-black" />
        <div className="relative max-w-7xl mx-auto px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3"
          >
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
              Global Social Trends
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Explore financial, crime, immigration, and tax data across 50+ countries.
              Powered by World Bank Open Data.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
        {/* Controls */}
        <Card className="bg-black/40 border-gray-800 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <span>Select Countries</span>
              <span className="text-xs text-gray-500 font-normal">Up to 12</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Choose preset groups or pick individual countries to compare
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CountrySelector
              selectedCountries={selectedCountries}
              onChange={setSelectedCountries}
              maxSelections={12}
            />
          </CardContent>
        </Card>

        {/* Year range + Category tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat.key
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {cat.icon}
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Year range selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            {YEAR_RANGES.map(range => (
              <button
                key={range.label}
                onClick={() => setYearRange({ start: range.start, end: range.end })}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  yearRange.start === range.start
                    ? 'bg-white/10 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category description */}
        <div className="text-sm text-gray-500">
          {CATEGORIES.find(c => c.key === activeCategory)?.description}
        </div>

        {/* Charts */}
        {selectedCountries.length === 0 ? (
          <Card className="bg-black/20 border-gray-800">
            <CardContent className="py-16 text-center">
              <p className="text-gray-500 text-lg">Select at least one country to view charts</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeCategory === 'financial' && (
              <FinancialCharts
                selectedCountries={selectedCountries}
                startYear={yearRange.start}
                endYear={yearRange.end}
              />
            )}
            {activeCategory === 'crime' && (
              <CrimeCharts
                selectedCountries={selectedCountries}
                startYear={yearRange.start}
                endYear={yearRange.end}
              />
            )}
            {activeCategory === 'immigration' && (
              <ImmigrationCharts
                selectedCountries={selectedCountries}
                startYear={yearRange.start}
                endYear={yearRange.end}
              />
            )}
            {activeCategory === 'tax' && (
              <TaxCharts
                selectedCountries={selectedCountries}
                startYear={yearRange.start}
                endYear={yearRange.end}
              />
            )}
          </motion.div>
        )}

        {/* Data Sources */}
        <Card className="bg-black/20 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Data Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-col space-y-1.5 text-sm">
              <a
                href="https://data.worldbank.org/indicator"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                World Bank Open Data — World Development Indicators
              </a>
              <p className="text-gray-500 text-xs">
                GDP, inflation, unemployment, government debt, Gini index, military expenditure,
                homicide rates, migration data, refugee statistics, tax revenue, and government spending.
                Data is updated annually by the World Bank from official national and international sources.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
