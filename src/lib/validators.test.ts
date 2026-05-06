import { describe, it, expect } from 'vitest'
import {
  validarCPF,
  validarCNPJ,
  validarCPFouCNPJ,
  validarTelefone,
  validarEmail,
  temConteudo,
} from './validators'

describe('validarCPF', () => {
  it('1.1 aceita CPF válido', () => {
    expect(validarCPF('529.982.247-25').valido).toBe(true)
  })

  it('1.2 rejeita CPF com dígito verificador errado', () => {
    expect(validarCPF('529.982.247-26').valido).toBe(false)
  })

  it('1.3 rejeita CPF com todos os dígitos iguais', () => {
    expect(validarCPF('111.111.111-11').valido).toBe(false)
  })

  it('1.4 formata CPF corretamente', () => {
    expect(validarCPF('52998224725').formatado).toBe('529.982.247-25')
  })
})

describe('validarCNPJ', () => {
  it('1.5 aceita CNPJ válido', () => {
    expect(validarCNPJ('11.222.333/0001-81').valido).toBe(true)
  })

  it('1.6 rejeita CNPJ com dígito verificador errado', () => {
    expect(validarCNPJ('11.222.333/0001-82').valido).toBe(false)
  })

  it('1.7 rejeita CNPJ com todos os dígitos iguais', () => {
    expect(validarCNPJ('11.111.111/1111-11').valido).toBe(false)
  })
})

describe('validarCPFouCNPJ', () => {
  it('1.8 detecta tipo CPF', () => {
    expect(validarCPFouCNPJ('529.982.247-25').tipo).toBe('cpf')
  })

  it('1.9 detecta tipo CNPJ', () => {
    expect(validarCPFouCNPJ('11.222.333/0001-81').tipo).toBe('cnpj')
  })

  it('retorna tipo null para documento inválido', () => {
    expect(validarCPFouCNPJ('000.000.000-00').tipo).toBeNull()
  })
})

describe('validarTelefone', () => {
  it('1.10 aceita celular com 11 dígitos', () => {
    const r = validarTelefone('(11) 99999-9999')
    expect(r.valido).toBe(true)
    expect(r.formatado).toBe('(11) 99999-9999')
  })

  it('1.11 aceita telefone fixo com 10 dígitos', () => {
    const r = validarTelefone('(11) 3333-4444')
    expect(r.valido).toBe(true)
    expect(r.formatado).toBe('(11) 3333-4444')
  })

  it('1.12 rejeita DDD inválido (menor que 11)', () => {
    expect(validarTelefone('(09) 99999-9999').valido).toBe(false)
  })

  it('rejeita número com menos de 10 dígitos', () => {
    expect(validarTelefone('9999-9999').valido).toBe(false)
  })
})

describe('validarEmail', () => {
  it('1.13 aceita email válido', () => {
    expect(validarEmail('teste@email.com')).toBe(true)
  })

  it('1.14 rejeita email inválido', () => {
    expect(validarEmail('nao-e-email')).toBe(false)
  })

  it('1.15 aceita string vazia (campo opcional)', () => {
    expect(validarEmail('')).toBe(true)
  })
})

describe('temConteudo', () => {
  it('retorna true para string com conteúdo', () => {
    expect(temConteudo('texto')).toBe(true)
  })

  it('retorna false para string vazia ou só espaços', () => {
    expect(temConteudo('   ')).toBe(false)
  })
})
