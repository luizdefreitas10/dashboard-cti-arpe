import Image from 'next/image'
import { cn } from '@/lib/utils'

type BrandTone = 'auto' | 'positive' | 'negative'

const CTI_ALT = 'CTI — Coordenadoria de Tecnologia da Informação'
const ARPE_ALT = 'ARPE — Agência de Regulação de Pernambuco'

const CTI_LOGO_SIZE = {
  horizontal: { width: 408, height: 80 },
  vertical: { width: 240, height: 224 },
} as const

const ARPE_LOGO_SIZE = { width: 720, height: 108 }

type ToneImageProps = {
  tone: BrandTone
  positiveSrc: string
  negativeSrc: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

/** Positivo em fundos claros, negativo em Azul Noite/Azul ARPE; `auto` segue o tema. */
function ToneImage({ tone, positiveSrc, negativeSrc, alt, width, height, className, priority }: ToneImageProps) {
  const shared = { width, height, priority, draggable: false }

  if (tone === 'positive') return <Image src={positiveSrc} alt={alt} className={className} {...shared} />
  if (tone === 'negative') return <Image src={negativeSrc} alt={alt} className={className} {...shared} />

  return (
    <>
      <Image src={positiveSrc} alt={alt} className={cn('brand-light-only', className)} {...shared} />
      <Image src={negativeSrc} alt={alt} className={cn('brand-dark-only', className)} {...shared} />
    </>
  )
}

/** Logotipo CTI. Tamanho mínimo digital: 160px de largura; abaixo disso use `CtiSymbol`. */
export function CtiLogo({
  orientation = 'horizontal',
  tone = 'auto',
  className,
  priority,
}: {
  orientation?: keyof typeof CTI_LOGO_SIZE
  tone?: BrandTone
  className?: string
  priority?: boolean
}) {
  const { width, height } = CTI_LOGO_SIZE[orientation]
  return (
    <ToneImage
      tone={tone}
      positiveSrc={`/brand/cti-logo-${orientation}-positivo.svg`}
      negativeSrc={`/brand/cti-logo-${orientation}-negativo.svg`}
      alt={CTI_ALT}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  )
}

/** Símbolo CTI (chip). Tamanho mínimo: 24px. */
export function CtiSymbol({
  size = 32,
  className,
  decorative = false,
  priority,
}: {
  size?: number
  className?: string
  decorative?: boolean
  priority?: boolean
}) {
  return (
    <Image
      src="/brand/cti-simbolo.svg"
      alt={decorative ? '' : CTI_ALT}
      aria-hidden={decorative || undefined}
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      style={{ width: size, height: size }}
      priority={priority}
      draggable={false}
    />
  )
}

export function ArpeLogo({ tone = 'auto', className }: { tone?: BrandTone; className?: string }) {
  return (
    <ToneImage
      tone={tone}
      positiveSrc="/brand/arpe-logo-horizontal-positivo.png"
      negativeSrc="/brand/arpe-logo-horizontal-negativo.png"
      alt={ARPE_ALT}
      width={ARPE_LOGO_SIZE.width}
      height={ARPE_LOGO_SIZE.height}
      className={className}
    />
  )
}

const SIGNATURE_SIZE = {
  sm: { cti: 'h-8', arpe: 'h-6', rule: 'h-8' },
  md: { cti: 'h-11', arpe: 'h-8', rule: 'h-11' },
} as const

/** Assinatura conjunta: CTI à esquerda, ARPE à direita (≥ 70% da altura da CTI), separadas por fio cinza. */
export function JointSignature({
  tone = 'auto',
  size = 'md',
  className,
}: {
  tone?: BrandTone
  size?: keyof typeof SIGNATURE_SIZE
  className?: string
}) {
  const s = SIGNATURE_SIZE[size]
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-3 sm:gap-x-5', className)}>
      <CtiLogo tone={tone} className={cn(s.cti, 'w-auto')} />
      <span aria-hidden className={cn(s.rule, 'w-px shrink-0 bg-[var(--arpe-gray)]/60')} />
      <ArpeLogo tone={tone} className={cn(s.arpe, 'w-auto')} />
    </div>
  )
}
