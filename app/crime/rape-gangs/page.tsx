'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, ExternalLink } from 'lucide-react'
import {
  C, ChartCard, StatCard, HBarChart, GroupedBarChart, DonutChart, QuoteWall,
} from '@/components/rape-gangs/ChartKit'

const REPORT_URL =
  'https://static1.squarespace.com/static/6810978a41bbc42489eafa81/t/6a314bb1151e511944bd4421/1781615537601/The+Rape+Gang+Inquiry+Report.pdf'

/* =================================================================== */
/*  Data — every figure below is reproduced as presented in            */
/*  "The Rape Gang Inquiry Report" (Rupert Lowe MP, 2025).             */
/* =================================================================== */

// UK reported rape offences — endpoints only (ONS / police recorded crime)
const ukRape = [
  { name: '2000', value: 8593 },
  { name: '2025', value: 70000 },
]

// Reported rape offences, UK vs Poland (2000 → latest)
const ukVsPoland = [
  { name: '2000', UK: 8593, Poland: 2399 },
  { name: 'Latest', UK: 70000, Poland: 1127 },
]

// Rapes per 100,000 residents
const perCapita = [
  { name: 'United Kingdom', value: 100, color: C.red },
  { name: 'Poland', value: 3, color: C.slate },
]

// Offender share vs population baseline — the central overrepresentation claim
const overrep = [
  { name: 'Hargey estimate — gang members', value: 95, color: C.red },
  { name: 'Grooming-gang case reviews', value: 90, color: C.red },
  { name: 'McLoughlin / "Easy Meat"', value: 87, color: C.rose },
  { name: 'Muslim share of UK population', value: 6, color: C.slate },
  { name: 'Pakistani share of UK population', value: 2.1, color: C.slate },
]

// Quilliam Foundation analysis of 264 convictions, 2005–2017
const quilliam = [
  { name: 'South Asian', value: 84, color: C.amber },
  { name: 'Black', value: 8, color: C.purple },
  { name: 'White', value: 7, color: C.slate },
]

// Forced Marriage Unit — focus country, 2023 (280 cases recorded)
const forcedMarriage = [
  { name: 'Pakistan', value: 45, color: C.red },
  { name: 'Other / not recorded', value: 27, color: C.slate },
  { name: 'Bangladesh', value: 13, color: C.amber },
  { name: 'Afghanistan', value: 7, color: C.rose },
  { name: 'India', value: 3, color: C.purple },
  { name: 'Somalia', value: 3, color: C.blue },
  { name: 'Nigeria', value: 2, color: C.emerald },
]

// Scale across inquiries, reviews and the national extrapolation
const scale = [
  { name: 'National estimate (min.)', value: 250000, color: C.amber },
  { name: 'CSE victims, England / yr', value: 19000, color: C.rose },
  { name: 'Suspected members', value: 13000, color: C.amber },
  { name: 'Met Police review', value: 9000, color: C.red },
  { name: 'Rotherham (Jay Report)', value: 1400, color: C.blue },
  { name: 'Telford Inquiry', value: 1000, color: C.blue },
]

// Sentencing, in years
const sentencing = [
  { name: 'Rape-gang (low end)', value: 4, color: C.red },
  { name: 'Rape-gang (high end)', value: 12, color: C.red },
  { name: 'Proposed: participant', value: 25, color: C.emerald },
  { name: 'Osborne van attack', value: 43, color: C.slate },
  { name: 'Proposed: ringleader', value: 50, color: C.emerald },
]

// Geographic footprint
const footprint = [
  { name: 'Districts affected', value: 40, color: C.red },
  { name: 'Not recorded', value: 60, color: C.slate },
]

