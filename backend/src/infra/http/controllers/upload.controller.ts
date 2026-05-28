import {
  Controller, Post, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Prisma } from '@prisma/client'
import { memoryStorage } from 'multer'
import * as XLSX from 'xlsx'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { randomUUID } from 'crypto'

function cleanStr(val: unknown): string | null {
  if (val === null || val === undefined) return null
  const s = String(val).trim()
  return s === '' || s === '-' ? null : s
}

function normHeaderKey(k: string): string {
  return String(k)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, '')
}

function rowNormalized(row: Record<string, unknown>): Record<string, unknown> {
  const o: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(row)) {
    o[normHeaderKey(k)] = v
  }
  return o
}

function parsePowerBiStatus(raw: unknown, imagem: string | null): 'concluido' | 'em_andamento' {
  if (raw != null && String(raw).trim() !== '') {
    const s = String(raw)
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
    if (
      s.includes('andamento') ||
      s.includes('pendente') ||
      s.includes('desenvolv') ||
      s.includes('10%') ||
      s.includes('parcial') ||
      s.includes('rascunho')
    ) {
      return 'em_andamento'
    }
    return 'concluido'
  }
  // STATUS vazio: se IMAGEM vazia → em andamento; se IMAGEM preenchida → concluído
  return !imagem || imagem.trim() === '' ? 'em_andamento' : 'concluido'
}

function parseDate(val: unknown): Date | null {
  if (!val) return null
  if (val instanceof Date) return val
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val)
    if (d) return new Date(d.y, d.m - 1, d.d)
  }
  const s = String(val).trim()
  const br = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (br) {
    const [, dd, mm, yyyy] = br
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
    return isNaN(d.getTime()) ? null : d
  }
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

const MONTH_MAP: Record<string, number> = {
  janeiro: 1,
  fevereiro: 2,
  marco: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
}

function normText(v: unknown): string {
  return String(v ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function parseMonthNumber(v: unknown): number | null {
  if (typeof v === 'number' && v >= 1 && v <= 12) return v
  const key = normText(v)
  return MONTH_MAP[key] ?? null
}

function parseYear(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v)
  const s = cleanStr(v)
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) ? Math.trunc(n) : null
}

export function normalizeContratoStatus(raw: unknown): 'PAGO' | 'A_VENCER' | 'VENCIDO' | 'SEM_STATUS' {
  const s = normText(raw)
  if (s.includes('pago') || s.includes('paga')) return 'PAGO'
  if (s.includes('vencid')) return 'VENCIDO'
  if (s.includes('vencer') || s.includes('a vencer')) return 'A_VENCER'
  if (!s) return 'A_VENCER'
  return 'SEM_STATUS'
}

type ParsedContratoMensal = {
  ano: number
  mes: number
  pagamento: string | null
  status: 'PAGO' | 'A_VENCER' | 'VENCIDO' | 'SEM_STATUS'
}

type ParsedContratoServico = {
  prestador: 'OI' | 'CLARO' | 'SIMPRESS'
  nomeServico: string
  numeroReferencia: string | null
  dataInicio: Date | null
  dataFinal: Date | null
  observacoes: string | null
  pagamentos: ParsedContratoMensal[]
}

type SectionSpec = {
  prestador: 'OI' | 'CLARO' | 'SIMPRESS'
  nomeServico: string
  startCol: number
  hasObs: boolean
}

function readCell(matrix: unknown[][], row1: number, col1: number): unknown {
  return matrix[row1 - 1]?.[col1 - 1] ?? null
}

