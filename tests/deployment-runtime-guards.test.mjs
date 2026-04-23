import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

test('dashboard principale defines a controlled data-unavailable error for missing production data', () => {
  const source = read('dashboard principale/src/lib/excel/loadWorkbook.ts')

  assert.match(
    source,
    /DashboardDataUnavailableError/,
    'dashboard principale should expose a controlled data-unavailable error instead of crashing on missing workbook data'
  )
})

test('dashboard principale path resolver includes a bundled workbook fallback for deployment', () => {
  const source = read('dashboard principale/src/lib/excel/path.ts')

  assert.match(
    source,
    /"data",\s*"data\.xlsx"/,
    'dashboard path resolver should include a bundled workbook path so Vercel has a deployable data source'
  )
})

test('dashboard principale supports a database source via environment configuration', () => {
  const source = read('dashboard principale/src/lib/dashboardData.ts')

  assert.match(
    source,
    /hasDashboardDatabaseConfigured/,
    'dashboard data loader should detect database configuration before workbook fallback'
  )

  assert.match(
    source,
    /loadIncidentsFromDatabase/,
    'dashboard data loader should attempt to read incidents from the database source'
  )
})

test('dashboard principale ignores invalid database env values and falls back to bundled sqlite', () => {
  const source = read('dashboard principale/src/lib/db/prisma.ts')

  assert.match(
    source,
    /startsWith\("postgres:\/\/"\).*startsWith\("postgresql:\/\/"\).*startsWith\("file:"\)/s,
    'dashboard prisma datasource should only trust real postgres or sqlite URLs'
  )
})

test('dashboard principale pages do not import the throwing workbook loader directly', () => {
  const dashboardPagesDir = path.join(
    repoRoot,
    'dashboard principale',
    'src',
    'app',
    '(dashboard)'
  )

  const pageFiles = fs
    .readdirSync(dashboardPagesDir, { withFileTypes: true })
    .flatMap((entry) => {
      if (!entry.isDirectory()) {
        return []
      }

      const pagePath = path.join(dashboardPagesDir, entry.name, 'page.tsx')
      return fs.existsSync(pagePath) ? [pagePath] : []
    })

  pageFiles.push(path.join(dashboardPagesDir, 'page.tsx'))

  for (const pageFile of pageFiles) {
    const source = fs.readFileSync(pageFile, 'utf8')
    assert.doesNotMatch(
      source,
      /@\/lib\/excel\/loadWorkbook/,
      `dashboard page should use a safe data wrapper instead of importing loadWorkbook directly: ${path.relative(repoRoot, pageFile)}`
    )
  }
})

test('interface-fsi uses the database runtime guard instead of workbook fallback', () => {
  const source = read('interface-fsi/src/app/api/ligne/route.ts')

  assert.match(
    source,
    /isDatabaseUnavailableError/,
    'interface-fsi ligne route should translate database failures into a controlled production message'
  )

  assert.doesNotMatch(
    source,
    /canUseWorkbookRuntimeFallback/,
    'interface-fsi ligne route should not rely on workbook fallback in production'
  )
})

test('interface-fsi sync endpoint disables workbook sync on Vercel deployments', () => {
  const source = read('interface-fsi/src/app/api/sync/route.ts')

  assert.match(
    source,
    /Workbook sync is disabled on Vercel deployments/,
    'interface-fsi sync route should return a clear deployed-runtime error instead of attempting local workbook sync'
  )
})

test('agent-tt intervention writes are not blocked by workbook mutations in production', () => {
  const source = read('agent-tt/src/app/api/interventions/route.ts')

  assert.match(
    source,
    /canUseWorkbookRuntimeFallback/,
    'agent-tt interventions route should gate workbook writes behind a runtime guard'
  )

  assert.doesNotMatch(
    source,
    /Unable to update all-data\.xlsx for this ligne/,
    'agent-tt should not fail production intervention writes just because workbook sync is unavailable'
  )
})

test('agent-tt sync endpoint disables workbook sync on Vercel deployments', () => {
  const source = read('agent-tt/src/app/api/sync/route.ts')

  assert.match(
    source,
    /Workbook sync is disabled on Vercel deployments/,
    'agent-tt sync route should return a clear deployed-runtime error instead of attempting local workbook sync'
  )
})
