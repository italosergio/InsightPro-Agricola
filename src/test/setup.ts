import '@testing-library/jest-dom'
import { vi } from 'vitest'

// scrollIntoView não existe no jsdom
window.HTMLElement.prototype.scrollIntoView = () => {}

// IntersectionObserver não existe no jsdom
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return [] }
  unobserve() {}
} as any

// Mock Highcharts (não funciona em jsdom)
vi.mock('highcharts', () => ({
  default: {
    chart: vi.fn(),
  },
}))

vi.mock('highcharts-react-official', () => ({
  default: () => null,
}))
