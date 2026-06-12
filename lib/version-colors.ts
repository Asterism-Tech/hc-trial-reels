// Distinct colour identity per version number, used everywhere versions
// appear (chips, panels, charts, tables) so V1–V5 are easy to tell apart.
// The winner deliberately uses brand hot pink — a colour no version hue
// shares — so it always stands out from the field.

export const WINNER_COLOR = '#ed4a7e' // brand hot pink — winner / published
export const ARCHIVED_COLOR = '#9b8a92' // muted — archived (non-winning) versions

export const VERSION_COLORS = [
  '#2563EB', // V1 blue
  '#0D9488', // V2 teal
  '#7C3AED', // V3 violet
  '#EA580C', // V4 orange
  '#16A34A', // V5 green
]

export function versionColor(versionNumber: number): string {
  return VERSION_COLORS[(versionNumber - 1) % VERSION_COLORS.length]
}

/** Colour for a version in charts: winner pink beats the version hue. */
export function versionChartColor(versionNumber: number, isWinner: boolean): string {
  return isWinner ? WINNER_COLOR : versionColor(versionNumber)
}
