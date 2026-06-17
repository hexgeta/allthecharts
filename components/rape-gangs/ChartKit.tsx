'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import NumberFlow, { type Format } from '@number-flow/react'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList, PieChart, Pie,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Info, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Shared palette + helpers                                           */
/* ------------------------------------------------------------------ */

export const C = {
  red: '#EF4444',      // primary / alarming series
  amber: '#F59E0B',    // estimates / extrapolations
  slate: '#94A3B8',    // population baselines / neutral
  emerald: '#10B981',  // recommended / positive comparator
  purple: '#8B5CF6',
  blue: '#3B82F6',
  rose: '#F43F5E',
}

export const fmtNum = (v: number) =>
  Math.abs(v) >= 1000 ? v.toLocaleString('en-US') : `${v}`

const GRID = 'rgba(136, 136, 136, 0.2)'
const AXIS_TICK = { fill: '#888', fontSize: 12 }

/* ------------------------------------------------------------------ */
/*  Tooltip                                                            */
/* ------------------------------------------------------------------ */

function KitTooltip({ active, payload, label, unit = '' }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl">
      {label !== undefined && <p className="text-white font-medium mb-1.5">{label}</p>}
      <div className="space-y-1">
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm" style={{ background: p.payload?.color || p.color || p.fill }} />
              <span className="text-gray-300">{p.name}</span>
            </div>
            <span className="text-white font-medium tabular-nums">
              {fmtNum(p.value)}{unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Card wrapper with a data-quality tag + source line                */
/* ------------------------------------------------------------------ */

type Tag = 'official' | 'cited' | 'report' | 'mixed'

const TAG_STYLE: Record<Tag, { label: string; cls: string }> = {
  official: { label: 'Cited official data', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  cited: { label: 'Cited research', cls: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  report: { label: 'Report data', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  mixed: { label: 'Report + cited data', cls: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
}

const TAG_INFO: Record<Tag, string> = {
  official: 'Official statistics — ONS, police recorded crime, the 2021 Census, the Forced Marriage Unit — as cited in the report.',
  cited: 'Third-party research or analysis cited in the report (e.g. the Quilliam Foundation, name-analysis studies), not an official statistic.',
  report: "The report's own figure, estimate or national extrapolation — not an independently verified count.",
  mixed: "Combines official or cited data with the report's own estimates. See the source line below the chart.",
}

export function ChartCard({
  title, description, tag, tagInfo, source, sourceUrl, children, delay = 0,
}: {
  title: string
  description?: string
  tag?: Tag
  tagInfo?: string
  source?: string
  sourceUrl?: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="bg-black border-white/20">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-white text-xl">{title}</CardTitle>
              {description && (
                <CardDescription className="text-gray-400 mt-1">{description}</CardDescription>
              )}
            </div>
            {tag && (
              <span className="relative group shrink-0">
                <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full border cursor-help', TAG_STYLE[tag].cls)}>
                  {TAG_STYLE[tag].label}
                  <Info className="w-3 h-3 opacity-70" />
                </span>
                <span className="pointer-events-none absolute right-0 top-full mt-2 w-64 z-20 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 rounded-lg border border-white/15 bg-black/95 p-3 text-xs text-gray-300 leading-relaxed shadow-xl text-left normal-case font-normal">
                  {tagInfo ?? TAG_INFO[tag]}
                </span>
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {children}
          {source && (
            <p className="mt-4 text-xs text-gray-500 leading-relaxed">
              Source:{' '}
              {sourceUrl ? (
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400/80 hover:text-blue-300 underline">
                  {source}
                </a>
              ) : source}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Animated stat card (NumberFlow, triggers on scroll-in)            */
/* ------------------------------------------------------------------ */

export function StatCard({
  value, prefix, suffix, label, note, accent = 'text-white', format, delay = 0,
}: {
  value: number
  prefix?: string
  suffix?: string
  label: string
  note?: string
  accent?: string
  format?: Format
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setDisplay(value), 80 + delay * 1000)
    return () => clearTimeout(t)
  }, [inView, value, delay])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay }}
      className="rounded-lg border border-white/20 bg-white/[0.02] p-5 flex flex-col justify-between"
    >
      <div className={cn('text-3xl md:text-4xl font-bold tabular-nums', accent)}>
        <NumberFlow value={display} prefix={prefix} suffix={suffix} format={format} />
      </div>
      <div className="mt-2">
        <div className="text-sm text-gray-200 leading-snug">{label}</div>
        {note && <div className="text-xs text-gray-500 mt-1 leading-snug">{note}</div>}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Horizontal bar chart (single series, per-cell colour, value tags) */
/* ------------------------------------------------------------------ */

export type BarDatum = { name: string; value: number; color?: string }

export function HBarChart({
  data, unit = '', nameWidth = 150, height = 340, domain,
}: {
  data: BarDatum[]
  unit?: string
  nameWidth?: number
  height?: number
  domain?: [number, number]
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 8, right: 56, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
          <XAxis
            type="number"
            domain={domain ?? [0, 'dataMax']}
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK}
            tickFormatter={(v) => `${fmtNum(v)}${unit}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={nameWidth}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#cbd5e1', fontSize: 12 }}
          />
          <Tooltip content={<KitTooltip unit={unit} />} cursor={{ fill: 'rgba(255,255,255,0.06)' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Value">
            {data.map((d, i) => (
              <Cell key={i} fill={d.color ?? C.red} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={((v: number) => `${fmtNum(v)}${unit}`) as any}
              fill="#e5e7eb"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Grouped / multi-series vertical bar chart                          */
/* ------------------------------------------------------------------ */

export function GroupedBarChart({
  data, series, unit = '', height = 340, legend = true,
}: {
  data: Array<Record<string, any>>
  series: Array<{ key: string; name: string; color: string }>
  unit?: string
  height?: number
  legend?: boolean
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 24, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={AXIS_TICK} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK}
            tickFormatter={(v) => `${fmtNum(v)}${unit}`}
          />
          <Tooltip content={<KitTooltip unit={unit} />} cursor={{ fill: 'rgba(255,255,255,0.06)' }} />
          {legend && (
            <Legend
              payload={series.map((s) => ({ value: s.name, type: 'rect', color: s.color }))}
              wrapperStyle={{ fontSize: 13 }}
            />
          )}
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey={s.key}
                position="top"
                formatter={((v: number) => `${fmtNum(v)}${unit}`) as any}
                fill="#9ca3af"
                fontSize={11}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Quote wall — masonry of pull-quotes from the report               */
/* ------------------------------------------------------------------ */

export function QuoteWall({ quotes }: { quotes: Array<{ text: string; source: string }> }) {
  return (
    <div className="columns-1 md:columns-2 gap-4 [column-fill:_balance]">
      {quotes.map((q, i) => (
        <motion.figure
          key={i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          className="mb-4 break-inside-avoid rounded-lg border border-white/15 bg-white/[0.02] p-5"
        >
          <Quote className="w-5 h-5 text-white/25 mb-2" />
          <blockquote className="text-gray-200 leading-relaxed text-[15px]">
            &ldquo;{q.text}&rdquo;
          </blockquote>
          <figcaption className="mt-3 text-sm text-gray-500">— {q.source}</figcaption>
        </motion.figure>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Donut chart with centre label                                     */
/* ------------------------------------------------------------------ */

export function DonutChart({
  data, unit = '', height = 340, centerValue, centerLabel,
}: {
  data: BarDatum[]
  unit?: string
  height?: number
  centerValue?: string
  centerLabel?: string
}) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="58%"
            outerRadius="82%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color ?? C.red} />
            ))}
          </Pie>
          <Tooltip content={<KitTooltip unit={unit} />} />
          <Legend
            payload={data.map((d) => ({ value: `${d.name} (${fmtNum(d.value)}${unit})`, type: 'rect', color: d.color || C.red }))}
            wrapperStyle={{ fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingBottom: 28 }}>
          <div className="text-3xl font-bold text-white tabular-nums">{centerValue}</div>
          {centerLabel && <div className="text-xs text-gray-400 mt-1">{centerLabel}</div>}
        </div>
      )}
    </div>
  )
}
