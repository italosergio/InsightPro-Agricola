export interface ValidationResult {
  valido: boolean
  formatado: string
}

function limparDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

function calcularDigitoCPF(digitos: number[]): number {
  const soma = digitos.reduce((acc, d, i) => acc + d * (10 - i), 0)
  const resto = (soma * 10) % 11
  return resto >= 10 ? 0 : resto
}

function calcularDigitoCNPJ(digitos: number[], pesos: number[]): number {
  const soma = digitos.reduce((acc, d, i) => acc + d * pesos[i], 0)
  const resto = soma % 11
  return resto < 2 ? 0 : 11 - resto
}

export function validarCPF(cpf: string): ValidationResult {
  const digitos = limparDigitos(cpf).split('').map(Number)

  if (digitos.length !== 11) return { valido: false, formatado: cpf }
  if (digitos.every(d => d === digitos[0])) return { valido: false, formatado: cpf }

  const base = digitos.slice(0, 9)
  const d1 = calcularDigitoCPF(base)
  if (d1 !== digitos[9]) return { valido: false, formatado: cpf }

  const base2 = [...base, d1]
  const d2 = calcularDigitoCPF(base2)
  if (d2 !== digitos[10]) return { valido: false, formatado: cpf }

  const raw = digitos.join('')
  const formatado = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9, 11)}`

  return { valido: true, formatado }
}

export function validarCNPJ(cnpj: string): ValidationResult {
  const digitos = limparDigitos(cnpj).split('').map(Number)

  if (digitos.length !== 14) return { valido: false, formatado: cnpj }
  if (digitos.every(d => d === digitos[0])) return { valido: false, formatado: cnpj }

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const d1 = calcularDigitoCNPJ(digitos.slice(0, 12), pesos1)
  if (d1 !== digitos[12]) return { valido: false, formatado: cnpj }

  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const d2 = calcularDigitoCNPJ([...digitos.slice(0, 12), d1], pesos2)
  if (d2 !== digitos[13]) return { valido: false, formatado: cnpj }

  const raw = digitos.join('')
  const formatado = `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 12)}-${raw.slice(12, 14)}`

  return { valido: true, formatado }
}

export function validarCPFouCNPJ(valor: string): ValidationResult & { tipo: 'cpf' | 'cnpj' | null } {
  const digitos = limparDigitos(valor)
  if (digitos.length <= 11) {
    const result = validarCPF(valor)
    return { ...result, tipo: result.valido ? 'cpf' : null }
  }
  const result = validarCNPJ(valor)
  return { ...result, tipo: result.valido ? 'cnpj' : null }
}

export function validarTelefone(telefone: string): ValidationResult {
  const digitos = limparDigitos(telefone)

  if (digitos.length < 10 || digitos.length > 11) {
    return { valido: false, formatado: telefone }
  }

  const ddd = digitos.slice(0, 2)
  if (parseInt(ddd) < 11) return { valido: false, formatado: telefone }

  let formatado: string
  if (digitos.length === 11) {
    formatado = `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7, 11)}`
  } else {
    formatado = `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6, 10)}`
  }

  return { valido: true, formatado }
}

export function validarEmail(email: string): boolean {
  if (!email) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function temConteudo(valor: string): boolean {
  return valor.trim().length > 0
}