// Notable quotations reproduced verbatim from the report
const quotes = [
  {
    text: 'If we extrapolate nationally the Jay report on Rotherham and other reports from Telford and Oxford, there appear to have been upwards of 250,000 young white girls raped in this century, very largely by Muslim men, usually several times a day for years.',
    source: 'Lord Pearson of Rannoch, House of Lords (2019) — origin of the 250,000 figure',
  },
  {
    text: 'It is simply not possible to know the scale — because ethnicity, group offending and historical cases were routinely unrecorded or shelved to protect ‘community cohesion.’',
    source: 'IICSA & local inquiries (2022–2025), as summarised in the report',
  },
  {
    text: '98% of them were Pakistani Muslim. If not, they were Iraqi Muslim or Kurdish.',
    source: '‘Michelle’, survivor — on her abusers',
  },
  {
    text: 'She describes an extensive network of abusers operating across the entire country, calling it ‘industrial’ in scale.',
    source: 'The report, on survivor ‘Michelle’s’ testimony',
  },
  {
    text: 'You can’t describe them as Asian men because that’s racist. You should just be glad your child is being taught a different culture.',
    source: 'Police call handler, to a missing girl’s mother',
  },
  {
    text: 'White British people were described as ‘white trash,’ and white girls as ‘English pig-dogs.’ They boasted of receiving ‘free money’ from the British state.',
    source: '‘Jen’, survivor — on the perpetrators’ attitudes',
  },
  {
    text: 'I will never forget being told by police officers that if she carried on as she was, she would end up either dead or raped. Despite saying this, they did not recognise her as a victim.',
    source: 'Parent of a survivor',
  },
  {
    text: 'On the day of the trial, we were told the case had been dropped. We were told only that the perpetrator had a very good solicitor. No written explanation was ever provided.',
    source: 'Parent of a survivor',
  },
  {
    text: 'In 2022, my daughters found their sister deceased in her flat. She was 33 years old. She died alone. I believe that the grooming, rape, institutional failures and collapse of the justice process directly contributed to my daughter’s death.',
    source: 'Parent of a survivor',
  },
  {
    text: 'The FMU does not record data on religion; no major faith in the UK advocates forced marriage.',
    source: 'Forced Marriage Unit statement — quoted, and challenged, in the report',
  },
  {
    text: 'I want the institutions to say: we hold our hands up, we believe you and we’re sorry. I gave up getting justice a long time ago, but just for it to be recognised and believed, that’s all I want.',
    source: 'Rape gang survivor',
  },
  {
    text: 'I feel sick knowing that it’s still going on — that nobody’s wanting to do anything about it even now in 2026. We’re still having this conversation.',
    source: 'Rape gang survivor',
  },
  {
    text: 'The worst people that exist in this situation, apart from the perpetrators of that horrendous abuse, are the people that sat in those positions within those authorities that had every opportunity to do something about it and chose not to.',
    source: 'Rape gang survivor',
  },
  {
    text: 'If I can save just even one more child, girl or boy, from going through any of this, then I’ve done my job.',
    source: '‘Chloe’, survivor',
  },
]

