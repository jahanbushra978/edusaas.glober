import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const projectRoot = path.resolve(process.cwd())
  let count = 0

  function walk(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.next') continue
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          walk(full)
        } else {
          count++
        }
      }
    } catch {
      // skip inaccessible directories
    }
  }

  walk(projectRoot)
  return NextResponse.json({ count })
}