function parseSectionsFromSheet(matrix: unknown[][], specs: SectionSpec[]): ParsedContratoServico[] {
  const headerRows = [5, 21]
  const out = new Map<string, ParsedContratoServico>()

  for (const spec of specs) {
    const key = `${spec.prestador}::${spec.nomeServico}`
    if (!out.has(key)) {
      out.set(key, {
        prestador: spec.prestador,
        nomeServico: spec.nomeServico,
        numeroReferencia: null,
        dataInicio: null,
        dataFinal: null,
        observacoes: null,
        pagamentos: [],
      })
    }

    const current = out.get(key)!
    const competenciaSeen = new Set<string>()
    let currentYear: number | null = null

    for (const headerRow of headerRows) {
      for (let r = headerRow + 1; r <= headerRow + 12; r++) {
        const yearVal = parseYear(readCell(matrix, r, spec.startCol))
        if (yearVal) currentYear = yearVal

        const mes = parseMonthNumber(readCell(matrix, r, spec.startCol + 1))
        if (!mes || !currentYear) continue

        const pagamento = cleanStr(readCell(matrix, r, spec.startCol + 2))
        const numeroRef = cleanStr(readCell(matrix, r, spec.startCol + 4))
        const dataInicio = parseDate(readCell(matrix, r, spec.startCol + 5))
        const dataFinal = parseDate(readCell(matrix, r, spec.startCol + 6))
        const observacoes = spec.hasObs ? cleanStr(readCell(matrix, r, spec.startCol + 7)) : null

        if (numeroRef) current.numeroReferencia = numeroRef
        if (dataInicio) current.dataInicio = dataInicio
        if (dataFinal) current.dataFinal = dataFinal
        if (observacoes) current.observacoes = observacoes

        const status = normalizeContratoStatus(readCell(matrix, r, spec.startCol + 3))
        const compKey = `${currentYear}-${mes}`
        if (competenciaSeen.has(compKey)) continue
        competenciaSeen.add(compKey)

        current.pagamentos.push({
          ano: currentYear,
          mes,
          pagamento,
          status,
        })
      }
    }

    current.pagamentos.sort((a, b) => a.ano - b.ano || a.mes - b.mes)
  }

  return [...out.values()]
}

function parseContratosWorkbook(wb: XLSX.WorkBook): ParsedContratoServico[] {
  const specsBySheet: Record<string, SectionSpec[]> = {
    OI: [
      { prestador: 'OI', nomeServico: 'OI 0800 EXTRA REDE', startCol: 2, hasObs: true },
      { prestador: 'OI', nomeServico: 'OI ADC PVF + WIFI', startCol: 11, hasObs: false },
    ],
    CLARO: [{ prestador: 'CLARO', nomeServico: 'CLARO SERVICOS MOVEIS', startCol: 2, hasObs: true }],
    SIMPRESS: [
      { prestador: 'SIMPRESS', nomeServico: 'SIMPRESS PRETO E BRANCO', startCol: 2, hasObs: false },
      { prestador: 'SIMPRESS', nomeServico: 'SIMPRESS COLORIDA', startCol: 11, hasObs: false },
    ],
  }

  const parsed: ParsedContratoServico[] = []
  for (const [sheetName, specs] of Object.entries(specsBySheet)) {
    const ws = wb.Sheets[sheetName]
    if (!ws) continue
    const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null }) as unknown[][]
    parsed.push(...parseSectionsFromSheet(matrix, specs))
  }
  return parsed.filter((s) => s.pagamentos.length > 0)
}

function cleanHttpUrl(s: string | null): string | null {
  if (!s) return null
  const t = s.trim()
  if (!/^https?:\/\//i.test(t)) return null
  return t
}

function parseTipoSolucao(raw: unknown): 'automacao' | 'solucao_web' | null {
  const s =
    cleanStr(raw)?.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '') ?? ''
  if (!s) return null
  if (s.includes('solucaoweb') || (s.includes('solucao') && s.includes('web'))) {
    return 'solucao_web'
  }
  if (s.includes('automacao')) return 'automacao'
  return null
}

/** Parse coluna OBSERVACOES: status + URL de produção opcional */
function parseObservacoesSolucao(raw: unknown): {
  statusProjeto: 'concluida' | 'em_andamento'
  urlProducao: string | null
} {
  const t = cleanStr(raw)
  if (!t) return { statusProjeto: 'em_andamento', urlProducao: null }
  const n = t.trim()
  if (/^em\s*andamento/i.test(n)) {
    return { statusProjeto: 'em_andamento', urlProducao: null }
  }
  const urlMatch = n.match(/^conclu[ií]da\s*[-–—]\s*(https?:\/\/\S+)/i)
  if (urlMatch) {
    let url = urlMatch[1].trim().replace(/[),.;]+$/g, '')
    url = cleanHttpUrl(url) ?? url
    return { statusProjeto: 'concluida', urlProducao: url }
  }
  if (/^conclu[ií]da\b/i.test(n)) {
    return { statusProjeto: 'concluida', urlProducao: null }
  }
  return { statusProjeto: 'em_andamento', urlProducao: null }
}