export default function RapeGangsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-5 md:px-6 py-10 space-y-8">

        {/* ---------------- Header ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 pt-2"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">The Rape Gang Inquiry</h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            The key statistics from the independent inquiry into group-based child sexual
            exploitation in Britain, visualised.
          </p>
          <a
            href={REPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Read the full report (PDF)
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </motion.div>

        {/* ---------------- Headline stat cards ---------------- */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard value={250000} suffix="+" accent="text-red-400" label="Estimated victims" note="National minimum extrapolation" delay={0} />
          <StatCard value={149} label="Districts affected" note="≈ 40% of all UK local-authority districts" accent="text-amber-400" delay={0.05} />
          <StatCard value={87} suffix="%" label="Convictions with distinctively Muslim names" note="vs ~6% of the UK population" accent="text-red-400" delay={0.1} />
          <StatCard value={800} prefix="+" suffix="%" label="Rise in UK rape offences since 2000" note="8,593 → 70,000+ recorded offences" accent="text-rose-400" delay={0.15} />
          <StatCard value={20000} suffix="+" label="Submissions to the Inquiry" note="Survivors, families & witnesses" accent="text-white" delay={0.2} />
          <StatCard value={1955} format={{ useGrouping: false }} label="First recorded case" note="Four Bradford men, a 15-year-old victim" accent="text-slate-300" delay={0.25} />
        </div>

        {/* ---------------- Scale ---------------- */}
        <ChartCard
          title="The scale of the phenomenon"
          description="Confirmed counts from major inquiries and reviews, against the report's national extrapolation."
          tag="mixed"
          source="Jay Report (2014); Telford Inquiry (2022); Met Police; The Independent; national estimate per the report"
        >
          <HBarChart data={scale} nameWidth={160} height={300} />
          <p className="mt-3 text-xs text-gray-500">
            The 250,000 figure originates from a 2019 House of Lords statement and is described in the
            report itself as &ldquo;not a precise count&rdquo; — an extrapolation, shown here in amber.
          </p>
        </ChartCard>

        {/* ---------------- Overrepresentation (central claim) ---------------- */}
        <ChartCard
          title="Offenders vs the population"
          description="Estimated share of grooming-gang convictions with distinctively Muslim names, against the Muslim and Pakistani share of the UK population."
          tag="cited"
          source="P. McLoughlin, Easy Meat (2016); Dr Taj Hargey; 2021 Census for England & Wales — as cited in the report"
        >
          <HBarChart data={overrep} unit="%" nameWidth={200} height={300} domain={[0, 100]} />
          <p className="mt-3 text-xs text-gray-500">
            Conviction shares (red) and population baselines (grey) are both as cited in the report.
          </p>
        </ChartCard>

        {/* ---------------- UK vs Poland rape trend ---------------- */}
        <div className="grid md:grid-cols-2 gap-6">
          <ChartCard
            title="Reported rape offences: UK vs Poland"
            description="Recorded offences in 2000 and the latest available year."
            tag="official"
            source="ONS (UK); Polish national police / Statista (Poland) — as cited in the report"
          >
            <GroupedBarChart
              data={ukVsPoland}
              series={[
                { key: 'UK', name: 'United Kingdom', color: C.red },
                { key: 'Poland', name: 'Poland', color: C.slate },
              ]}
              height={300}
            />
          </ChartCard>

          <ChartCard
            title="Rapes per 100,000 residents"
            description="Approximate recent per-capita rate, as cited in the report."
            tag="official"
            source="ONS (UK); Polish national police, ~38m population — as cited in the report"
          >
            <HBarChart data={perCapita} nameWidth={140} height={300} />
            <p className="mt-3 text-xs text-gray-500">
              The report attributes the UK&rsquo;s divergence to immigration patterns since 1997.
            </p>
          </ChartCard>
        </div>

        {/* ---------------- UK rape trend endpoints ---------------- */}
        <ChartCard
          title="UK reported rape offences, 2000 → 2025"
          description="Police recorded rape offences in England & Wales, start and end points."
          tag="official"
          source="ONS, Sexual offences in England & Wales (YE March 2025) — as cited in the report"
        >
          <GroupedBarChart
            data={ukRape.map((d) => ({ name: d.name, Offences: d.value }))}
            series={[{ key: 'Offences', name: 'Recorded rape offences', color: C.rose }]}
            legend={false}
            height={300}
          />
          <p className="mt-3 text-xs text-gray-500">
            A rise exceeding 800%, even after accounting for ~15% population growth over the period. Only
            the two endpoints are given in the report; intermediate years are not shown.
          </p>
        </ChartCard>

        {/* ---------------- Offender ethnicity + Forced marriage ---------------- */}
        <div className="grid md:grid-cols-2 gap-6">
          <ChartCard
            title="Offender ethnicity"
            description="Quilliam Foundation analysis of 264 grooming-gang convictions, 2005–2017."
            tag="cited"
            source="Quilliam Foundation, Group-Based Child Sexual Exploitation (2017) — as cited in the report"
          >
            <DonutChart data={quilliam} unit="%" height={320} centerValue="84%" centerLabel="South Asian" />
          </ChartCard>

          <ChartCard
            title="Forced marriage by focus country (2023)"
            description="Share of the 280 Forced Marriage Unit cases where a focus country was recorded."
            tag="official"
            source="Forced Marriage Unit statistics (Home Office / FCDO), 2023 — as cited in the report"
          >
            <HBarChart data={forcedMarriage} unit="%" nameWidth={150} height={320} domain={[0, 50]} />
          </ChartCard>
        </div>

        {/* ---------------- Sentencing ---------------- */}
        <ChartCard
          title="Sentencing: what is, and what the report proposes"
          description="Typical rape-gang tariffs against a comparator case and the report's proposed minimums (years)."
          tag="mixed"
          source="Quilliam analysis of 264 convictions; R v Osborne (2018); Rape Gang Inquiry Report recommendations"
        >
          <HBarChart data={sentencing} unit=" yrs" nameWidth={170} height={300} />
          <p className="mt-3 text-xs text-gray-500">
            Rape-gang sentences (red) typically run 4–12 years, with offenders often serving a third to half.
            The report proposes life sentences with 50-year (ringleader) and 25-year (participant) minimums (green);
            the 43-year tariff for the 2017 Finsbury Park van attack is shown for comparison.
          </p>
        </ChartCard>

        {/* ---------------- Geographic footprint ---------------- */}
        <ChartCard
          title="Geographic footprint"
          description="Local-authority districts where the same pattern of abuse was found."
          tag="report"
          source="Rape Gang Inquiry Report — 149 of ~373 UK districts"
        >
          <DonutChart data={footprint} unit="%" height={320} centerValue="149" centerLabel="districts (~40%)" />
        </ChartCard>

        {/* ---------------- Quotes ---------------- */}
        <div className="space-y-5 pt-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">In their words</h2>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Quotations reproduced from the report — survivors, their families, officials and the
              inquiry itself. Some testimony is distressing.
            </p>
          </div>
          <QuoteWall quotes={quotes} />
        </div>

        {/* ---------------- Sources ---------------- */}
        <Card className="bg-black/20 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Primary sources</CardTitle>
            <CardDescription className="text-gray-400">
              The report and the underlying datasets it cites. Figures on this page are not independently verified.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5 text-sm">
              {[
                ['The Rape Gang Inquiry Report (Rupert Lowe MP, 2025)', REPORT_URL],
                ['ONS — Sexual offences in England and Wales (YE March 2025)', 'https://www.ons.gov.uk/peoplepopulationandcommunity/crimeandjustice/articles/sexualoffencesinenglandandwalesoverview/latest'],
                ['2021 Census for England and Wales (ONS)', 'https://www.ons.gov.uk/census'],
                ['Forced Marriage Unit statistics (GOV.UK)', 'https://www.gov.uk/government/collections/forced-marriage-unit-statistics'],
                ['Quilliam — Group-Based Child Sexual Exploitation (2017)', 'https://www.google.com/search?q=Quilliam+Group-Based+Child+Sexual+Exploitation+Dissecting+Grooming+Gangs'],
                ['Statista — Number of rapes in Poland, 1999–2023', 'https://www.statista.com/statistics/1090506/poland-number-of-rapes/'],
                ['Independent Inquiry into CSE in Rotherham (Jay Report, 2014)', 'https://www.rotherham.gov.uk/downloads/file/279/independent-inquiry-into-child-sexual-exploitation-in-rotherham-1997-2013'],
              ].map(([label, url]) => (
                <li key={url} className="flex items-start gap-2">
                  <span className="text-gray-600 mt-1">→</span>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-600 pb-4">
          Visualisation by{' '}
          <a href="https://x.com/hexgeta" target="_blank" rel="noopener noreferrer" className="text-blue-400/70 hover:text-blue-300">@hexgeta</a>
          {' '}· Charts reproduce figures as published; they do not constitute endorsement of the report&rsquo;s conclusions.
        </p>
      </div>
    </div>
  )
}
