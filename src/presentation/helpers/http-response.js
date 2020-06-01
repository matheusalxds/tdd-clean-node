const MissingParamError = require('./missing-param-error')
const UnauthorizedParamError = require('./unauthorized-error')

module.exports = class HttpResponse {
  static badRequest (paramName) {
    return {
      statusCode: 400,
      body: new MissingParamError(paramName)
    }
  }

  static serverError () {
    return {
      statusCode: 500
    }
  }

  static unauthorizedError () {
    return {
      statusCode: 401,
      body: new UnauthorizedParamError()
    }
  }

  static ok () {
    return {
      statusCode: 200
    }
  }
}
