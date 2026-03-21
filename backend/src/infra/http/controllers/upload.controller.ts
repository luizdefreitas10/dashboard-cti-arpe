import {
  Controller, Post, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
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
  }) {
    await this.prisma.dataImportLog.create({
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

    await this.prisma.atividade.deleteMany()

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

    await this.prisma.atividade.createMany({ data, skipDuplicates: true })

    await this.logImport({
      tipo: 'atividades',
      filename: file.originalname,
      rowsCount: data.length,
      message: `${data.length} atividades importadas com sucesso`,
    })

    return { message: `${data.length} atividades importadas com sucesso`, total: data.length }
  }

  @Post('bens')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadBens(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado')

    const wb = XLSX.read(file.buffer, { type: 'buffer' })

    await this.prisma.$transaction([
      this.prisma.bem.deleteMany(),
      this.prisma.software.deleteMany(),
      this.prisma.ramal.deleteMany(),
      this.prisma.celular.deleteMany(),
    ])

    let totals = { bens: 0, softwares: 0, ramais: 0, celulares: 0 }

    const wsBens = wb.Sheets['Monitoramento_Bens']
    if (wsBens) {
      const rows = XLSX.utils.sheet_to_json(wsBens, { header: 1, defval: null }) as unknown[][]
      const data = rows.slice(1).filter((r) => r[0]).map((r) => ({
        id: randomUUID(), tombamento: String(r[0]).trim(),
        tipoHardware: cleanStr(r[1]), modelo: cleanStr(r[2]),
        usuario: cleanStr(r[3]), setor: cleanStr(r[4]),
        finalidadePrincipal: cleanStr(r[5]), sistemaOperacional: cleanStr(r[6]),
        criticidade: cleanStr(r[7]),
      }))
      await this.prisma.bem.createMany({ data, skipDuplicates: true })
      totals.bens = data.length
    }

    const wsSw = wb.Sheets['Ativos_Software']
    if (wsSw) {
      const rows = XLSX.utils.sheet_to_json(wsSw, { header: 1, defval: null }) as unknown[][]
      const data = rows.slice(1).filter((r) => r[0]).map((r) => ({
        id: randomUUID(), nome: String(r[0]).trim(),
        versao: cleanStr(r[1]), finalidade: cleanStr(r[2]),
      }))
      await this.prisma.software.createMany({ data, skipDuplicates: true })
      totals.softwares = data.length
    }

    const wsRamais = wb.Sheets['Monitoramento_Telefones']
    if (wsRamais) {
      const rows = XLSX.utils.sheet_to_json(wsRamais, { header: 1, defval: null }) as unknown[][]
      const data = rows.slice(1).filter((r) => r[0] && typeof r[1] === 'number').map((r) => {
        const digital = Number(r[1]) || 0
        const analogico = Number(r[2]) || 0
        return { id: randomUUID(), setor: String(r[0]).trim(), digital, analogico, total: digital + analogico, descricao: cleanStr(r[4]) }
      })
      await this.prisma.ramal.createMany({ data, skipDuplicates: true })
      totals.ramais = data.length
    }

    const wsCel = wb.Sheets['Monitoramento_Celulares']
    if (wsCel) {
      const rows = XLSX.utils.sheet_to_json(wsCel, { header: 1, defval: null }) as unknown[][]
      const data = rows.slice(1).filter((r) => r[0] && r[2]).map((r) => ({
        id: randomUUID(), modelo: String(r[0]).trim(), setor: cleanStr(r[1]) ?? 'CTI', imei: String(r[2]).trim(),
      }))
      await this.prisma.celular.createMany({ data, skipDuplicates: true })
      totals.celulares = data.length
    }

    const msg = `Bens importados: ${totals.bens} equipamentos, ${totals.softwares} softwares, ${totals.ramais} ramais, ${totals.celulares} celulares`
    await this.logImport({
      tipo: 'bens',
      filename: file.originalname,
      rowsCount: totals.bens + totals.softwares + totals.ramais + totals.celulares,
      message: msg,
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

    await this.prisma.$transaction([this.prisma.powerBiReport.deleteMany(), this.prisma.powerBiReport.createMany({ data })])

    const concluidosCount = data.filter((d) => d.status === 'concluido').length
    const emAndamentoCount = data.filter((d) => d.status === 'em_andamento').length
    const msg = `${data.length} dashboard(s) importado(s): ${concluidosCount} concluído(s), ${emAndamentoCount} em andamento`
    await this.logImport({
      tipo: 'power_bi',
      filename: file.originalname,
      rowsCount: data.length,
      message: msg,
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

    await this.prisma.$transaction([
      this.prisma.solucaoDigital.deleteMany(),
      this.prisma.solucaoDigital.createMany({ data }),
    ])

    const concl = data.filter((d) => d.statusProjeto === 'concluida').length
    const and = data.filter((d) => d.statusProjeto === 'em_andamento').length
    const msg =
      data.length === 0
        ? 'Nenhuma solução importada — base limpa. Verifique colunas TIPO e NOME.'
        : `${data.length} solução(ões) importada(s): ${concl} concluída(s), ${and} em andamento`
    await this.logImport({
      tipo: 'solucoes_digitais',
      filename: file.originalname,
      rowsCount: data.length,
      message: msg,
    })
    return {
      message: msg,
      total: data.length,
      concluidas: concl,
      emAndamento: and,
    }
  }
}
