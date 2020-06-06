const MongoHelper = require('../helpers/mongo-helper')

let db

const createFakeUser = async (userModel) => {
  const fakeUser = await userModel.insertOne({
    email: 'valid_email@mail.com',
    name: 'any_name',
    age: 50,
    state: 'any_state',
    password: 'hashed_password'
  })

  return fakeUser
}

class UpdateAccessTokenRepository {
  constructor (userModel) {
    this.userModel = userModel
  }

  async update (userId, accessToken) {
    await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          accessToken
        }
      }
    )
  }
}

describe('UploadAccessToken Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
    db = await MongoHelper.getDb()
  })

  beforeEach(async () => {
    await db.collection('users').deleteMany()
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  test('should update the uesr with the given access token', async () => {
    const userModel = db.collection('users')
    const sut = new UpdateAccessTokenRepository(userModel)
    const fakeUser = await createFakeUser(userModel)
    await sut.update(fakeUser.ops[0]._id, 'valid_token')
    const updatedFakeUser = await userModel.findOne({
      _id: fakeUser.ops[0]._id
    })
    expect(updatedFakeUser.accessToken).toBe('valid_token')
  })

  test('should throw if no userModel is provided', async () => {
    const sut = new UpdateAccessTokenRepository()
    const userModel = db.collection('users')
    const fakeUser = await createFakeUser(userModel)
    const promise = sut.update(fakeUser.ops[0]._id, 'valid_token')
    expect(promise).rejects.toThrow()
  })
})
