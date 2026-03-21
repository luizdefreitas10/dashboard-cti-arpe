import { GetAtividadesStatsUseCase } from './get-atividades-stats'
import { AtividadesRepository } from '../repositories/atividades-repository'
import { AtividadesStats } from '../repositories/atividades-repository'

function makeFakeStats(): AtividadesStats {
  return {
    total: 100,
    porCategoria: [],
    porSetor: [],
    porResponsavel: [],
    porPrioridade: [],
    porMes: [],
    porMesPrioridade: [],
    porDiaSemanaMes: [],
    porNomeAtividade: [],
    porAno: [{ ano: '2024', total: 100 }],
    dataMinimaAtividade: '2024-01-01',
    dataMaximaAtividade: '2024-12-31',
    anosComDados: ['2024'],
  }
}

function makeAtividadesRepository(override?: Partial<AtividadesRepository>) {
  return {
    getStats: jest.fn().mockResolvedValue(makeFakeStats()),
    ...override,
  } as unknown as AtividadesRepository
}

describe('GetAtividadesStatsUseCase', () => {
  it('deve retornar stats do repositório', async () => {
    const stats = makeFakeStats()
    const repo = makeAtividadesRepository({ getStats: jest.fn().mockResolvedValue(stats) })
    const sut = new GetAtividadesStatsUseCase(repo)

    const result = await sut.execute()

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value).toEqual(stats)
      expect(result.value.total).toBe(100)
    }
  })

  it('deve passar filtros de data quando informados', async () => {
    const repo = makeAtividadesRepository()
    const sut = new GetAtividadesStatsUseCase(repo)

    await sut.execute({
      dataInicio: '2024-06-01',
      dataFim: '2024-06-30',
    })

    expect(repo.getStats).toHaveBeenCalledWith({
      dataInicio: '2024-06-01',
      dataFim: '2024-06-30',
    })
  })

  it('deve chamar getStats sem filtros quando input vazio', async () => {
    const repo = makeAtividadesRepository()
    const sut = new GetAtividadesStatsUseCase(repo)

    await sut.execute()

    expect(repo.getStats).toHaveBeenCalledWith({})
  })
})
