'use client'

import React from 'react'
import TrendChart from './TrendChart'

interface CrimeChartsProps {
  selectedCountries: string[]
  startYear: number
  endYear: number
}

export default function CrimeCharts({ selectedCountries, startYear, endYear }: CrimeChartsProps) {
  return (
    <div className="space-y-6">
      <TrendChart
        indicatorKey="HOMICIDE_RATE"
        selectedCountries={selectedCountries}
        chartType="line"
        startYear={startYear}
        endYear={endYear}
        height={450}
        description="Intentional homicides per 100,000 people. Data from UNODC. Compare how rates diverge dramatically between regions"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          indicatorKey="HOMICIDE_RATE"
          selectedCountries={selectedCountries}
          chartType="bar"
          startYear={Math.max(startYear, 2015)}
          endYear={endYear}
          height={350}
          description="Recent years comparison — bar view for clearer side-by-side analysis"
        />
        <TrendChart
          indicatorKey="MILITARY_SPEND"
          selectedCountries={selectedCountries}
          chartType="area"
          startYear={startYear}
          endYear={endYear}
          height={350}
          description="Military spending as % of GDP — a proxy for security posture"
        />
      </div>
    </div>
  )
}
