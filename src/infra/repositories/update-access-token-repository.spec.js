const MongoHelper = require('../helpers/mongo-helper')
const MissingParamError = require('../../utils/errors/missing-param-error')
const UpdateAccessTokenRepository = require('./update-access-token-repository')

let fakeUserId, userModel

const createFakeUser = async (_userModel) => {
  const fakeUser = await _userModel.insertOne({
    email: 'valid_email@mail.com',
    name: 'any_name',
    age: 50,
    state: 'any_state',
    password: 'hashed_password'
  })

  return fakeUser
}

const makeSut = () => {
  return new UpdateAccessTokenRepository()
}

describe('UploadAccessToken Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
    userModel = await MongoHelper.getCollection('users')
  })

  beforeEach(async () => {
    await userModel.deleteMany()
    const fakeUser = await createFakeUser(userModel)
    fakeUserId = fakeUser.ops[0]._id
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  test('should update the uesr with the given access token', async () => {
    const sut = makeSut()
    await sut.update(fakeUserId, 'valid_token')
    const updatedFakeUser = await userModel.findOne({
      _id: fakeUserId
    })
    expect(updatedFakeUser.accessToken).toBe('valid_token')
  })

  // test('should throw if no userModel is provided', async () => {
  //   const sut = new UpdateAccessTokenRepository()
  //   const promise = sut.update(fakeUserId, 'valid_token')
  //   expect(promise).rejects.toThrow()
  // })

  test('should throw if no params are provided', async () => {
    const sut = makeSut()
    expect(sut.update()).rejects.toThrow(new MissingParamError('userId'))
    expect(sut.update(fakeUserId)).rejects.toThrow(
      new MissingParamError('accessToken')
    )
  })
})
