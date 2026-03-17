import { Bem } from '@/domain/bens/enterprise/entities/bem'
import { UniqueEntityID } from '@/core/entities/entity'

interface PrismaBem {
  id: string
  tombamento: string
  tipoHardware: string | null
  modelo: string | null
  usuario: string | null
  setor: string | null
  finalidadePrincipal: string | null
  sistemaOperacional: string | null
  criticidade: string | null
}

export class PrismaBemMapper {
  static toDomain(raw: PrismaBem): Bem {
    return Bem.create(
      {
        tombamento: raw.tombamento,
        tipoHardware: raw.tipoHardware,
        modelo: raw.modelo,
        usuario: raw.usuario,
        setor: raw.setor,
        finalidadePrincipal: raw.finalidadePrincipal,
        sistemaOperacional: raw.sistemaOperacional,
        criticidade: raw.criticidade,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(bem: Bem) {
    return {
      id: bem.id.toString(),
      tombamento: bem.tombamento,
      tipoHardware: bem.tipoHardware ?? null,
      modelo: bem.modelo ?? null,
      usuario: bem.usuario ?? null,
      setor: bem.setor ?? null,
      finalidadePrincipal: bem.finalidadePrincipal ?? null,
      sistemaOperacional: bem.sistemaOperacional ?? null,
      criticidade: bem.criticidade ?? null,
    }
  }
}
