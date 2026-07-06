'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CountrySelector from '@/components/social-trends/CountrySelector'
import FertilityChart from '@/components/birth-rates/FertilityChart'
import { type IndicatorKey } from '@/hooks/useWorldBankData'
import { Calendar, Baby } from 'lucide-react'

// The set of countries the FT piece walks through, ordered roughly by when
// their birth rates started to slide. Legible as a default; users can change it.
const DEFAULT_COUNTRIES = ['US', 'GB', 'AU', 'FR', 'PL', 'MX', 'ID', 'NG']

const YEAR_RANGES = [
  { label: 'Since 1960', start: 1960, end: 2023 },
  { label: 'Since 1990', start: 1990, end: 2023 },
  { label: 'Since 2005', start: 2005, end: 2023 },
]

// Curated set for the "long view" exhibit: countries whose fertility fell
// dramatically — and mostly before smartphones existed.
const LONGRUN_COUNTRIES = ['KR', 'MX', 'ID', 'BR', 'US', 'NG']

const METRICS: { key: IndicatorKey; label: string; blurb: string; replacement: boolean }[] = [
  {
    key: 'FERTILITY_RATE',
    label: 'Fertility rate',
    blurb: 'Average number of children a woman is expected to have over her lifetime. 2.1 is roughly the level needed to keep a population stable without migration.',
    replacement: true,
  },
  {
    key: 'BIRTH_RATE',
    label: 'Birth rate',
    blurb: 'Live births per 1,000 people per year — the crude birth rate.',
    replacement: false,
  },
  {
    key: 'ADOLESCENT_FERTILITY',
    label: 'Teen fertility',
    blurb: 'Births per 1,000 women aged 15–19. Critics of the smartphone theory note the sharpest, clearest declines show up among teenagers.',
    replacement: false,
  },
]

const KEY_FACTS = [
  {
    stat: '2 in 3',
    label: 'of the world’s countries now have fertility below the 2.1 replacement rate',
  },
  {
    stat: '~2007–2015',
    label: 'window in which many countries’ birth rates began falling markedly — tracking the arrival of smartphones and fast mobile internet',
  },
  {
    stat: 'Fewer couples',
    label: 'the main driver is fewer partnerships forming, more than couples choosing to have fewer children',
  },
]

export default function BirthRatesPage() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(DEFAULT_COUNTRIES)
  const [yearRange, setYearRange] = useState({ start: 2000, end: 2023 })
  const [metricKey, setMetricKey] = useState<IndicatorKey>('FERTILITY_RATE')

  const metric = METRICS.find(m => m.key === metricKey)!

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
        <div className="relative max-w-7xl mx-auto px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3"
          >
            <div className="flex items-center justify-center gap-2 text-purple-300/80 text-sm font-medium">
              <Baby className="w-4 h-4" />
              <span>Demographics</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              Why birth rates are falling everywhere at once
            </h1>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Across rich and poor countries alike, fertility began sliding within a few years of each
              other — clustering around the moment smartphones and fast mobile internet arrived. Explore the
              raw fertility data behind the debate, rebuilt from World Bank figures.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
        {/* Key facts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {KEY_FACTS.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card className="bg-black/40 border-gray-800 h-full">
                <CardContent className="py-5">
                  <div className="text-2xl font-bold text-purple-300">{f.stat}</div>
                  <div className="text-sm text-gray-400 mt-1.5 leading-snug">{f.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <Card className="bg-black/40 border-gray-800 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <span>Compare countries</span>
              <span className="text-xs text-gray-500 font-normal">Up to 12</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CountrySelector
              selectedCountries={selectedCountries}
              onChange={setSelectedCountries}
              maxSelections={12}
            />
          </CardContent>
        </Card>

        {/* Metric + year range */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => setMetricKey(m.key)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  metricKey === m.key
                    ? 'bg-white/10 text-white border-white/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

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

        <div className="text-sm text-gray-500">{metric.blurb}</div>

        {/* Chart */}
        {selectedCountries.length === 0 ? (
          <Card className="bg-black/20 border-gray-800">
            <CardContent className="py-16 text-center">
              <p className="text-gray-500 text-lg">Select at least one country to view the chart</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            key={metricKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FertilityChart
              indicatorKey={metricKey}
              selectedCountries={selectedCountries}
              startYear={yearRange.start}
              endYear={yearRange.end}
              showReplacementLine={metric.replacement}
              smartphoneBand={{ from: 2007, to: 2015 }}
              description="Shaded band marks the rollout of smartphones and fast mobile internet (2007–2015)."
            />
          </motion.div>
        )}

        {/* Long view: the decline predates smartphones */}
        <div className="pt-4 space-y-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              The long view: this decline is decades old
            </h2>
            <p className="text-sm text-gray-400 mt-1.5 max-w-3xl leading-relaxed">
              Zoom out to 1960 and the shaded “smartphone era” shrinks to a thin sliver at the right-hand
              edge. In Korea, Mexico, Indonesia and Brazil, roughly <span className="text-purple-300 font-medium">90%</span> of
              the total fall in fertility had already happened <span className="text-white">before</span> smartphones existed.
              Whatever phones did, they arrived late to a decline that was already most of the way done —
              which is why a single time-series can’t tell you smartphones caused it.
            </p>
          </div>
          <FertilityChart
            indicatorKey="FERTILITY_RATE"
            selectedCountries={LONGRUN_COUNTRIES}
            startYear={1960}
            endYear={2023}
            height={440}
            showReplacementLine
            smartphoneBand={{ from: 2007, to: 2015 }}
            title="Fertility rate since 1960"
            description="High-fertility countries fell toward (or below) replacement decades before the smartphone era began."
          />
        </div>

        {/* Context */}
        <Card className="bg-black/20 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">What the chart shows — and the debate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-400 leading-relaxed">
            <p>
              A Financial Times analysis by John Burn-Murdoch argued that fertility across very different
              countries began declining at strikingly similar moments — the US, UK and Australia from around
              2007; France and Poland from about 2009; Mexico and Indonesia from around 2012; and several
              West African countries from 2013–2015. The common thread it pointed to was the spread of
              smartphones and social media reshaping how young people spend time, form relationships and
              partner up.
            </p>
            <p>
              A supporting working paper by Nathan Hudson and Hernán Moscoso-Boedo (University of Cincinnati)
              tracked the rollout of 4G networks in the US and UK and found that areas wired for fast mobile
              internet earliest saw birth rates fall earliest and furthest.
            </p>
            <p>
              The thesis is contested. Critics point out that fertility was already in long-run decline before
              smartphones, that the effect looks concentrated among teenagers (visible in the “Teen fertility”
              view above), and that correlation with technology rollout is not proof of cause. Switch metrics
              and countries above and judge the pattern for yourself.
            </p>
          </CardContent>
        </Card>

        {/* Sources */}
        <Card className="bg-black/20 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex flex-col space-y-2">
              <a
                href="https://data.worldbank.org/indicator/SP.DYN.TFRT.IN"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                World Bank Open Data — Fertility rate, total (births per woman) & related indicators
              </a>
              <a
                href="https://www.ft.com/content/fba35eca-df3a-4ad6-b42d-eb08eb7c9ad3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Financial Times — “Why birth rates are falling everywhere all at once” (John Burn-Murdoch)
              </a>
              <p className="text-gray-500 text-xs">
                Charts on this page are rebuilt independently from public World Bank data; the FT article is
                cited as the source of the smartphone-timing thesis. The shaded 2007–2015 band is an
                illustrative marker of the smartphone / mobile-internet rollout, not a World Bank series.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
