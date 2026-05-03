export const produtosAJINOMOTO = [
  'AminoPlus® AJINOMOTO',
  'Amino Arginine® AJINOMOTO',
  'Amino Proline® AJINOMOTO',
  'Amiorgan® AJINOMOTO',
  'Ajifol® Premium+ AJINOMOTO',
  'AminoFort® AJINOMOTO',
  'AminoReten® AJINOMOTO',
  'AjiPower® AJINOMOTO',
  'Ajifol® K-Mg AJINOMOTO',
  'AlgenMax® AJINOMOTO',
  'Bokashi® AJINOMOTO',
  'Ajifol® SM-Boro AJINOMOTO',
]

const clientNames = [
  'Agrícola Planalto Goiano', 'Fazenda Bela Vista Agroflorestal', 'Hortifrúti Orgânico Chapada',
  'Fazenda Santa Terezinha', 'Floresta Verde Reflorestamento', 'Agroindústria Paranaíba',
  'Agrícola Piauí Cerrado', 'Cerealistas Trigo & Cia', 'Fazenda Bom Retiro Pecuária',
  'Agropecuária Tabuleiro Grande', 'Hortaliças Top Quality', 'Fazenda Palmeira do Norte',
  'Agroveterinária Leite Bom', 'Fazenda Três Marias Agropecuária', 'Agropecuária Serra Azul S/A',
  'Goiás Verde Hortifrúti', 'Agropecuária Boa Vista Ltda', 'Café Mantiqueira Exportação',
  'Pecuária Nova Fronteira', 'Fruticultura Serrana Orgânicos', 'Sementes Triângulo Mineiro',
  'Arrozeira Gaúcha Exportação', 'Agro Campos Gerais S/A', 'Citrus Nordeste Export Ltda',
  'Cacaueira do Sul da Bahia', 'Vitivinícola Serra Gaúcha', 'Fazenda São Francisco da Mata',
  'Palma Óleos Vegetais S/A', 'Agropecuária Paranaense Ltda', 'Agrícola Matogrossense do Norte',
  'Fazenda Rincão Gaúcho', 'Agropecuária Bela Conquista', 'Fazenda Nova Era Algodão',
  'Fazenda Canavial Centro-Oeste', 'Fazenda São João do Cerrado', 'Usina Itaipava Agroenergia',
  'Algodoeira Oeste Baiano S/A', 'Cooperativa Agroindustrial Copagri', 'Bioenergia Pontal Ltda',
  'Agropecuária Vale do Araguaia', 'Grãos Maranhão Comércio Ltda', 'Agrícola Sul-Mato-Grossense',
  'Café do Cerrado Mineiro Ltda', 'Fazenda Esperança Cerrados', 'Agrícola Nortão Agroindustrial',
]

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function getClientProductos(clientIndex: number): string[] {
  const name = clientNames[clientIndex % clientNames.length]
  const seed = hash(name + '_produtos')
  const count = 1 + (seed % produtosAJINOMOTO.length)
  const result: string[] = []
  const used = new Set<number>()
  for (let i = 0; i < count; i++) {
    const idx = (seed + i * 7 + clientIndex * 3) % produtosAJINOMOTO.length
    if (!used.has(idx)) {
      used.add(idx)
      result.push(produtosAJINOMOTO[idx])
    }
  }
  return result
}

export function getClientName(clientIndex: number): string {
  return clientNames[clientIndex % clientNames.length]
}

export const regioesPorEstado: Record<string, string> = {
  AC: 'Norte', AP: 'Norte', AM: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
  AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste',
  PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
  DF: 'Centro-Oeste', GO: 'Centro-Oeste', MT: 'Centro-Oeste', MS: 'Centro-Oeste',
  ES: 'Sudeste', MG: 'Sudeste', RJ: 'Sudeste', SP: 'Sudeste',
  PR: 'Sul', RS: 'Sul', SC: 'Sul',
}
