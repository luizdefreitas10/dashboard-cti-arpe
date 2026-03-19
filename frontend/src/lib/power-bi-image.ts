/**
 * Coluna IMAGEM na planilha:
 * - URL absoluta (https://...) → usada como está
 * - Nome de arquivo (ex: Dashboard Normatização ou Dashboard Normatização.jpeg) → servido de /public/power-bi/
 * - Se não tiver extensão, assume .jpeg (comum em prints)
 */
export function resolvePowerBiImageSrc(imagem: string | null | undefined): string | null {
  if (!imagem?.trim()) return null
  const t = imagem.trim()
  if (/^https?:\/\//i.test(t)) return t
  if (t.startsWith('/')) return t
  const hasExt = /\.(jpe?g|png|webp|gif)$/i.test(t)
  const filename = hasExt ? t : `${t}.jpeg`
  return `/power-bi/${encodeURIComponent(filename)}`
}
