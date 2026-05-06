import { describe, it, expect, beforeEach } from 'vitest'
import { localDB, DB_KEYS } from './localDB'

type Item = { id: string; nome: string }

const KEY = DB_KEYS.data

beforeEach(() => {
  localStorage.clear()
})

describe('localDB', () => {
  it('2.1 set e get persistem dado', () => {
    localDB.set(KEY, { nome: 'Teste' })
    expect(localDB.get(KEY)).toEqual({ nome: 'Teste' })
  })

  it('2.2 get retorna null para chave inexistente', () => {
    expect(localDB.get('chave_inexistente')).toBeNull()
  })

  it('2.3 list retorna array vazio se não há dados', () => {
    expect(localDB.list(KEY)).toEqual([])
  })

  it('2.4 add insere item na lista', () => {
    const result = localDB.add<Item>(KEY, { id: '1', nome: 'João' })
    expect(result).toHaveLength(1)
    expect(result[0].nome).toBe('João')
  })

  it('2.5 update altera apenas o item correto', () => {
    localDB.add<Item>(KEY, { id: '1', nome: 'João' })
    localDB.add<Item>(KEY, { id: '2', nome: 'Maria' })
    const result = localDB.update<Item>(KEY, '1', { nome: 'João Atualizado' })
    expect(result.find(i => i.id === '1')?.nome).toBe('João Atualizado')
    expect(result.find(i => i.id === '2')?.nome).toBe('Maria')
  })

  it('2.6 delete remove apenas o item correto', () => {
    localDB.add<Item>(KEY, { id: '1', nome: 'João' })
    localDB.add<Item>(KEY, { id: '2', nome: 'Maria' })
    const result = localDB.delete<Item>(KEY, '1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('2.7 clearAll limpa todas as chaves', () => {
    Object.values(DB_KEYS).forEach(k => localDB.set(k, ['dado']))
    localDB.clearAll()
    Object.values(DB_KEYS).forEach(k => {
      expect(localDB.get(k)).toBeNull()
    })
  })
})
