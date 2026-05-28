import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as path from 'path'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

function assertSeedIsAllowed() {
  const databaseUrl = process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL ?? ''
  const isRemoteDatabase = /^postgres(ql)?:\/\//i.test(databaseUrl) && !/(localhost|127\.0\.0\.1|dashboard_cti_db)/i.test(databaseUrl)
  const isProductionLike =
    process.env.NODE_ENV === 'production' ||
    process.env.RENDER === 'true' ||
    process.env.VERCEL === '1' ||
    isRemoteDatabase

  if (!isProductionLike || process.env.ALLOW_PRODUCTION_SEED === 'true') {
    return
  }

  console.error(
    [
      'Seed bloqueado por seguranca.',
      'Este script apaga e recria dados de tabelas importadas, entao nao deve rodar em producao ou bancos remotos por acidente.',
      'Se voce realmente precisa executar este seed, rode com ALLOW_PRODUCTION_SEED=true.',
    ].join('\n'),
  )
  process.exit(1)
}

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

async function seedAtividades() {
  console.log('📋 Importando atividades...')
  const filePath = path.join(__dirname, '../data/atividades_padronizadas.xlsx')
  const wb = XLSX.readFile(filePath)
  const ws = wb.Sheets['BASE_PADRONIZADA']
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null }) as unknown[][]

  const BATCH = 200
  let count = 0

  await prisma.atividade.deleteMany()

  for (let i = 1; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const data = batch
      .filter((row) => row[0])
      .map((row) => ({
        id: randomUUID(),
        categoria: cleanStr(row[0]) ?? 'Outros',
        nome: cleanStr(row[1]) ?? 'Sem nome',
        diaSemana: cleanStr(row[2]),
        data: parseDate(row[3]),
        horario: cleanStr(row[4]),
        responsavel: cleanStr(row[5]),
        solicitante: cleanStr(row[6]),
        setor: cleanStr(row[7]),
        prioridade: cleanStr(row[8]),
        estado: cleanStr(row[9]),
        observacao: cleanStr(row[10]),
        createdAt: new Date(),
      }))

    if (data.length > 0) {
      await prisma.atividade.createMany({ data, skipDuplicates: true })
      count += data.length
      process.stdout.write(`\r  atividades: ${count}/${rows.length - 1}`)
    }
  }

  console.log(`\n  ✅ ${count} atividades importadas`)
}

async function seedBens() {
  console.log('🖥️  Importando bens patrimoniais...')
  const filePath = path.join(__dirname, '../data/Monitoramento de Bens - CTI.xlsx')
  const wb = XLSX.readFile(filePath)

  await prisma.bem.deleteMany()
  await prisma.software.deleteMany()
  await prisma.ramal.deleteMany()
  await prisma.celular.deleteMany()

  // Bens
  const wsBens = wb.Sheets['Monitoramento_Bens']
  const rowsBens = XLSX.utils.sheet_to_json(wsBens, { header: 1, defval: null }) as unknown[][]
  const bensList = rowsBens
    .slice(1)
    .filter((r) => r[0])
    .map((r) => ({
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

  await prisma.bem.createMany({ data: bensList, skipDuplicates: true })
  console.log(`  ✅ ${bensList.length} bens importados`)

  // Softwares
  const wsSw = wb.Sheets['Ativos_Software']
  const rowsSw = XLSX.utils.sheet_to_json(wsSw, { header: 1, defval: null }) as unknown[][]
  const swList = rowsSw
    .slice(1)
    .filter((r) => r[0])
    .map((r) => ({
      id: randomUUID(),
      nome: String(r[0]).trim(),
      versao: cleanStr(r[1]),
      finalidade: cleanStr(r[2]),
    }))

  await prisma.software.createMany({ data: swList, skipDuplicates: true })
  console.log(`  ✅ ${swList.length} softwares importados`)

  // Ramais
  const wsRamais = wb.Sheets['Monitoramento_Telefones']
  const rowsRamais = XLSX.utils.sheet_to_json(wsRamais, { header: 1, defval: null }) as unknown[][]
  const ramaisList = rowsRamais
    .slice(1)
    .filter((r) => r[0] && typeof r[1] === 'number')
    .map((r) => {
      const digital = Number(r[1]) || 0
      const analogico = Number(r[2]) || 0
      return {
        id: randomUUID(),
        setor: String(r[0]).trim(),
        digital,
        analogico,
        total: digital + analogico,
        descricao: cleanStr(r[4]),
      }
    })

  await prisma.ramal.createMany({ data: ramaisList, skipDuplicates: true })
  console.log(`  ✅ ${ramaisList.length} ramais importados`)

  // Celulares
  const wsCel = wb.Sheets['Monitoramento_Celulares']
  const rowsCel = XLSX.utils.sheet_to_json(wsCel, { header: 1, defval: null }) as unknown[][]
  const celList = rowsCel
    .slice(1)
    .filter((r) => r[0] && r[2])
    .map((r) => ({
      id: randomUUID(),
      modelo: String(r[0]).trim(),
      setor: cleanStr(r[1]) ?? 'CTI',
      imei: String(r[2]).trim(),
    }))

  await prisma.celular.createMany({ data: celList, skipDuplicates: true })
  console.log(`  ✅ ${celList.length} celulares importados`)
}

async function main() {
  assertSeedIsAllowed()
  console.log('\n🌱 Iniciando seed do Dashboard CTI...\n')
  try {
    await seedAtividades()
    await seedBens()
    console.log('\n🎉 Seed concluído com sucesso!\n')
  } catch (err) {
    console.error('❌ Erro no seed:', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
