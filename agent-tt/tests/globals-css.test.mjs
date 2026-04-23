import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

test('globals.css does not import Google Fonts directly', () => {
  const cssPath = path.join(process.cwd(), 'src', 'app', 'globals.css')
  const css = fs.readFileSync(cssPath, 'utf8')

  assert.equal(
    css.includes('fonts.googleapis.com'),
    false,
    'Use next/font in layout.tsx instead of a Google Fonts @import in globals.css'
  )
})
