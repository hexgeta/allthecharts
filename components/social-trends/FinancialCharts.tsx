'use client'

import React from 'react'
import TrendChart from './TrendChart'

interface FinancialChartsProps {
  selectedCountries: string[]
  startYear: number
  endYear: number
}

export default function FinancialCharts({ selectedCountries, startYear, endYear }: FinancialChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          indicatorKey="GDP_CURRENT"
          selectedCountries={selectedCountries}
          chartType="area"
          startYear={startYear}
          endYear={endYear}
          description="Total economic output in current US dollars"
        />
        <TrendChart
          indicatorKey="GDP_PER_CAPITA"
          selectedCountries={selectedCountries}
          chartType="line"
          startYear={startYear}
          endYear={endYear}
          description="GDP per person adjusted for purchasing power parity"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          indicatorKey="GDP_GROWTH"
          selectedCountries={selectedCountries}
          chartType="line"
          startYear={startYear}
          endYear={endYear}
          description="Year-over-year real GDP growth rate. Notice the 2008 crisis and 2020 COVID crash"
        />
        <TrendChart
          indicatorKey="INFLATION"
          selectedCountries={selectedCountries}
          chartType="line"
          startYear={startYear}
          endYear={endYear}
          description="Consumer price inflation. The 2022 global inflation spike is clearly visible"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          indicatorKey="UNEMPLOYMENT"
          selectedCountries={selectedCountries}
          chartType="line"
          startYear={startYear}
          endYear={endYear}
          description="Percentage of the labor force that is without work. Spikes during recessions"
        />
        <TrendChart
          indicatorKey="GOVT_DEBT"
          selectedCountries={selectedCountries}
          chartType="line"
          startYear={startYear}
          endYear={endYear}
          description="Central government debt as a share of GDP. Rising globally since 2008"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          indicatorKey="GINI"
          selectedCountries={selectedCountries}
          chartType="bar"
          startYear={startYear}
          endYear={endYear}
          height={350}
          description="0 = perfect equality, 100 = maximum inequality. Sparse data — not all years available"
        />
        <TrendChart
          indicatorKey="MILITARY_SPEND"
          selectedCountries={selectedCountries}
          chartType="line"
          startYear={startYear}
          endYear={endYear}
          height={350}
          description="Military expenditure as percentage of GDP. Notice post-Cold War decline"
        />
      </div>
    </div>
  )
}
