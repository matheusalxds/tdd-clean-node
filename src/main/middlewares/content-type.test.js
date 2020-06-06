const request = require('supertest')
const app = require('../config/app')

describe('Content-Type Middleware', () => {
  it('should return json content type as defualt', async () => {
    app.get('/test_content_type', (req, res) => {
      res.send('')
    })
    await request(app).get('/test_content_type').expect('content-type', /json/)
  })
})