@Controller('upload')
export class UploadController {
  constructor(private prisma: PrismaService) {}

  private async logImport(input: {
    tipo: string
    filename?: string
    rowsCount?: number | null
    message: string
  }, client: Prisma.TransactionClient | PrismaService = this.prisma) {
    await client.dataImportLog.create({
      data: {
        tipo: input.tipo,
        filename: input.filename ?? null,
        rowsCount: input.rowsCount ?? null,
        message: input.message,
      },
    })
  }

  @Post('atividades')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadAtividades(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado')

    const wb = XLSX.read(file.buffer, { type: 'buffer' })
    const ws = wb.Sheets['BASE_PADRONIZADA']
    if (!ws) throw new BadRequestException('Sheet BASE_PADRONIZADA não encontrada')

    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null }) as unknown[][]

    const data = rows
      .slice(1)
      .filter((r) => r[0])
      .map((r) => ({
        id: randomUUID(),
        categoria: cleanStr(r[0]) ?? 'Outros',
        nome: cleanStr(r[1]) ?? 'Sem nome',
        diaSemana: cleanStr(r[2]),
        data: parseDate(r[3]),
        horario: cleanStr(r[4]),
        responsavel: cleanStr(r[5]),
        solicitante: cleanStr(r[6]),
        setor: cleanStr(r[7]),
        prioridade: cleanStr(r[8]),
        estado: cleanStr(r[9]),
        observacao: cleanStr(r[10]),
        createdAt: new Date(),
      }))

    if (data.length === 0) {
      throw new BadRequestException('Nenhuma atividade valida encontrada. A base atual foi preservada.')
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.atividade.deleteMany()
      await tx.atividade.createMany({ data, skipDuplicates: true })
      await this.logImport({
        tipo: 'atividades',
        filename: file.originalname,
        rowsCount: data.length,
        message: `${data.length} atividades importadas com sucesso`,
      }, tx)
    })

    return { message: `${data.length} atividades importadas com sucesso`, total: data.length }
  }

  @Post('bens')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadBens(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado')

    const wb = XLSX.read(file.buffer, { type: 'buffer' })
    const currentBens = await this.prisma.bem.findMany()
    const currentByTomb = new Map(currentBens.map((b) => [b.tombamento, b]))

    const wsBens = wb.Sheets['Monitoramento_Bens']
    let bensData: { id: string; tombamento: string; tipoHardware: string | null; modelo: string | null; usuario: string | null; setor: string | null; finalidadePrincipal: string | null; sistemaOperacional: string | null; criticidade: string | null }[] = []
    const historicoRecords: { id: string; tombamento: string; operacao: string; campo: string | null; valorAnterior: string | null; valorNovo: string | null }[] = []
    const wsSw = wb.Sheets['Ativos_Software']
    const wsRamais = wb.Sheets['Monitoramento_Telefones']
    const wsCel = wb.Sheets['Monitoramento_Celulares']

    if (!wsBens && !wsSw && !wsRamais && !wsCel) {
      throw new BadRequestException('Nenhuma aba esperada foi encontrada. A base atual foi preservada.')
    }

    if (wsBens) {
      const rows = XLSX.utils.sheet_to_json(wsBens, { header: 1, defval: null }) as unknown[][]
      bensData = rows.slice(1).filter((r) => r[0]).map((r) => ({
        id: randomUUID(),
        tombamento: String(r[0]).trim(),
        tipoHardware: cleanStr(r[1]),
        modelo: cleanStr(r[2]),
        usuario: cleanStr(r[3]),
        setor: cleanStr(r[4]),
        finalidadePrincipal: cleanStr(r[5]),
        sistemaOperacional: cleanStr(r[6]),
        criticidade: cleanStr(r[7]),
      }))

      const newByTomb = new Set(bensData.map((b) => b.tombamento))
      const fields = ['tipoHardware', 'modelo', 'usuario', 'setor', 'finalidadePrincipal', 'sistemaOperacional', 'criticidade'] as const

      for (const novo of bensData) {
        const antigo = currentByTomb.get(novo.tombamento)
        if (!antigo) {
          historicoRecords.push({ id: randomUUID(), tombamento: novo.tombamento, operacao: 'criado', campo: null, valorAnterior: null, valorNovo: null })
        } else {
          for (const f of fields) {
            const vAnt = antigo[f] ?? null
            const vNovo = novo[f] ?? null
            if (String(vAnt ?? '') !== String(vNovo ?? '')) {
              historicoRecords.push({ id: randomUUID(), tombamento: novo.tombamento, operacao: 'alterado', campo: f, valorAnterior: vAnt ? String(vAnt) : null, valorNovo: vNovo ? String(vNovo) : null })
            }
          }
        }
      }
      for (const b of currentBens) {
        if (!newByTomb.has(b.tombamento)) {
          historicoRecords.push({ id: randomUUID(), tombamento: b.tombamento, operacao: 'removido', campo: null, valorAnterior: b.setor ? String(b.setor) : null, valorNovo: null })
        }
      }
    }

    let softwaresData: { id: string; nome: string; versao: string | null; finalidade: string | null }[] = []
    if (wsSw) {
      const rows = XLSX.utils.sheet_to_json(wsSw, { header: 1, defval: null }) as unknown[][]
      softwaresData = rows.slice(1).filter((r) => r[0]).map((r) => ({
        id: randomUUID(), nome: String(r[0]).trim(),
        versao: cleanStr(r[1]), finalidade: cleanStr(r[2]),
      }))
    }

    let ramaisData: { id: string; setor: string; digital: number; analogico: number; total: number; descricao: string | null }[] = []
    if (wsRamais) {
      const rows = XLSX.utils.sheet_to_json(wsRamais, { header: 1, defval: null }) as unknown[][]
      ramaisData = rows.slice(1).filter((r) => r[0] && typeof r[1] === 'number').map((r) => {
        const digital = Number(r[1]) || 0
        const analogico = Number(r[2]) || 0
        return { id: randomUUID(), setor: String(r[0]).trim(), digital, analogico, total: digital + analogico, descricao: cleanStr(r[4]) }
      })
    }

    let celularesData: { id: string; modelo: string; setor: string; imei: string }[] = []
    if (wsCel) {
      const rows = XLSX.utils.sheet_to_json(wsCel, { header: 1, defval: null }) as unknown[][]
      celularesData = rows.slice(1).filter((r) => r[0] && r[2]).map((r) => ({
        id: randomUUID(), modelo: String(r[0]).trim(), setor: cleanStr(r[1]) ?? 'CTI', imei: String(r[2]).trim(),
      }))
    }

    if (wsBens && bensData.length === 0) {
      throw new BadRequestException('A aba Monitoramento_Bens nao possui linhas validas. A base atual foi preservada.')
    }
    if (wsSw && softwaresData.length === 0) {
      throw new BadRequestException('A aba Ativos_Software nao possui linhas validas. A base atual foi preservada.')
    }
    if (wsRamais && ramaisData.length === 0) {
      throw new BadRequestException('A aba Monitoramento_Telefones nao possui linhas validas. A base atual foi preservada.')
    }
    if (wsCel && celularesData.length === 0) {
      throw new BadRequestException('A aba Monitoramento_Celulares nao possui linhas validas. A base atual foi preservada.')
    }

    const totals = {
      bens: wsBens ? bensData.length : 0,
      softwares: wsSw ? softwaresData.length : 0,
      ramais: wsRamais ? ramaisData.length : 0,
      celulares: wsCel ? celularesData.length : 0,
    }

    const msg = `Bens importados: ${totals.bens} equipamentos, ${totals.softwares} softwares, ${totals.ramais} ramais, ${totals.celulares} celulares`

    await this.prisma.$transaction(async (tx) => {
      if (wsBens) {
        await tx.bem.deleteMany()
        if (bensData.length > 0) {
          await tx.bem.createMany({ data: bensData, skipDuplicates: true })
        }
        if (historicoRecords.length > 0) {
          await tx.bemHistorico.createMany({ data: historicoRecords })
        }
      }
      if (wsSw) {
        await tx.software.deleteMany()
        if (softwaresData.length > 0) {
          await tx.software.createMany({ data: softwaresData, skipDuplicates: true })
        }
      }
      if (wsRamais) {
        await tx.ramal.deleteMany()
        if (ramaisData.length > 0) {
          await tx.ramal.createMany({ data: ramaisData, skipDuplicates: true })
        }
      }
      if (wsCel) {
        await tx.celular.deleteMany()
        if (celularesData.length > 0) {
          await tx.celular.createMany({ data: celularesData, skipDuplicates: true })
        }
      }
      await this.logImport({
        tipo: 'bens',
        filename: file.originalname,
        rowsCount: totals.bens + totals.softwares + totals.ramais + totals.celulares,
        message: msg,
      }, tx)
    })

    return {
      message: msg,
      totals,
    }
  }

  @Post('power-bi')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadPowerBi(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado')

    const wb = XLSX.read(file.buffer, { type: 'buffer' })
    const sheetName =
      wb.SheetNames.includes('Planilha1') ? 'Planilha1'
      : wb.SheetNames.find((s) => /planilha|sheet1|links|dashboards/i.test(s)) ?? wb.SheetNames[0]
    if (!sheetName) throw new BadRequestException('Planilha sem abas')

    const ws = wb.Sheets[sheetName]
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null })

    const seenLinks = new Set<string>()
    const data: {
      id: string
      nome: string
      link: string
      descricao: string | null
      autores: string | null
      status: 'concluido' | 'em_andamento'
      imagem: string | null
      ordem: number
    }[] = []

    let ordem = 0
    for (const raw of rawRows) {
      const r = rowNormalized(raw)
      const nome = cleanStr(r.nome)
      let link = cleanStr(r.link)
      if (!nome) continue
      if (nome.toLowerCase() === 'nome') continue
      if (!link) link = '(EM ANDAMENTO)'
      // Link "(EM ANDAMENTO)" ou sem URL válida = dashboard em desenvolvimento
      const isPlaceholder =
        !/^https?:\/\//i.test(link) ||
        /em\s*andamento|em\s*produção|pendente/i.test(link)
      const finalLink = isPlaceholder
        ? `https://em-andamento.local/#${encodeURIComponent(nome)}`
        : link
      if (seenLinks.has(finalLink)) continue
      seenLinks.add(finalLink)

      const descricao = cleanStr(r.descricao)
      const autores = cleanStr(r.autores)
      const imagem = cleanStr(r.imagem)
      const status = isPlaceholder ? 'em_andamento' : parsePowerBiStatus(r.status, imagem)

      data.push({
        id: randomUUID(),
        nome,
        link: finalLink,
        descricao,
        autores,
        status,
        imagem,
        ordem: ordem++,
      })
    }

    if (data.length === 0) {
      throw new BadRequestException(
        'Nenhuma linha válida encontrada. Use colunas NOME e LINK (URL). Opcionais: DESCRIÇÃO, AUTORES, STATUS, IMAGEM.',
      )
    }

    const concluidosCount = data.filter((d) => d.status === 'concluido').length
    const emAndamentoCount = data.filter((d) => d.status === 'em_andamento').length
    const msg = `${data.length} dashboard(s) importado(s): ${concluidosCount} concluído(s), ${emAndamentoCount} em andamento`

    await this.prisma.$transaction(async (tx) => {
      await tx.powerBiReport.deleteMany()
      await tx.powerBiReport.createMany({ data })
      await this.logImport({
        tipo: 'power_bi',
        filename: file.originalname,
        rowsCount: data.length,
        message: msg,
      }, tx)
    })

    return {
      message: msg,
      total: data.length,
      concluidos: concluidosCount,
      emAndamento: emAndamentoCount,
    }
  }

  @Post('solucoes-digitais')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadSolucoesDigitais(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado')

    const wb = XLSX.read(file.buffer, { type: 'buffer', cellDates: true })
    const sheetName =
      wb.SheetNames.find((s) => /solucoes|digitais|cti/i.test(s)) ?? wb.SheetNames[0]
    if (!sheetName) throw new BadRequestException('Planilha sem abas')

    const ws = wb.Sheets[sheetName]
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null })

    type RowOut = {
      id: string
      tipo: string
      nome: string
      descricao: string | null
      setor: string | null
      stack: string | null
      urlRepositorio: string | null
      imagem: string | null
      responsavel: string | null
      dataInicio: Date | null
      observacoes: string | null
      statusProjeto: string
      urlProducao: string | null
      ordem: number
    }

    const data: RowOut[] = []
    let ordem = 0

    for (const raw of rawRows) {
      const r = rowNormalized(raw)
      const nome = cleanStr(r.nome)
      const tipo = parseTipoSolucao(r.tipo)
      if (!nome) continue
      if (nome.toLowerCase() === 'nome') continue
      if (!tipo) continue

      const { statusProjeto, urlProducao: urlProdParsed } = parseObservacoesSolucao(r.observacoes)
      const urlRepo = cleanHttpUrl(cleanStr(r.link))

      data.push({
        id: randomUUID(),
        tipo,
        nome,
        descricao: cleanStr(r.descricao),
        setor: cleanStr(r.setor),
        stack: cleanStr(r.stack),
        urlRepositorio: urlRepo,
        imagem: cleanStr(r.imagem),
        responsavel: cleanStr(r.responsavel),
        dataInicio: parseDate(r.datadeinicio ?? r.datadeinício),
        observacoes: cleanStr(r.observacoes),
        statusProjeto,
        urlProducao: urlProdParsed,
        ordem: ordem++,
      })
    }

    if (data.length === 0) {
      throw new BadRequestException('Nenhuma solucao valida encontrada. A base atual foi preservada.')
    }

    const concl = data.filter((d) => d.statusProjeto === 'concluida').length
    const and = data.filter((d) => d.statusProjeto === 'em_andamento').length
    const msg = `${data.length} solução(ões) importada(s): ${concl} concluída(s), ${and} em andamento`

    await this.prisma.$transaction(async (tx) => {
      await tx.solucaoDigital.deleteMany()
      await tx.solucaoDigital.createMany({ data })
      await this.logImport({
        tipo: 'solucoes_digitais',
        filename: file.originalname,
        rowsCount: data.length,
        message: msg,
      }, tx)
    })

    return {
      message: msg,
      total: data.length,
      concluidas: concl,
      emAndamento: and,
    }
  }

  @Post('contratos')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadContratos(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado')

    const wb = XLSX.read(file.buffer, { type: 'buffer', cellDates: true })
    const parsed = parseContratosWorkbook(wb)
    if (parsed.length === 0) {
      throw new BadRequestException('Nenhum contrato válido encontrado nas abas OI, CLARO e SIMPRESS.')
    }

    const contratosData = parsed.map((s) => ({
      id: randomUUID(),
      prestador: s.prestador,
      nomeServico: s.nomeServico,
      numeroReferencia: s.numeroReferencia,
      dataInicio: s.dataInicio,
      dataFinal: s.dataFinal,
      observacoes: s.observacoes,
    }))
    const idByServiceKey = new Map<string, string>()
    for (const row of contratosData) {
      idByServiceKey.set(`${row.prestador}::${row.nomeServico}`, row.id)
    }

    const pagamentosData: {
      id: string
      servicoId: string
      ano: number
      mes: number
      pagamento: string | null
      status: string
    }[] = []
    for (const servico of parsed) {
      const servicoId = idByServiceKey.get(`${servico.prestador}::${servico.nomeServico}`)
      if (!servicoId) continue
      for (const p of servico.pagamentos) {
        pagamentosData.push({
          id: randomUUID(),
          servicoId,
          ano: p.ano,
          mes: p.mes,
          pagamento: p.pagamento,
          status: p.status,
        })
      }
    }

    const msg = `${contratosData.length} contrato(s)/serviço(s) e ${pagamentosData.length} competência(s) mensal(is) importados com sucesso`

    await this.prisma.$transaction(async (tx) => {
      await tx.contratoPagamentoMensal.deleteMany()
      await tx.contratoServico.deleteMany()
      await tx.contratoServico.createMany({ data: contratosData })
      await tx.contratoPagamentoMensal.createMany({ data: pagamentosData })
      await this.logImport({
        tipo: 'contratos',
        filename: file.originalname,
        rowsCount: pagamentosData.length,
        message: msg,
      }, tx)
    })

    return {
      message: msg,
      servicos: contratosData.length,
      competencias: pagamentosData.length,
    }
  }
}
