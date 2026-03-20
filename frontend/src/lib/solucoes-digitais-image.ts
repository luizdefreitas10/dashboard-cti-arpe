/**
 * Coluna IMAGEM na planilha:
 * - URL absoluta (https://...) → usada como está
 * - Nome do arquivo → servido de /public/solucoes-digitais/
 */
export function resolveSolucaoDigitalImageSrc(
  imagem: string | null | undefined,
): string | null {
  if (!imagem?.trim()) return null
  const t = imagem.trim()
  if (/^https?:\/\//i.test(t)) return t
  if (t.startsWith('/')) return t
  const hasExt = /\.(jpe?g|png|webp|gif)$/i.test(t)
  const filename = hasExt ? t : `${t}.jpeg`
  return `/solucoes-digitais/${encodeURIComponent(filename)}`
}
