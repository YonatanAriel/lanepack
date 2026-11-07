/** Vite env overrides; see `.env.example` in the repo root. */
export const BOARD_TITLE = import.meta.env.VITE_BOARD_TITLE ?? 'Lanepack'
export const BOARD_TAGLINE =
  import.meta.env.VITE_BOARD_TAGLINE ??
  'Slack, Jira, Gmail & meetings — prioritized'
export const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY ?? 'lanepack-board-v1'
export const EXPORT_PREFIX = import.meta.env.VITE_EXPORT_PREFIX ?? 'lanepack'
