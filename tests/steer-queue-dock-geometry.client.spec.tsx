/**
 * Geometry guard for the steering queue dock.
 *
 * The dock renders inside the composer seat, whose z-index creates the
 * stacking context the conversation's full-height resize strips paint above
 * (ui-conversation `.widthHandle`: absolute in `.body`, z-index 8, above the
 * seat's z-index 7). A descendant cannot escape that stacking context, so the
 * dock's trailing controls only stay clickable by keeping out of the strip's
 * horizontal band. This spec pins the two width terms that do it — the
 * composer-card column every other composer row uses, plus the top-level
 * `--dsh-chat-content-width` term that also stops the panel 24px short of the
 * strip — and the insets that keep the panel aligned under the input card.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/** The dock stylesheet; vitest runs from the package root. */
const css = readFileSync(resolve(process.cwd(), 'src/client/steer-queue-dock.module.css'), 'utf8')

/** Body of the first block whose header contains `needle`. */
function rule(needle: string): string {
  const start = css.indexOf(needle)
  expect(start, `missing rule for ${needle}`).toBeGreaterThanOrEqual(0)
  return css.slice(start, css.indexOf('}', start))
}

describe('steer queue dock geometry', () => {
  const dock = rule('.dock {')

  it('keeps the composer-card column so the panel clears the resize strip', () => {
    // Card column: both side clearances and both dock insets come off the
    // stack width, and the cap is the composer card minus the dock inners.
    expect(dock).toContain('var(--dsh-composer-side-clearance, 16px)')
    expect(dock).toContain('var(--dsh-composer-dock-inset, 8px)')
    expect(dock).toContain('var(--dsh-composer-card-max-width')
  })

  it('stops at the top-level content width so the panel never enters the strip band', () => {
    // The strip's inner edge sits 24px outside the content column. Sizing the
    // panel to the content width minus the dock insets leaves that 24px safe
    // band between the panel's right edge and the strip, which is the only
    // lever a descendant of the z-index 7 seat has.
    expect(dock).toContain('var(--dsh-chat-content-width')
    expect(dock).toContain('width: min(')
  })

  it('keeps the dock centered and flush under the input card', () => {
    expect(dock).toContain('box-sizing: border-box')
    expect(dock).toContain('flex: none')
    expect(dock).toContain('margin: 0 auto')
    // The insets are handed back as padding, so the panel still lands inside
    // the composer card's column instead of drifting outward.
    expect(dock).toContain('padding: 0 var(--dsh-composer-dock-inset, 8px)')
  })
})
