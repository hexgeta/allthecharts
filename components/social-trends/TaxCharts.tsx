'use client'

import React from 'react'
import TrendChart from './TrendChart'

interface TaxChartsProps {
  selectedCountries: string[]
  startYear: number
  endYear: number
}

export default function TaxCharts({ selectedCountries, startYear, endYear }: TaxChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          indicatorKey="TAX_REVENUE"
          selectedCountries={selectedCountries}
          chartType="line"
          startYear={startYear}
          endYear={endYear}
          description="Total tax revenue as share of GDP. Scandinavian countries typically highest"
        />
        <TrendChart
          indicatorKey="GOVT_REVENUE"
          selectedCountries={selectedCountries}
          chartType="line"
          startYear={startYear}
          endYear={endYear}
          description="Total government revenue excluding grants, as share of GDP"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          indicatorKey="INCOME_TAX"
          selectedCountries={selectedCountries}
          chartType="line"
          startYear={startYear}
          endYear={endYear}
          description="Income, profits and capital gains taxes as percentage of total revenue"
        />
        <TrendChart
          indicatorKey="GOODS_TAX"
          selectedCountries={selectedCountries}
          chartType="line"
          startYear={startYear}
          endYear={endYear}
          description="Taxes on goods and services (VAT/GST) as percentage of total revenue"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          indicatorKey="TRADE_TAX"
          selectedCountries={selectedCountries}
          chartType="line"
          startYear={startYear}
          endYear={endYear}
          description="Taxes on international trade as share of revenue. Declining globally due to trade liberalization"
        />
        <TrendChart
          indicatorKey="GOVT_EXPENSE"
          selectedCountries={selectedCountries}
          chartType="area"
          startYear={startYear}
          endYear={endYear}
          description="Total government spending as percentage of GDP. Spikes during crises (2008, 2020)"
        />
      </div>
    </div>
  )
}
