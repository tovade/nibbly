import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, BarChart3, Copy, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import z from 'zod'
import type { ChartConfig } from '@/components/ui/chart'
import type { BreakdownItem } from '@/lib/api/analytics'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnalyticsError, useLinkAnalytics } from '@/lib/api/analytics'
import { getShortUrl, useLink } from '@/lib/api/links'

const RANGES = { '7d': 7, '30d': 30, '90d': 90 } as const
type RangeKey = keyof typeof RANGES

export const Route = createFileRoute('/dashboard/links/$slug')({
  component: RouteComponent,
  validateSearch: z.object({
    range: z.enum(['7d', '30d', '90d']).default('30d').catch('30d'),
  }),
})

const chartConfig = {
  total: { label: 'Clicks', color: 'var(--chart-1)' },
  unique: { label: 'Unique visitors', color: 'var(--chart-3)' },
} satisfies ChartConfig

const DAY_MS = 24 * 60 * 60 * 1000

// The API works in UTC days, so build the range the same way
function rangeToDates(range: RangeKey) {
  const today = new Date(new Date().toISOString().slice(0, 10))
  const from = new Date(today.getTime() - (RANGES[range] - 1) * DAY_MS)
  return {
    from: from.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  }
}

const regionNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null

function countryLabel(code: string) {
  if (code.length !== 2) return code
  try {
    return regionNames?.of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: number | undefined
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardDescription>{title}</CardDescription>
        {icon}
      </CardHeader>
      <CardContent>
        {value === undefined ? (
          <div className="h-9 w-20 rounded bg-muted animate-pulse" />
        ) : (
          <div className="font-display text-4xl font-bold tabular-nums">
            {value.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BreakdownCard({
  title,
  items,
  format = (name) => name,
  loading,
}: {
  title: string
  items: Array<BreakdownItem> | undefined
  format?: (name: string) => string
  loading: boolean
}) {
  const max = Math.max(1, ...(items?.map((item) => item.count) ?? []))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading &&
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-6 rounded bg-muted animate-pulse" />
          ))}
        {!loading && !items?.length && (
          <p className="text-sm text-muted-foreground">No data yet</p>
        )}
        {items?.map((item) => (
          <div key={item.name} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate" title={format(item.name)}>
                {format(item.name)}
              </span>
              <span className="font-medium tabular-nums">
                {item.count.toLocaleString()}
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ErrorState({ error }: { error: Error }) {
  const status = error instanceof AnalyticsError ? error.status : 500
  const message =
    status === 401
      ? 'Sign in to view analytics for this link.'
      : status === 403
        ? "You don't have access to this link's analytics."
        : status === 404
          ? 'We could not find this link.'
          : 'Failed to load analytics. Please try again later.'

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-input bg-card px-6 py-16 text-center">
      <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-lg font-medium text-foreground">{message}</h2>
      <div className="mt-4 flex gap-2">
        {status === 401 && (
          <Button asChild>
            <Link to="/auth/login">Sign in</Link>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link to="/dashboard/links">Back to links</Link>
        </Button>
      </div>
    </div>
  )
}

function RouteComponent() {
  const { slug } = Route.useParams()
  const { range } = Route.useSearch()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const dates = useMemo(() => rangeToDates(range), [range])
  const { data, isLoading, error } = useLinkAnalytics(slug, dates)
  const { data: link } = useLink(slug)

  const originalUrl = link?.data?.originalUrl

  const copy = async () => {
    await navigator.clipboard.writeText(getShortUrl(slug))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 md:px-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link to="/dashboard/links">
            <ArrowLeft className="h-4 w-4" /> All links
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate font-mono text-3xl font-semibold text-foreground">
              /{slug}
            </h1>
            {originalUrl && (
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground block truncate max-w-xl"
                title={originalUrl}
              >
                {originalUrl}
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={copy}>
              <Copy className="h-4 w-4" />
              {copied ? 'Copied!' : 'Copy link'}
            </Button>
            <Tabs
              value={range}
              onValueChange={(value) =>
                navigate({
                  to: '.',
                  search: { range: value as RangeKey },
                  replace: true,
                })
              }
            >
              <TabsList>
                {Object.keys(RANGES).map((key) => (
                  <TabsTrigger key={key} value={key}>
                    {key}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {error ? (
        <ErrorState error={error} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              title="Total clicks"
              value={data?.summary.total}
              icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Unique visitors"
              value={data?.summary.unique}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">
                Clicks over time
              </CardTitle>
              <CardDescription>
                Bots are excluded. Unique visitors are counted per day, and raw
                IP addresses are never stored.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 animate-pulse rounded-lg bg-muted" />
              ) : data && data.summary.total === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <BarChart3 className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="font-medium">No clicks yet</p>
                  <p className="text-sm text-muted-foreground">
                    Share your link and clicks will show up here.
                  </p>
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-64 w-full">
                  <AreaChart data={data?.timeseries ?? []}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={24}
                      tickFormatter={formatDate}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      width={32}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) => formatDate(String(value))}
                        />
                      }
                    />
                    <Area
                      dataKey="total"
                      type="monotone"
                      stroke="var(--color-total)"
                      fill="var(--color-total)"
                      fillOpacity={0.18}
                      strokeWidth={2}
                    />
                    <Area
                      dataKey="unique"
                      type="monotone"
                      stroke="var(--color-unique)"
                      fill="var(--color-unique)"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <BreakdownCard
              title="Countries"
              items={data?.countries}
              format={countryLabel}
              loading={isLoading}
            />
            <BreakdownCard
              title="Referrers"
              items={data?.referrers}
              loading={isLoading}
            />
            <BreakdownCard
              title="Browsers"
              items={data?.browsers}
              loading={isLoading}
            />
            <BreakdownCard
              title="Operating systems"
              items={data?.os}
              loading={isLoading}
            />
            <BreakdownCard
              title="Devices"
              items={data?.devices}
              loading={isLoading}
            />
          </div>
        </>
      )}
    </div>
  )
}
