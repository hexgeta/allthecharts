'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, ExternalLink, AlertTriangle } from 'lucide-react'
import {
  C, ChartCard, StatCard, HBarChart, GroupedBarChart, DonutChart, QuoteWall, ProfileWall,
} from '@/components/rape-gangs/ChartKit'
import UkChoropleth from '@/components/rape-gangs/UkChoropleth'

const REPORT_URL =
  'https://static1.squarespace.com/static/6810978a41bbc42489eafa81/t/6a314bb1151e511944bd4421/1781615537601/The+Rape+Gang+Inquiry+Report.pdf'

/* =================================================================== */
/*  Data — every figure below is reproduced as presented in            */
/*  "The Rape Gang Inquiry Report" (Rupert Lowe MP, 2025).             */
/* =================================================================== */

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

// Notable quotations reproduced verbatim from the report
const quotes = [
  {
    text: 'If we extrapolate nationally the Jay report on Rotherham and other reports from Telford and Oxford, there appear to have been upwards of 250,000 young white girls raped in this century, very largely by Muslim men, usually several times a day for years.',
    source: 'Lord Pearson of Rannoch, House of Lords (2019) — origin of the 250,000 figure',
  },
  {
    text: 'It is simply not possible to know the scale.',
    source: 'IICSA & local inquiries (2022–2025), quoted in the report — ethnicity, group offending and historical cases went unrecorded',
  },
  {
    text: '98% of them were Pakistani Muslim. If not, they were Iraqi Muslim or Kurdish.',
    source: '‘Michelle’, survivor — on her abusers',
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

// Survivor profiles, reconstructed faithfully from the report's testimony sections
const profiles = [
  {
    alias: 'Chloe',
    meta: 'Abuse began at 10 · stepfather, then Pakistani taxi drivers and a man posing as her boyfriend',
    paragraphs: [
      'After her father died just before her tenth birthday, Chloe moved in with her mother and a stepfather she describes as a “paedophile.” He supplied her with alcohol and cigarettes “to keep her quiet” and raped her repeatedly. Her mother caught him in the shower with Chloe and “closed the door and walked out.”',
      'Truanting in the town centre, she was approached by groups of Muslim men — mostly Pakistani taxi drivers aged 20 to over 50 — who bought the girls alcohol and “mapped out” whether they were vulnerable. An uncle she trusted also sexually assaulted her; when her mother reported it, police accused Chloe of lying. With no adult left to turn to, she was drawn deeper in: drugged and taken “house after house” and raped by “guy after guy after guy.”',
      'Her photograph was once shown on TV as a missing child; her abusers taunted her with it. She eventually escaped her home town and, years later, rebuilt her life.',
    ],
    quote: 'If I can save just even one more child, girl or boy, from going through any of this, then I’ve done my job.',
    failure: 'Police accused her of lying when her uncle’s assault was reported, leaving a child with no adult left to trust.',
  },
  {
    alias: 'Jane',
    meta: 'Groomed at 13 by her mother’s drug dealer · later sold to a group of men at 16',
    paragraphs: [
      'Jane’s mother’s drug dealer groomed her over Facebook after learning she was self-harming. He arrived at her father’s house with a kosh, told the 13-year-old to strip, said “you may be 13, but you’ve got the body of a woman,” and raped her. He then abused her “every day apart from the weekends” for months, plying her with valium and cannabis.',
      'When she finally disclosed — telling her drunk mother “because I am being fucked by a 50-year-old man and nobody has noticed” — police insisted the 13-year-old testify alone against him. Too frightened, she didn’t, and he was never prosecuted. Her father called her a “whore,” said he “wished she would just hurry up and kill herself,” and when she attempted suicide told her to “try harder next time.”',
      'Left homeless and moved through foster and residential care, Jane was later taken to a flat in Hounslow by a coercive peer and told she was being sold for sex to six or seven Somali men.',
    ],
    failure: 'Teachers forced her out of the school where she hid from her abuser; police demanded a 13-year-old face her rapist alone, so he walked free.',
  },
  {
    alias: 'Kate',
    meta: 'Raped at 12 · blackmailed into “jobs” — webcam abuse, “parties,” “red rooms”',
    paragraphs: [
      'After her rape was filmed at age 12, Kate was blackmailed: comply, or the video goes to her family. Told she now “worked” for the gang, she was forced into webcam abuse that earned them money, and punished if a livestream didn’t make enough.',
      'When she reported the assault, police took the 12-year-old into an interview room without her mother and told her this was her “last chance” to say it wasn’t true, warning she would be arrested if any detail couldn’t be proved. Overwhelmed, she recanted; it was logged as a withdrawn complaint. Later, explicit messages between Kate and adult men were found — police concluded the 13-year-old was engaging “consensually.”',
      'She was raped multiple times a week, sometimes two to four times a day, in what the gang called “jobs,” “parties,” “cop nights,” and “red rooms.” She once watched another girl being “broken in” and offered to take the “jobs” instead; the men beat and raped her for it. Kate attempted suicide more than once.',
    ],
    failure: 'Police pressured a traumatised 12-year-old into withdrawing her rape report, then recorded a 13-year-old’s abuse by adult men as “consensual.”',
  },
  {
    alias: 'Jen',
    meta: 'Targeted online at 13 · trafficked at 17 by an Iraqi Kurdish gang of illegal migrants',
    paragraphs: [
      'Neglected and bullied — once made to sit in soiled clothes all day after a teacher refused her the toilet — Jen came to believe she was “not worth protecting.” At 13, adult men contacted her online; one encouraged her to insert a knife into her vagina.',
      'At 17 she was introduced to a gang of Iraqi Kurdish Muslim men, all illegal migrants, who trafficked her across the Midlands and raped her at “parties.” On one occasion she was anally raped in a park. The men called white Britons “white trash” and white girls “English pig-dogs,” boasted of “free money” from the British state, and forced her to fill in their asylum benefit applications.',
      'Pregnant at 18 by rape, she was forcibly converted to Islam and married by an imam — without her consent — in a flat converted into a mosque. The father, an Iraqi illegal migrant who had claimed asylum on the basis that he could not safely return, repeatedly took their daughter to Iraq, where she was exposed to AK-47s. When Jen reported it, police called it a “civil matter.”',
    ],
    failure: 'Her disclosures were reframed as “relationship issues” or “cultural matters” and dismissed; the threat to take her child abroad was called a civil matter.',
  },
  {
    alias: 'Fiona',
    meta: 'In care at 13 · groomed by Pakistani men aged 24–45 · “party houses” of 10–20 men',
    paragraphs: [
      'Fiona entered care at 13, placed in a children’s home already flagged as high-risk for exploitation in a TV documentary. Her abusers — men she estimates were 24 to 45 — sat in cars outside, chatted openly with staff, and phoned the home to ask about the girls.',
      'She was repeatedly raped in a “party house” where 10 to 20 men gathered at a time; the girls were called “white slags” while Pakistani girls were kept “pure” for marriage. The gang tried to traffic her to Kashmir, foiled only because she had no passport. The home was paid £5,000 a week to care for her.',
      'When her mother reported her missing and mentioned abuse by Asian men, a police call handler replied: “You can’t describe them as Asian men because that’s racist. You should just be glad your child is being taught a different culture.” An officer once returned Fiona to the abusers’ house and told the men to “have fun with her.”',
    ],
    quote: 'You should just be glad your child is being taught a different culture.',
    failure: 'A care worker was told logging the abusers’ number plates was “above her pay grade”; police returned Fiona to her abusers and told them to “have fun with her.”',
  },
  {
    alias: 'Anna',
    meta: 'Children’s home, Bradford, 2002 · raped from 13 · forced into a sharia marriage at 15',
    paragraphs: [
      'Anna was raped and abused from the age of 13 in a Bradford children’s home. At 15 she was forced into a sharia marriage — and her own social worker attended the ceremony.',
      'After she became pregnant, the same social worker allowed her husband’s parents to foster her, with the family collecting a state fostering allowance. Anna described “domestic slavery,” treated “like a maid” and sexually abused by dozens of men.',
    ],
    failure: 'A social worker attended the forced marriage of a 15-year-old to her abuser, then signed off on the abuser’s family fostering her for state money.',
  },
  {
    alias: 'Sarah',
    meta: 'Kidnapped · forced to learn the Quran and cook for her abusers',
    paragraphs: [
      'Sarah was made to learn the Quran in Arabic, permitted to speak only Urdu and Punjabi, and forced to cook and clean for the gang members who abused her.',
      'After she reported her kidnapping, a Muslim police officer switched off the tape recorder and told her to drop the allegations for “lack of evidence.” She later learned that officer had himself been imprisoned for child sex offences.',
    ],
    failure: 'The officer who took her report turned off the recorder and told her to drop it — and was later jailed for child sex offences himself.',
  },
  {
    alias: 'Michelle',
    meta: 'Pregnant four times as a child · says she was raped by 600–700 men',
    paragraphs: [
      'Michelle became pregnant four times as a child as a result of rape, leading to miscarriages, one abortion and one surviving child. She says she was raped by between six and seven hundred different men.',
      'She describes a nationwide network — “industrial” in scale, a central hub with smaller connected groups in each locality — that she believes stayed untouchable because authorities feared being called racist.',
    ],
    quote: '98% of them were Pakistani Muslim. If not, they were Iraqi Muslim or Kurdish.',
    failure: 'Fear of being labelled racist meant a network operating across the entire country went unchallenged for years.',
  },
]

// The standardised grooming method described across testimonies
const playbook = [
  ['Target & love-bomb', 'Befriend a vulnerable child — often in care, truanting, or already abused — treat her “like an adult,” and shower her with attention, gifts and compliments.'],
  ['Hook with substances', 'Supply alcohol, cigarettes, cannabis and harder drugs to build dependency and, in the abusers’ words, “keep her quiet.”'],
  ['Isolate & move', 'Collect her by taxi from school gates, care homes and streets; cut her off from family and anyone who might intervene.'],
  ['Rape & degrade', 'Pass her between groups of men at houses, flats, restaurants and hotels; rape her repeatedly — often several times a day.'],
  ['Trap with blackmail', 'Film the abuse and threaten to share it; tell her she now “works” for the gang and must stay contactable.'],
  ['Traffic & control', 'Move her between towns and cities; in many cases force conversion to Islam, “marriage,” and pregnancy or coerced abortion.'],
]

// Documented institutional failures
const failures = [
  'Police told a mother she “can’t describe them as Asian men because that’s racist.”',
  'An officer returned a girl to her abusers and told the men to “have fun with her.”',
  'Child victims were threatened with arrest and pressured into withdrawing rape reports.',
  'Abuse of children by adult men was logged as “consensual.”',
  'Cases were dropped on the day of trial with no written explanation given.',
  'Ethnicity and group offending went unrecorded to protect “community cohesion.”',
  'Records were concealed or destroyed — in places for nearly 40 years.',
  'A social worker attended a 15-year-old’s forced marriage to her abuser.',
]

// A 70-year pattern
const timeline = [
  ['1948', 'British Nationality Act opens large-scale Commonwealth immigration.'],
  ['1955', 'First recorded Pakistani rape-gang case: four Bradford men charged with raping a 15-year-old.'],
  ['1997', 'Tony Blair’s government begins an era of mass immigration; the report says abuse escalates.'],
  ['1997–2013', 'At least 1,400 children abused in Rotherham — later exposed by the 2014 Jay Report.'],
  ['2022', 'Telford Inquiry confirms more than 1,000 victims over decades.'],
  ['2025', 'Rupert Lowe’s independent inquiry receives 20,000+ submissions.'],
  ['2026', 'Survivors testify that the abuse is still going on.'],
]

// Convictions beyond Pakistani-heritage networks
const otherGangs = [
  ['Bristol', 'Two Somali-origin gangs'],
  ['Banbury', 'A mainly African-heritage gang'],
  ['Chelmsford', 'Three Iranians'],
  ['Newcastle', 'Three Syrians and one Kuwaiti'],
  ['Somerset', 'Two Turkish men'],
  ['Rotherham', 'A Romanian rape gang'],
  ['Newcastle — “Operation Sanctuary”', '17 men and one woman of Albanian, Kurdish, Bangladeshi, Indian, Turkish, Iranian, Iraqi, Pakistani and Eastern European heritage'],
]

// What the report demands
const recommendations = [
  'Life sentences for group-based CSE — a minimum of 50 years for ringleaders, 25 for participants.',
  'Racial/religious motivation, multiple victims, trafficking, rape-pregnancy and filming made statutory aggravating factors.',
  'Deport every foreign national convicted; strip convicted dual nationals of citizenship automatically.',
  'A dedicated national CPS unit; charging no longer influenced by “community impact” or fear of racism.',
  'Visa bans on nationals of countries over-represented in rape-gang convictions.',
  'Pre-recorded evidence and screens as default for child witnesses; an end to re-traumatising cross-examination.',
  'Investigate — and, if complicit, close — mosques and organisations that harboured offenders.',
  'A referendum on the death penalty for the worst cases, called for by Rupert Lowe and others.',
]

// Locations named in the report, plotted on the interactive map
const mapLocations = [
  { name: 'Rotherham', lng: -1.357, lat: 53.43, major: true, detail: 'Jay Report: at least 1,400 children abused, 1997–2013.' },
  { name: 'Rochdale', lng: -2.155, lat: 53.614, major: true, detail: 'Operation Span — British-Pakistani & Afghan gang; 47 girls identified.' },
  { name: 'Telford', lng: -2.443, lat: 52.678, major: true, detail: 'Telford Inquiry (2022): more than 1,000 victims over decades.' },
  { name: 'Oxford', lng: -1.257, lat: 51.752, major: true, detail: 'Operation Bullfinch — around 370 victims identified.' },
  { name: 'Newcastle', lng: -1.617, lat: 54.978, major: true, detail: 'Operation Sanctuary — 18 convicted (17 men, 1 woman).' },
  { name: 'London', lng: -0.118, lat: 51.509, major: true, detail: 'Met Police review of 9,000 CSE cases; trafficking hub.' },
  { name: 'Derby', lng: -1.476, lat: 52.921, detail: 'Operation Retriever (2010) — 27 victims.' },
  { name: 'Bristol', lng: -2.587, lat: 51.454, detail: 'Two Somali-origin gangs (Operation Brooke).' },
  { name: 'Huddersfield', lng: -1.785, lat: 53.645, detail: '20+ men convicted (2018).' },
  { name: 'Bradford', lng: -1.753, lat: 53.795, detail: 'First recorded case (1955); later convictions.' },
  { name: 'Banbury', lng: -1.34, lat: 52.061, detail: 'A mainly African-heritage gang.' },
  { name: 'Chelmsford', lng: 0.479, lat: 51.736, detail: 'Three Iranian men convicted.' },
  { name: 'Bridgwater (Somerset)', lng: -3.004, lat: 51.128, detail: 'Two Turkish men convicted.' },
  { name: 'Burnley', lng: -2.243, lat: 53.789, detail: 'Named among the affected towns.' },
  { name: 'Peterborough', lng: -0.241, lat: 52.573, detail: 'Operation Erle — named among affected towns.' },
  { name: 'Aylesbury', lng: -0.81, lat: 51.816, detail: '6 men convicted (2015).' },
  { name: 'Middlesbrough', lng: -1.234, lat: 54.574, detail: 'Home of the 15-year-old in the 1955 case.' },
  { name: 'Birmingham', lng: -1.898, lat: 52.486, detail: 'Cited as part of trafficking networks.' },
  { name: 'Sheffield', lng: -1.47, lat: 53.383, detail: 'Named among the affected areas.' },
  { name: 'Manchester', lng: -2.244, lat: 53.483, detail: 'Named among the affected areas.' },
]

// Major named operations and inquiries (public court records + the report)
const operations = [
  ['Rotherham', 'Jay Report · Op. Stovewood', '1997–2013', '20+ (ongoing)', '≥1,400', 'Mainly British-Pakistani'],
  ['Telford', 'Telford Inquiry · Op. Chalice', '1980s–2010s', '7+ (Chalice)', '1,000+', 'Mainly British-Pakistani'],
  ['Oxford', 'Operation Bullfinch', '2004–2013', '7 (2013)', '~370 identified', 'Pakistani, N. & E. African'],
  ['Newcastle', 'Op. Sanctuary / Shelter', '2014–2017', '18 (incl. 1 woman)', '~278 (700+ potential)', 'Diverse Muslim backgrounds'],
  ['Rochdale', 'Operation Span', '2008–2012', '9 (2012)', '47', 'British-Pakistani & Afghan'],
  ['Derby', 'Operation Retriever', '2008–2010', '13', '27', 'Mainly British-Pakistani'],
  ['Bristol', 'Operation Brooke', '2012–2014', '13 (2014)', '7+', 'Somali-origin'],
  ['Huddersfield', 'West Yorkshire trials', '2011–2018', '20+', '15+', 'British-Asian'],
  ['Aylesbury', 'Thames Valley trial', '2006–2015', '6 (2015)', '2+', 'British-Asian'],
]

export default function RapeGangsPage() {
  const SHOW_HIDDEN_CHARTS = false // 'Offenders vs the population' + 'Scale' temporarily hidden
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-8">

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

        {/* ---------------- Scale + Overrepresentation (hidden for now) ---------------- */}
        {SHOW_HIDDEN_CHARTS && (
          <>
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
          </>
        )}

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

        {/* ---------------- Offender ethnicity + Forced marriage ---------------- */}
        <div className="grid md:grid-cols-2 gap-6">
          <ChartCard
            title="Offender ethnicity"
            description="Quilliam Foundation analysis of 264 grooming-gang convictions, 2005–2017."
            tag="cited"
            source="Quilliam Foundation, Group-Based Child Sexual Exploitation (2017) — as cited in the report"
          >
            <DonutChart data={quilliam} unit="%" height={320} centerValue="84%" centerLabel="South Asian" />
            <p className="mt-3 text-xs text-gray-500 leading-relaxed">
              The report does not break offenders down by country, but describes the South Asian share as
              &ldquo;the vast majority Pakistani Muslim.&rdquo; Its only by-country figures are for forced
              marriage (right).
            </p>
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

        {/* ---------------- Map ---------------- */}
        <div id="map" className="scroll-mt-24">
        <ChartCard
          title="Where it happened"
          description="Every local-authority district the report shades as confirmed or suspected, with the locations it names by case. Hover a district or marker for detail."
          tag="report"
          source="Digitised from the report’s map (p.14); markers from locations named in the report and public court records"
          sourceUrl="/rape-gangs/report-map.png"
        >
          <div className="flex items-center justify-center gap-10 mb-5">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-red-400 tabular-nums">149</div>
              <div className="text-xs text-gray-400 mt-1">districts affected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-400 tabular-nums">~40%</div>
              <div className="text-xs text-gray-400 mt-1">of all UK districts</div>
            </div>
          </div>
          <UkChoropleth locations={mapLocations} />
          <p className="mt-3 text-xs text-gray-500 leading-relaxed">
            District shading is digitised from the report’s own map on p.14 (
            <a href="/rape-gangs/report-map.png" target="_blank" rel="noopener noreferrer" className="text-blue-400/80 hover:text-blue-300 underline">view the original</a>
            ) and is approximate. The report states abuse occurred in <span className="text-gray-300">at least 149 districts</span>.
          </p>
        </ChartCard>
        </div>

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

        {/* ---------------- Survivor profiles ---------------- */}
        <div className="space-y-5 pt-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">The survivors</h2>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Eight accounts reconstructed from testimony in the report. Names are the report&rsquo;s
              pseudonyms.
            </p>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-500/[0.06] p-4 flex items-start gap-3 max-w-2xl mx-auto">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-200 leading-relaxed">
              <span className="font-medium text-red-200">Content warning.</span> These accounts describe
              the rape, trafficking and torture of children in explicit terms, exactly as documented in
              the report. They are deeply distressing.
            </p>
          </div>
          <ProfileWall profiles={profiles} />
        </div>

        {/* ---------------- Patterns & insights ---------------- */}
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Patterns &amp; insights</h2>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
              The recurring method, the institutional failures, the long history, and what the report
              demands.
            </p>
          </div>

          {/* Grooming playbook + Institutional failures */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-black border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl">The grooming playbook</CardTitle>
                <CardDescription className="text-gray-400">The same six-step pattern, town after town.</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {playbook.map(([step, desc], i) => (
                    <li key={i} className="flex gap-3">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-semibold flex items-center justify-center">{i + 1}</span>
                      <div>
                        <div className="text-white font-medium text-[15px]">{step}</div>
                        <div className="text-gray-400 text-sm leading-relaxed mt-0.5">{desc}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card className="bg-black border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl">How the system failed</CardTitle>
                <CardDescription className="text-gray-400">Documented failures of police, councils and care.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {failures.map((f, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-gray-300 leading-relaxed">
                      <span className="text-red-400/80 mt-0.5 shrink-0">✕</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card className="bg-black border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-xl">A 70-year pattern</CardTitle>
              <CardDescription className="text-gray-400">From the first recorded case to testimony that it continues today.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-white/15 ml-2 space-y-5">
                {timeline.map(([year, event], i) => (
                  <li key={i} className="ml-5">
                    <span className="absolute -left-[7px] w-3 h-3 rounded-full bg-red-500 border-2 border-black" />
                    <div className="text-sm font-semibold text-red-300 tabular-nums">{year}</div>
                    <div className="text-sm text-gray-300 leading-relaxed mt-0.5">{event}</div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Named operations table */}
          <Card className="bg-black border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-xl">Major operations &amp; inquiries</CardTitle>
              <CardDescription className="text-gray-400">
                The principal named police operations and public inquiries, with their reported scale.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-[640px]">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-white/15">
                      <th className="py-2 pr-4 font-medium">Town</th>
                      <th className="py-2 pr-4 font-medium">Operation / inquiry</th>
                      <th className="py-2 pr-4 font-medium">Years</th>
                      <th className="py-2 pr-4 font-medium">Convicted</th>
                      <th className="py-2 pr-4 font-medium">Known victims</th>
                      <th className="py-2 font-medium">Perpetrators</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operations.map((row, i) => (
                      <tr key={i} className="border-b border-white/[0.07]">
                        <td className="py-2.5 pr-4 text-white font-medium whitespace-nowrap">{row[0]}</td>
                        <td className="py-2.5 pr-4 text-gray-300 whitespace-nowrap">{row[1]}</td>
                        <td className="py-2.5 pr-4 text-gray-400 tabular-nums whitespace-nowrap">{row[2]}</td>
                        <td className="py-2.5 pr-4 text-gray-300 tabular-nums whitespace-nowrap">{row[3]}</td>
                        <td className="py-2.5 pr-4 text-red-300 tabular-nums whitespace-nowrap">{row[4]}</td>
                        <td className="py-2.5 text-gray-400">{row[5]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                Convictions reflect the principal trials; several investigations (e.g. Rotherham’s
                Operation Stovewood) remain ongoing. Figures from public court records, the named inquiries
                and the report.
              </p>
            </CardContent>
          </Card>

          {/* Other gangs + Cost */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-black border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl">Beyond Pakistani networks</CardTitle>
                <CardDescription className="text-gray-400">Convictions the report cites involving other backgrounds.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {otherGangs.map(([place, who], i) => (
                    <li key={i} className="text-sm">
                      <span className="text-white font-medium">{place}</span>
                      <span className="text-gray-400"> — {who}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-black border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl">The cost paradox</CardTitle>
                <CardDescription className="text-gray-400">What the state spends to house a child in care.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-white/15 bg-white/[0.02] p-4">
                    <div className="text-3xl font-bold text-red-400 tabular-nums">£318k</div>
                    <div className="text-sm text-gray-300 mt-1">per year — average care home (National Audit Office)</div>
                  </div>
                  <div className="rounded-lg border border-white/15 bg-white/[0.02] p-4">
                    <div className="text-3xl font-bold text-slate-300 tabular-nums">£63k</div>
                    <div className="text-sm text-gray-300 mt-1">per year — to send a child to Eton</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                  One children&rsquo;s home was paid £5,000 a week for a girl it failed to protect. The report
                  argues the failures of social care are not about money, but ideology.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sentencing */}
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

          {/* Recommendations */}
          <Card className="bg-black border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-xl">What the report demands</CardTitle>
              <CardDescription className="text-gray-400">
                The inquiry&rsquo;s recommendations, reproduced as written. Some are highly contested — they are
                the report&rsquo;s positions, not endorsements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-gray-300 leading-relaxed">
                    <span className="text-emerald-400/80 mt-0.5 shrink-0">→</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
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
