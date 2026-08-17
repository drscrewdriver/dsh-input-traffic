/**
 * The busy-Enter row hiding component renders nothing: while mounted, the
 * official "繁忙时 Enter 键行为" settings row is shadowed out of the
 * `settings.general.item` list by the lower priority registration.
 */
import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { HideEnterRow } from '../src/client/hide-enter-row.tsx'
import type { HideEnterRowProps } from '../src/client/hide-enter-row.tsx'

function mount() {
  const t = vi.fn((key: string) => key)
  const props = { t } as unknown as HideEnterRowProps
  return render(<HideEnterRow {...props} />)
}

describe('HideEnterRow', () => {
  it('renders nothing', () => {
    const view = mount()
    expect(view.container.firstChild).toBeNull()
  })
})
