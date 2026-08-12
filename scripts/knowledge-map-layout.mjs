export function buildKnowledgeMapLayout(notes, { columns = 4, width = 960, radius = 56, horizontalGap = 220, verticalGap = 170, padding = 84 } = {}) {
  const indexByUrl = new Map(notes.map((note, index) => [note.url, index]))
  const rows = Math.max(1, Math.ceil(notes.length / columns))
  const height = Math.max(2 * padding + 2 * radius, padding * 2 + (rows - 1) * verticalGap + 2 * radius)
  return {
    width,
    height,
    radius,
    indexByUrl,
    nodes: notes.map((note, index) => ({ ...note, index, x: padding + radius + (index % columns) * horizontalGap, y: padding + radius + Math.floor(index / columns) * verticalGap }))
  }
}
