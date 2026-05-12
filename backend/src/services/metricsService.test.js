const { generateMetrics } = require('./metricsService')

describe('generateMetrics', () => {
  test('returns all required fields', () => {
    const metrics = generateMetrics()
    expect(metrics).toHaveProperty('id')
    expect(metrics).toHaveProperty('timestamp')
    expect(metrics).toHaveProperty('cpu')
    expect(metrics).toHaveProperty('memory')
    expect(metrics).toHaveProperty('requestCount')
    expect(metrics).toHaveProperty('errorRate')
    expect(metrics).toHaveProperty('p99Latency')
  })

  test('cpu is between 10 and 70', () => {
    const metrics = generateMetrics()
    expect(metrics.cpu).toBeGreaterThanOrEqual(10)
    expect(metrics.cpu).toBeLessThanOrEqual(70)
  })

  test('memory is between 30 and 70', () => {
    const metrics = generateMetrics()
    expect(metrics.memory).toBeGreaterThanOrEqual(30)
    expect(metrics.memory).toBeLessThanOrEqual(70)
  })

  test('errorRate is between 0 and 5', () => {
    const metrics = generateMetrics()
    expect(metrics.errorRate).toBeGreaterThanOrEqual(0)
    expect(metrics.errorRate).toBeLessThanOrEqual(5)
  })

  test('id is a valid uuid', () => {
    const metrics = generateMetrics()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    expect(metrics.id).toMatch(uuidRegex)
  })
})