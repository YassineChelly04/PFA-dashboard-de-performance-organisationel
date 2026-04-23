import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

test('interface-fsi uses app-specific NextAuth cookie names', () => {
  const source = read('interface-fsi/src/lib/auth.ts')

  assert.match(
    source,
    /cookies\s*:/,
    'interface-fsi auth must define explicit NextAuth cookies to avoid localhost collisions'
  )
  assert.match(
    source,
    /cookiePrefix\s*=.*fsi-interface/,
    'interface-fsi should declare an app-specific cookie prefix'
  )
  assert.match(
    source,
    /name:\s*`\$\{cookiePrefix\}\.session-token`/,
    'interface-fsi should use an app-specific session cookie name'
  )
})

test('agent-tt uses app-specific NextAuth cookie names', () => {
  const source = read('agent-tt/src/app/api/auth/[...nextauth]/route.ts')

  assert.match(
    source,
    /cookies\s*:/,
    'agent-tt auth must define explicit NextAuth cookies to avoid localhost collisions'
  )
  assert.match(
    source,
    /cookiePrefix\s*=.*agent-tt/,
    'agent-tt should declare an app-specific cookie prefix'
  )
  assert.match(
    source,
    /name:\s*`\$\{cookiePrefix\}\.session-token`/,
    'agent-tt should use an app-specific session cookie name'
  )
})

test('interface-fsi local NEXTAUTH_URL matches its local port', () => {
  const envSource = read('interface-fsi/.env.local')

  assert.match(
    envSource,
    /NEXTAUTH_URL=http:\/\/localhost:3001/,
    'interface-fsi should point NEXTAUTH_URL at port 3001 in local development'
  )
})
