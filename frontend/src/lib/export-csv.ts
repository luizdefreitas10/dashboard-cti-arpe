export function exportToCSV(filename: string, rows: Record<string, unknown>[]): void {
  if (!rows.length) return

  const headers = Object.keys(rows[0])
  const csvRows = [
    headers.join(';'),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h]
          if (val === null || val === undefined) return ''
          const s = String(val).replace(/"/g, '""')
          return s.includes(';') || s.includes('"') || s.includes('\n') ? `"${s}"` : s
        })
        .join(';'),
    ),
  ]

  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
