import { Bem } from '@/domain/bens/enterprise/entities/bem'

export class BemPresenter {
  static toHTTP(bem: Bem) {
    return {
      id: bem.id.toString(),
      tombamento: bem.tombamento,
      tipoHardware: bem.tipoHardware,
      modelo: bem.modelo,
      usuario: bem.usuario,
      setor: bem.setor,
      finalidadePrincipal: bem.finalidadePrincipal,
      sistemaOperacional: bem.sistemaOperacional,
      criticidade: bem.criticidade,
    }
  }
}
