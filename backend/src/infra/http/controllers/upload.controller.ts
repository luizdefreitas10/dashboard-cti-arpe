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

function parseDate(val: unknown): Date | null {
  if (!val) return null
  if (val instanceof Date) return val
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val)
    if (d) return new Date(d.y, d.m - 1, d.d)
  }
  const d = new Date(String(val))
  return isNaN(d.getTime()) ? null : d
}

@Controller('upload')
export class UploadController {
  constructor(private prisma: PrismaService) {}

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

    return {
      message: `Bens importados: ${totals.bens} equipamentos, ${totals.softwares} softwares, ${totals.ramais} ramais, ${totals.celulares} celulares`,
      totals,
    }
  }
}
