'use client'

import React from 'react'
import TrendChart from './TrendChart'

interface ImmigrationChartsProps {
  selectedCountries: string[]
  startYear: number
  endYear: number
}

export default function ImmigrationCharts({ selectedCountries, startYear, endYear }: ImmigrationChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          indicatorKey="NET_MIGRATION"
          selectedCountries={selectedCountries}
          chartType="bar"
          startYear={startYear}
          endYear={endYear}
          description="Net migration (immigrants minus emigrants) per 5-year period. Positive = net inflow"
        />
        <TrendChart
          indicatorKey="INTL_MIGRANT_STOCK"
          selectedCountries={selectedCountries}
          chartType="line"
          startYear={startYear}
          endYear={endYear}
          description="Foreign-born population as percentage of total population"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          indicatorKey="REFUGEE_ASYLUM"
          selectedCountries={selectedCountries}
          chartType="area"
          startYear={startYear}
          endYear={endYear}
          description="Number of refugees hosted by each country. Major spikes from Syrian crisis (2015+) and Ukraine (2022+)"
        />
        <TrendChart
          indicatorKey="REFUGEE_ORIGIN"
          selectedCountries={selectedCountries}
          chartType="area"
          startYear={startYear}
          endYear={endYear}
          description="Number of refugees originating from each country"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          indicatorKey="POPULATION"
          selectedCountries={selectedCountries}
          chartType="area"
          startYear={startYear}
          endYear={endYear}
          description="Total population. India overtook China in 2023"
        />
        <TrendChart
          indicatorKey="POP_GROWTH"
          selectedCountries={selectedCountries}
          chartType="line"
          startYear={startYear}
          endYear={endYear}
          description="Annual population growth rate. Many developed nations trending toward zero or negative"
        />
      </div>
    </div>
  )
}
