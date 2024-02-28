'use client'

import EventTimersPage from '../../../../../(default)/events/[id]/timers/page'

export default function FullscreenEventTimersPage(args: any) {
  return EventTimersPage({ ...args, params: { ...args.params, fullscreen: true } })
}
