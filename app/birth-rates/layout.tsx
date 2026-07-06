import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Why Birth Rates Are Falling Everywhere | AllTheCharts',
  description:
    'Interactive charts of global fertility and birth rates, rebuilt from World Bank data, exploring the theory that smartphones and mobile internet drove the worldwide decline.',
  keywords:
    'birth rates, fertility rate, declining birth rates, smartphones fertility, demographics, replacement rate, world bank fertility data, population decline',
  openGraph: {
    title: 'Why Birth Rates Are Falling Everywhere at Once',
    description:
      'Global fertility began sliding at strikingly similar moments — clustering around the arrival of smartphones. Explore the data.',
    url: 'https://www.allthecharts.xyz/birth-rates',
    type: 'article',
  },
}

export default function BirthRatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
