'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SmallMultiples from '@/components/birth-rates/SmallMultiples'
import OverlayMultiples from '@/components/birth-rates/OverlayMultiples'
import CarSeatMismatch from '@/components/birth-rates/CarSeatMismatch'
import { Baby } from 'lucide-react'

// Countries with a crude-marriage-rate series (for the births-vs-marriages overlay).
const OVERLAY_CODES = ['KOR', 'USA', 'GBR', 'FRA', 'POL', 'MEX', 'AUS']

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
              other — clustering around the moment smartphones and fast mobile internet arrived. Here’s the
              data behind the debate, rebuilt from UN, World Bank, Eurostat and other public figures.
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

        {/* Long view: the decline predates smartphones (UN WPP) */}
        <div className="pt-4 space-y-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              The long view: this decline is decades old
            </h2>
            <p className="text-sm text-gray-400 mt-1.5 max-w-3xl leading-relaxed">
              Using the UN’s own numbers back to 1950, the shaded “smartphone era” shrinks to a thin sliver at
              the right-hand edge. In Korea, Mexico, Indonesia and Brazil, roughly <span className="text-purple-300 font-medium">90%</span> of
              the total fall in fertility had already happened <span className="text-white">before</span> smartphones existed.
              Whatever phones did, they arrived late to a decline that was already most of the way done —
              which is why a single time-series can’t tell you smartphones caused it.
            </p>
          </div>
          <SmallMultiples
            metric="fertility"
            codes={['KOR', 'MEX', 'IDN', 'BRA', 'USA', 'NGA']}
            startYear={1950}
            endYear={2023}
            showReplacementLine
            smartphoneBand={{ from: 2007, to: 2015 }}
            title="Fertility rate since 1950 — UN World Population Prospects"
            description="High-fertility countries fell toward (or below) replacement decades before the smartphone era began."
          />
        </div>

        {/* Overlay: births vs marriages, per country */}
        <div className="pt-4 space-y-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              Do births and marriages move together?
            </h2>
            <p className="text-sm text-gray-400 mt-1.5 max-w-3xl leading-relaxed">
              Each panel overlays a country’s fertility rate (purple, left axis) on its crude marriage rate
              (blue, right). In <span className="text-white">Korea</span> the two fall almost in lockstep — powerful support for
              “fewer marriages, not fewer kids per marriage.” In the <span className="text-white">US</span> and
              <span className="text-white"> France</span> the marriage line drops but fertility holds up better,
              because so many births there now happen outside marriage. Same shift, different plumbing.
            </p>
          </div>
          <OverlayMultiples
            codes={OVERLAY_CODES}
            startYear={1965}
            endYear={2022}
            title="Births vs marriages, per country"
          />
        </div>

        {/* Fewer couples: the direct marriage-rate evidence */}
        <div className="pt-4 space-y-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              The direct evidence: fewer people are marrying
            </h2>
            <p className="text-sm text-gray-400 mt-1.5 max-w-3xl leading-relaxed">
              Here the “fewer couples” claim stops being an assertion. The crude marriage rate — marriages per
              1,000 people each year — has fallen across the board. Korea is the clearest case: its rate more
              than halved (≈9 to under 4), and because births there still overwhelmingly happen inside marriage,
              its fertility collapse essentially <span className="text-white">is</span> a marriage collapse.
              People are also marrying much later (US women’s median first-marriage age rose ~25→29, France
              ~28→33 in just two decades).
            </p>
          </div>
          <SmallMultiples
            metric="marriageRate"
            codes={['KOR', 'USA', 'GBR', 'AUS', 'FRA', 'POL', 'MEX']}
            startYear={1965}
            endYear={2022}
            smartphoneBand={{ from: 2007, to: 2015 }}
            title="Crude marriage rate (marriages per 1,000 people)"
            description="Fewer marriages per year — the partnership-formation channel behind “fewer couples.”"
          />
          <p className="text-xs text-gray-500 max-w-3xl leading-relaxed">
            Coverage caveat: this series is OECD / rich-country weighted — Brazil, Indonesia and Nigeria aren’t
            covered — so read it as evidence about high-income and East-Asian countries, not the whole world.
          </p>
        </div>

        {/* Completed cohort fertility: quantum vs composition */}
        <div className="pt-4 space-y-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              Fewer kids per woman — or just fewer couples?
            </h2>
            <p className="text-sm text-gray-400 mt-1.5 max-w-3xl leading-relaxed">
              The honest test. This is <span className="text-white">completed fertility</span> — the number of
              children women actually ended up with, plotted by the year they were born (not a single year’s
              snapshot, which delayed births distort). If the collapse were purely “fewer couples,” women who do
              have kids should still end up with about as many as before. The answer is split: in the US, UK and
              France completed fertility held remarkably close to ~2, so the scary single-year figures overstate
              the real per-woman decline. But in Italy, Spain and Japan women genuinely ended up with far fewer
              (~1.4). So it’s partly fewer couples, partly a real drop in kids per woman — and it depends where.
            </p>
          </div>
          <SmallMultiples
            metric="completedFertility"
            codes={['USA', 'GBR', 'FRA', 'ITA', 'ESP', 'JPN']}
            startYear={1935}
            endYear={1974}
            showReplacementLine
            title="Completed fertility by woman’s birth cohort"
            description="X-axis = the year the woman was born; the line is how many children she had by the end of her childbearing years. Data ends with women born ~1974."
          />
          <p className="text-xs text-gray-500 max-w-3xl leading-relaxed">
            Caveats: this is per <span className="italic">woman</span>, not per married couple — no ready-made
            cross-country marital-fertility series exists (even the Human Fertility Database doesn’t carry it yet).
            It also only runs to women born ~1974, so it can’t yet judge the post-2010 dip; and Korea, the
            cleanest “marriage-collapse” case, isn’t in the cohort database.
          </p>
        </div>

        {/* Married women: composition vs quantum */}
        <div className="pt-4 space-y-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              Is fertility falling <span className="italic">among married women</span>?
            </h2>
            <p className="text-sm text-gray-400 mt-1.5 max-w-3xl leading-relaxed">
              The cleanest test — births per married woman — isn’t published as a ready-made cross-country series
              (even the Human Fertility Database doesn’t carry it yet; it <span className="italic">can</span> be
              computed for EU countries from Eurostat). So here’s the honest workaround using what’s open — two
              things we <span className="text-white">can</span> measure directly:
              the share of women aged 15–49 who are married has fallen sharply (US 66% → 52%), while completed
              fertility per woman (chart above) held close to ~2 in the US, UK and France. Together that points to
              <span className="text-white"> fewer married women</span> far more than <span className="text-white">married
              women choosing fewer kids</span> — the “fewer couples” reading. But where fertility fell hardest
              (Italy, Spain, Japan), completed fertility <span className="italic">also</span> dropped, so
              married-couple fertility isn’t perfectly flat there either.
            </p>
          </div>
          <SmallMultiples
            metric="shareWomenMarried"
            codes={['USA', 'GBR', 'FRA', 'ITA', 'KOR', 'JPN']}
            startYear={1970}
            endYear={2020}
            unit="%"
            title="Share of women aged 15–49 who are married or in a union"
            description="Fewer women are partnered at childbearing age — the compositional side of the decline."
          />
          <p className="text-xs text-gray-500 max-w-3xl leading-relaxed">
            Honest note: this is an <span className="italic">indirect</span> answer. A true “births per married
            woman” rate isn’t published as a ready-made cross-country series — though it can be computed for EU
            countries from Eurostat’s births-by-marital-status data (a possible next step). Share-married falling,
            plus roughly flat completed per-woman fertility, is consistent with married-couple fertility being
            fairly stable in the West — but it doesn’t measure it directly.
          </p>
        </div>

        {/* Direct marital fertility (EU, computed from Eurostat) */}
        <div className="pt-4 space-y-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              The direct measure: do married women have fewer kids? (EU)
            </h2>
            <p className="text-sm text-gray-400 mt-1.5 max-w-3xl leading-relaxed">
              And here’s the thing we couldn’t get before — a <span className="text-white">real</span> marital
              fertility rate, computed from Eurostat: the share of married women (aged 18–49) who
              <span className="text-white"> give birth in a given year</span>. The answer is striking — among
              married women, fertility is <span className="text-white">flat or even rising</span> (Netherlands
              7.8% → 9.0%, Germany 5.4% → 7.8%) even as total fertility fell. So the birth-rate collapse is
              almost entirely about <span className="text-white">fewer people marrying</span> — not married
              couples choosing fewer kids.
            </p>
            <p className="text-xs text-gray-500 mt-2 max-w-3xl leading-relaxed">
              (Why a % and not “children per married woman”? A lifetime children-per-married-woman figure is
              badly distorted — young married women are a tiny, self-selected group — so the honest measure is
              the annual rate. Children-per-woman for the <span className="italic">whole</span> population is the
              fertility-rate chart near the top.)
            </p>
          </div>
          <SmallMultiples
            metric="maritalFertility"
            codes={['NLD', 'DEU', 'CHE', 'HUN', 'SWE', 'NOR', 'FIN', 'DNK', 'BEL', 'CZE', 'SVN', 'SVK', 'LTU', 'LVA']}
            startYear={1990}
            endYear={2024}
            unit="pct1"
            title="% of married women (18–49) who give birth each year"
            description="Computed from Eurostat. Roughly flat-to-rising while total fertility fell — i.e. the decline is compositional."
          />
          <p className="text-xs text-gray-500 max-w-3xl leading-relaxed">
            The big caveat — <span className="italic">selection</span>: as marriage becomes rarer and more
            deliberate, the women who still marry are increasingly those who want children. So married-women
            fertility holding up doesn’t mean “couples are fine” — it partly means only the baby-inclined now
            marry. A real, direct measure, but not a clean counterfactual. EU-only (Eurostat coverage — the US,
            UK and Japan aren’t in this dataset).
          </p>
        </div>

        {/* Non-marital fertility — the rate, not the ratio */}
        <div className="pt-4 space-y-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              …and are unmarried people just having the kids instead?
            </h2>
            <p className="text-sm text-gray-400 mt-1.5 max-w-3xl leading-relaxed">
              No. You’ll often see the “share of births outside marriage” rising and hear that childbearing just
              moved outside marriage — but that stat is a <span className="text-white">ratio</span>, not a rate:
              it climbs whenever <span className="italic">married</span> births fall, and says nothing about
              whether unmarried people have more kids. Here’s the actual rate — the share of
              <span className="text-white"> unmarried</span> women (18–49) who give birth in a year. It’s
              <span className="text-white"> low and flat-to-falling</span>: unmarried ≈ 3–5% vs married ≈ 5–9%.
              So most unmarried people — cohabiting couples very much included — simply <span className="text-white">aren’t
              having kids</span>. The rise in “births outside marriage” is a composition effect, not unmarried
              people becoming more fertile.
            </p>
          </div>
          <SmallMultiples
            metric="nonMaritalFertility"
            codes={['SWE', 'NOR', 'DNK', 'NLD', 'FIN', 'CZE', 'SVN', 'SVK', 'DEU', 'CHE', 'LVA', 'LTU']}
            startYear={2011}
            endYear={2024}
            unit="pct1"
            title="% of unmarried women (18–49) who give birth each year"
            description="Eurostat; unmarried = all women not currently married (cohabiting, single, divorced, widowed). Low, and not rising."
          />
        </div>

        {/* Isolation: living alone */}
        <div className="pt-4 space-y-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              Are people more isolated? Living alone became the norm
            </h2>
            <p className="text-sm text-gray-400 mt-1.5 max-w-3xl leading-relaxed">
              Yes — the drift toward living alone is real and nearly universal. The share of one-person
              households roughly doubled across the rich world (US 13% → 28%, Japan 16% → 35%, Sweden past 40%).
              Fewer people share a home, which fits the picture of fewer and later partnerships. On top of this,
              US time-use data shows people — <span className="text-white">especially the young</span> — spending
              more hours alone since around 2010, and surveys record a “sexual recession”: younger cohorts
              report less sex and fewer partners than earlier generations, not more.
            </p>
          </div>
          <SmallMultiples
            metric="onePersonHouseholds"
            codes={['SWE', 'JPN', 'DEU', 'GBR', 'USA', 'KOR']}
            startYear={1960}
            endYear={2018}
            unit="%"
            title="Share of one-person households"
            description="More people living alone — consistent with fewer partnerships forming."
          />
          <p className="text-xs text-gray-500 max-w-3xl leading-relaxed">
            Honest caveat: living-alone rates are also pushed up by ageing populations (elderly people, often
            widowed, living alone) and by rising wealth (people can afford their own place). So this is
            suggestive of a retreat from partnership, not proof of it — read it alongside the marriage-rate
            fall, not on its own.
          </p>
        </div>

        {/* Candidate driver: housing costs */}
        <div className="pt-4 space-y-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Did housing get too expensive?</h2>
            <p className="text-sm text-gray-400 mt-1.5 max-w-3xl leading-relaxed">
              A popular explanation: young people can’t afford the space to raise kids. Real (inflation-adjusted)
              house prices roughly doubled in the US and rose ~4–5× in the UK and Australia. But this can’t be
              the universal cause — <span className="text-white">Germany’s real prices barely moved and Italy’s
              actually fell</span>, yet both have some of the lowest fertility in the world. Housing plausibly
              contributes where it exploded; it can’t explain the countries where it didn’t.
            </p>
          </div>
          <SmallMultiples
            metric="realHousePrices"
            codes={['GBR', 'AUS', 'USA', 'FRA', 'ESP', 'KOR', 'ITA', 'DEU', 'JPN']}
            startYear={1975}
            endYear={2024}
            unit="index"
            title="Real house prices (index, 2010 = 100)"
            description="Inflation-adjusted. Note Germany (flat) and Italy (falling) sit alongside equally low fertility."
          />
        </div>

        {/* Candidate driver: secularisation */}
        <div className="pt-4 space-y-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Did people stop going to church?</h2>
            <p className="text-sm text-gray-400 mt-1.5 max-w-3xl leading-relaxed">
              Religiosity tracks fertility loosely — more-religious people and places tend to have more children,
              and frequent religious attendance has fallen across the West (US ~60% → ~39%). But the fit is loose:
              Korea and Japan were never highly religious yet have the lowest fertility, and secularisation is
              gradual while the recent fertility drop is sharp. A contributing current, not the switch.
            </p>
          </div>
          <SmallMultiples
            metric="churchAttendance"
            codes={['USA', 'ITA', 'POL', 'FRA', 'GBR', 'KOR']}
            startYear={1984}
            endYear={2022}
            unit="%"
            title="Share attending religious services frequently"
            description="World / European Values Survey. Frequent attendance has fallen across most of the West."
          />
        </div>

        {/* The car-seat theory — US-only */}
        <div className="pt-4 space-y-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              The car-seat theory — clever, but far from global
            </h2>
            <p className="text-sm text-gray-400 mt-1.5 max-w-3xl leading-relaxed">
              One much-shared paper (Nickerson &amp; Solomon, 2020) argues US car-seat laws — now requiring seats
              up to age ~8 — quietly act as contraception: a third seat won’t fit across a normal back seat, so
              some families stop at two. The <span className="italic">study</span> is US-only, but the
              <span className="italic"> mechanism</span> plausibly extends across the car-dependent Anglosphere —
              the <span className="text-white">UK</span> (restraints to age 12 / 135cm), <span className="text-white">Australia</span>,
              Canada and New Zealand all pair strict car-seat rules with heavy car use, so it may bite there too.
              What it <span className="text-white">can’t</span> be is the <span className="text-white">global</span> driver
              — fertility collapsed just as hard where the mechanism barely applies: no comparable law,
              transit-heavy cities, or low car ownership.
            </p>
          </div>
          <CarSeatMismatch />
          <p className="text-xs text-gray-500 max-w-3xl leading-relaxed">
            Figures are each country’s latest fertility rate. Most rich countries <span className="italic">do</span> regulate
            car seats — the point isn’t that only the US does, but that the specific “no room for a third seat”
            mechanism needs car-dependence + strict age limits + small cars, a combination absent across much of
            the world that saw fertility fall anyway.
          </p>
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
                href="https://population.un.org/wpp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                UN World Population Prospects (2024) — total fertility rate, via Our World in Data
              </a>
              <a
                href="https://data.worldbank.org/indicator/SP.DYN.TFRT.IN"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                World Bank Open Data — fertility, birth &amp; teen-fertility rates (the interactive explorer above)
              </a>
              <a
                href="https://ourworldindata.org/marriages-and-divorces"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Crude marriage rate &amp; share of births outside marriage — UN / OECD, via Our World in Data
              </a>
              <a
                href="https://www.humanfertility.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Completed cohort fertility — Human Fertility Database, via Our World in Data
              </a>
              <a
                href="https://fred.stlouisfed.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Real house prices — BIS residential property prices (index, 2010=100), via FRED
              </a>
              <a
                href="https://ourworldindata.org/religion"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Religious attendance &amp; women married/in-union — World Values Survey &amp; UN World Marriage Data, via Our World in Data
              </a>
              <a
                href="https://ec.europa.eu/eurostat/web/population-demography/demography-population-stock-balance/database"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Marital &amp; non-marital fertility (EU) — computed from Eurostat births by marital status (demo_fagec) &amp; women by marital status (demo_pjanmarsta)
              </a>
              <a
                href="https://www.ft.com/content/fba35eca-df3a-4ad6-b42d-eb08eb7c9ad3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Financial Times — “Why birth rates are falling everywhere all at once” (John Burn-Murdoch)
              </a>
              <p className="text-gray-500 text-xs leading-relaxed">
                Charts are rebuilt independently from public data; the FT article is cited only as the source of
                the smartphone-timing thesis. The long-view fertility chart uses UN World Population Prospects;
                the interactive explorer uses World Bank figures (themselves largely derived from the UN series,
                so the two are near-identical). The shaded 2007–2015 “smartphone era” band is an illustrative
                marker, not a data series. The marriage-rate and births-outside-marriage series cover mainly
                OECD and East-Asian countries, so they evidence the “fewer couples” story for high-income
                nations rather than the whole world.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
