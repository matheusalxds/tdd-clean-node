// sut = System Under Test

const LoginRouter = require('./login-router')

const { MissingParamError, InvalidParamError } = require('../../utils/errors')
const { UnauthorizedError, ServerError } = require('../errors')

const makeSut = () => {
  const authUseCaseSpy = makeAuthUseCase()
  const emailValidatorSpy = makeEmailValidator()

  const sut = new LoginRouter({
    authUseCase: authUseCaseSpy,
    emailValidator: emailValidatorSpy
  })

  return {
    sut,
    authUseCaseSpy,
    emailValidatorSpy
  }
}

const makeEmailValidator = () => {
  class EmailValidatorSpy {
    isValid (email) {
      this.email = email
      return this.isEmailValid
    }
  }

  const emailValidatorSpy = new EmailValidatorSpy()
  emailValidatorSpy.isEmailValid = true
  return emailValidatorSpy
}

const makeAuthUseCase = () => {
  class AuthUseCaseSpy {
    auth (email, password) {
      this.email = email
      this.password = password
      return this.accessToken
    }
  }

  const authUseCaseSpy = new AuthUseCaseSpy()
  authUseCaseSpy.accessToken = 'valid_token'

  return authUseCaseSpy
}

const makeAuthUseCaseWithError = () => {
  class AuthUseCaseSpy {
    async auth (email, password) {
      throw new Error()
    }
  }

  return new AuthUseCaseSpy()
}

const makeEmailValidatorWithError = () => {
  class EmailValidatorSpy {
    isValid (email, password) {
      throw new Error()
    }
  }

  return new EmailValidatorSpy()
}

describe('Login Router', () => {
  it('should return 400 if no e-mail is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  it('should return 400 if no password is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  it('should return 500 if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.route()
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  it('should return 500 if no httpRequest has no body', async () => {
    const { sut } = makeSut()
    const httpRequest = {}
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  it('should call AuthUserCase with correct params', async () => {
    const { sut, authUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }
    await sut.route(httpRequest)
    expect(authUseCaseSpy.email).toBe(httpRequest.body.email)
    expect(authUseCaseSpy.password).toBe(httpRequest.body.password)
  })

  it('should return 401 when invalid credentials are provided', async () => {
    const { sut, authUseCaseSpy } = makeSut()
    authUseCaseSpy.accessToken = null
    const httpRequest = {
      body: {
        email: 'invalid_email@mail.com',
        password: 'invalid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError())
  })

  it('should return 200 when valid credentials are provided', async () => {
    const { sut, authUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'valid_email@mail.com',
        password: 'valid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.accessToken)
  })

  // it('should return 500 if no AuthUseCase is provided', async () => {
  //   const sut = new LoginRouter()
  //   const httpRequest = {
  //     body: {
  //       email: 'any_email@mail.com',
  //       password: 'any_password'
  //     }
  //   }
  //   const httpResponse = await sut.route(httpRequest)
  //   expect(httpResponse.statusCode).toBe(500)
  //   expect(httpResponse.body).toEqual(new ServerError())
  // })

  // it('should return 500 if AuthUseCase has no auth method', async () => {
  //   class AuthUseCaseSpy {}
  //   const authUseCaseSpy = new AuthUseCaseSpy()
  //   const sut = new LoginRouter(authUseCaseSpy)
  //   const httpRequest = {
  //     body: {
  //       email: 'any_email@mail.com',
  //       password: 'any_password'
  //     }
  //   }
  //   const httpResponse = await sut.route(httpRequest)
  //   expect(httpResponse.statusCode).toBe(500)
  //   expect(httpResponse.body).toEqual(new ServerError())
  // })

  it('should return 500 if AuthUseCase throws', async () => {
    const authUseCaseSpy = makeAuthUseCaseWithError()
    const sut = new LoginRouter(authUseCaseSpy)
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  it('should return 400 if AuthUseCase throws', async () => {
    const { sut, emailValidatorSpy } = makeSut()
    emailValidatorSpy.isEmailValid = false
    const httpRequest = {
      body: {
        email: 'invalid_email@mail.com',
        password: 'any_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  //  both tests moved to last test
  // it('should return 500 if no EmailValidator is provided', async () => {
  //   const authUseCaseSpy = makeAuthUseCase()
  //   const sut = new LoginRouter(authUseCaseSpy)
  //   const httpRequest = {
  //     body: {
  //       email: 'any_email@mail.com',
  //       password: 'any_password'
  //     }
  //   }
  //   const httpResponse = await sut.route(httpRequest)
  //   expect(httpResponse.statusCode).toBe(500)
  //   expect(httpResponse.body).toEqual(new ServerError())
  // })

  // it('should return 500 if no EmailValidator has no isVaid method', async () => {
  //   const authUseCaseSpy = makeAuthUseCase()
  //   const emailValidatorSpy = {}
  //   const sut = new LoginRouter(authUseCaseSpy, emailValidatorSpy)
  //   const httpRequest = {
  //     body: {
  //       email: 'any_email@mail.com',
  //       password: 'any_password'
  //     }
  //   }
  //   const httpResponse = await sut.route(httpRequest)
  //   expect(httpResponse.statusCode).toBe(500)
  //   expect(httpResponse.body).toEqual(new ServerError())
  // })

  it('should return 500 if EmailValidator throws', async () => {
    const authUseCaseSpy = makeAuthUseCase()
    const emailValidatorSpyWithError = makeEmailValidatorWithError()
    const sut = new LoginRouter(authUseCaseSpy, emailValidatorSpyWithError)
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  it('should call EmailValidator with correct params', async () => {
    const { sut, emailValidatorSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }
    await sut.route(httpRequest)
    expect(emailValidatorSpy.email).toBe(httpRequest.body.email)
  })

  it('should throw if invalid dependencies are provided', async () => {
    const invalid = {}
    const authUseCase = makeAuthUseCase()

    const suts = [].concat(
      new LoginRouter(),
      new LoginRouter({}),
      new LoginRouter({ authUseCase: invalid }),
      new LoginRouter({ authUseCase }),
      new LoginRouter({
        authUseCase,
        emailValidator: invalid
      })
    )
    for (const sut of suts) {
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body).toEqual(new ServerError())
    }
  })
})
