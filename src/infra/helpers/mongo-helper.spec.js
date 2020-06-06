const sut = require('./mongo-helper')

describe('Mongo Helper', () => {
  beforeAll(async () => {
    await sut.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await sut.disconnect()
  })

  test('should reconnect if mongodb is down', async () => {
    expect(sut.db).toBeTruthy()

    await sut.disconnect()
    expect(sut.db).toBeFalsy()

    await sut.getDb()
    expect(sut.db).toBeTruthy()
  })
})
