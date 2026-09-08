import { useMemo, useState } from 'react'
import { problemStatements, allTechTags, allThemes } from './lib/parse'
import { Badge, Card, Input, Button, Dialog, BottomSheet, FilterChip } from './components/ui'
import { Search, X, Copy, Check, ExternalLink, SlidersHorizontal } from 'lucide-react'

const difficultyBand = (d) =>
  d <= 4.5 ? 'Easy' : d <= 6.5 ? 'Moderate' : d <= 8 ? 'Hard' : 'Very Hard'

const bandColor = (band) =>
  ({
    Easy: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    Moderate: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    Hard: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    'Very Hard': 'text-red-400 border-red-500/30 bg-red-500/10',
  })[band]

function App() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedTech, setSelectedTech] = useState([])
  const [selectedThemes, setSelectedThemes] = useState([])
  const [maxDifficulty, setMaxDifficulty] = useState(10)
  const [minDifficulty, setMinDifficulty] = useState(0)
  const [sort, setSort] = useState('id')
  const [open, setOpen] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [copied, setCopied] = useState(false)

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  const techCounts = useMemo(() => {
    const m = {}
    for (const p of problemStatements) for (const t of p.tech) m[t] = (m[t] || 0) + 1
    return m
  }, [])

  const themeCounts = useMemo(() => {
    const m = {}
    for (const p of problemStatements) m[p.theme] = (m[p.theme] || 0) + 1
    return m
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = problemStatements.filter((p) => {
      if (category !== 'All' && p.category !== category) return false
      if (selectedTech.length && !selectedTech.every((t) => p.tech.includes(t))) return false
      if (selectedThemes.length && !selectedThemes.includes(p.theme)) return false
      if (p.difficulty < minDifficulty || p.difficulty > maxDifficulty) return false
      if (q) {
        const hay = `${p.id} ${p.title} ${p.org} ${p.theme} ${p.about} ${p.build} ${p.challenges} ${p.tech.join(' ')}`.toLowerCase()
        if (!q.split(/\s+/).every((w) => hay.includes(w))) return false
      }
      return true
    })
    return [...list].sort((a, b) =>
      sort === 'id' ? a.id.localeCompare(b.id)
      : sort === 'difficulty-asc' ? a.difficulty - b.difficulty
      : sort === 'difficulty-desc' ? b.difficulty - a.difficulty
      : a.title.localeCompare(b.title)
    )
  }, [query, category, selectedTech, selectedThemes, minDifficulty, maxDifficulty, sort])

  const activeFilters =
    (category !== 'All' ? 1 : 0) + selectedTech.length + selectedThemes.length +
    (minDifficulty > 0 || maxDifficulty < 10 ? 1 : 0)

  const reset = () => {
    setQuery('')
    setCategory('All')
    setSelectedTech([])
    setSelectedThemes([])
    setMinDifficulty(0)
    setMaxDifficulty(10)
  }

  const copyPS = async () => {
    if (!open?.raw) return
    await navigator.clipboard.writeText(open.raw)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const openInChatGPT = () => {
    if (!open?.raw) return
    const q = encodeURIComponent(open.raw.slice(0, 6000))
    window.open(`https://chatgpt.com/?q=${q}`, '_blank')
  }
  const filtersContent = (
    <>
      <FilterGroup title="Category">
        {['All', 'Software', 'Hardware'].map((c) => (
          <FilterChip
            key={c}
            active={category === c}
            onClick={() => setCategory(c)}
            count={c === 'All' ? problemStatements.length : problemStatements.filter((p) => p.category === c).length}
          >
            {c}
          </FilterChip>
        ))}
      </FilterGroup>
      <FilterGroup title={`Tech Stack (${allTechTags.length})`}>
        <div className="space-y-1.5">
          {allTechTags.map((t) => (
            <FilterChip
              key={t}
              active={selectedTech.includes(t)}
              onClick={() => toggle(selectedTech, setSelectedTech, t)}
              count={techCounts[t]}
            >
              {t}
            </FilterChip>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Difficulty Range">
        <div className="space-y-2 px-1 text-sm text-zinc-400">
          <label className="block">
            Min: <span className="text-violet-300">{minDifficulty.toFixed(1)}</span>
            <input
              type="range" min="0" max="10" step="0.5" value={minDifficulty}
              onChange={(e) => setMinDifficulty(Math.min(+e.target.value, maxDifficulty))}
              className="mt-1 w-full accent-violet-500"
            />
          </label>
          <label className="block">
            Max: <span className="text-violet-300">{maxDifficulty.toFixed(1)}</span>
            <input
              type="range" min="0" max="10" step="0.5" value={maxDifficulty}
              onChange={(e) => setMaxDifficulty(Math.max(+e.target.value, minDifficulty))}
              className="mt-1 w-full accent-violet-500"
            />
          </label>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[['≤5 Easy', 0, 5], ['5–7 Medium', 5, 7], ['7–8.5 Hard', 7, 8.5], ['8.5+ Expert', 8.5, 10]].map(([label, lo, hi]) => (
              <button
                key={label}
                onClick={() => { setMinDifficulty(lo); setMaxDifficulty(hi) }}
                className={`rounded-md border px-2 py-0.5 text-xs ${minDifficulty === lo && maxDifficulty === hi ? 'border-violet-500 bg-violet-500/15 text-violet-200' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </FilterGroup>
      <FilterGroup title="Theme">
        <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {allThemes.map((t) => (
            <FilterChip
              key={t}
              active={selectedThemes.includes(t)}
              onClick={() => toggle(selectedThemes, setSelectedThemes, t)}
              count={themeCounts[t]}
            >
              {t}
            </FilterChip>
          ))}
        </div>
      </FilterGroup>
      {activeFilters > 0 && (
        <Button variant="ghost" onClick={reset} className="w-full">
          <X className="mr-1 h-3.5 w-3.5" /> Clear all filters ({activeFilters})
        </Button>
      )}
    </>
  )

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold">S</div>
            <div>
              <h1 className="text-sm font-semibold leading-tight">SIH 2026 Explorer</h1>
              <p className="text-xs text-zinc-500">{problemStatements.length} problem statements</p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters {activeFilters > 0 && <span className="rounded bg-violet-600 px-1.5 py-0.5 text-xs text-white">{activeFilters}</span>}
          </button>
          <div className="relative ml-auto w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, org, theme, keywords…"
              className="pl-9"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 space-y-6 lg:block">
          {filtersContent}
        </aside>

        {/* Main list */}
        <main className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
            <span>{filtered.length} result{filtered.length === 1 ? '' : 's'}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="ml-auto rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300 outline-none"
            >
              <option value="id">Sort: PS Number</option>
              <option value="difficulty-asc">Difficulty: Low → High</option>
              <option value="difficulty-desc">Difficulty: High → Low</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>

          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500">
              No problem statements match your filters.
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => {
              const band = difficultyBand(p.difficulty)
              return (
                <Card key={p.id} onClick={() => setOpen(p)} className="flex flex-col p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-zinc-500">{p.id}</span>
                    <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${bandColor(band)}`}>
                      {p.difficulty}/10
                    </span>
                  </div>
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-zinc-100">{p.title}</h3>
                  <p className="mb-3 line-clamp-2 text-xs text-zinc-500">{p.org}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5">
                    <Badge variant={p.category.toLowerCase()}>{p.category}</Badge>
                    {p.tech.slice(0, 3).map((t) => <Badge key={t} variant="tech">{t}</Badge>)}
                    {p.tech.length > 3 && <Badge>+{p.tech.length - 3}</Badge>}
                  </div>
                </Card>
              )
            })}
          </div>
        </main>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!open} onClose={() => { setOpen(null); setCopied(false) }}>
        {open && (
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="font-mono">{open.id}</span>
              <Badge variant={open.category.toLowerCase()}>{open.category}</Badge>
              <Badge variant="theme">{open.theme}</Badge>
              <span className={`ml-auto rounded-md border px-2 py-0.5 text-xs font-semibold ${bandColor(difficultyBand(open.difficulty))}`}>
                Difficulty {open.difficulty}/10
              </span>
            </div>
            <h2 className="pr-8 text-xl font-bold leading-snug">{open.title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{open.org}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="ghost" onClick={copyPS} className="gap-1.5 border border-zinc-700">
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button variant="primary" onClick={openInChatGPT} className="gap-1.5">
                <ExternalLink className="h-4 w-4" /> Open in ChatGPT
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {open.tech.map((t) => <Badge key={t} variant="tech">{t}</Badge>)}
            </div>

            {[
              ['What the PS is about', open.about],
              ['What to build', open.build],
              ['Key challenges', open.challenges],
              ['Why this difficulty', open.why],
            ].filter(([, v]) => v).map(([h, v]) => (
              <section key={h} className="mt-4">
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-400">{h}</h4>
                <div className="space-y-1.5 text-sm leading-relaxed text-zinc-300">
                  {v.split('\n').filter(Boolean).map((line, i) => {
                    const isBullet = /^[-•*]/.test(line)
                    const clean = line.replace(/^[-•*]\s*/, '')
                    return (
                      <p key={i} className={isBullet ? 'flex gap-2' : ''}>
                        {isBullet && <span className="text-violet-500">•</span>}
                        <span>{clean}</span>
                      </p>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </Dialog>

      <BottomSheet open={showFilters} onClose={() => setShowFilters(false)} title={`Filters ${activeFilters ? `(${activeFilters})` : ''}`}>
        <div className="space-y-6">
          {filtersContent}
        </div>
      </BottomSheet>
    </div>
  )
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

export default App
