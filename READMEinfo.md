> # Clean Architecture

> ## Info
```
const express = require('express')
const router = express.Router()

module.exports = () => {
  const router = new SignUpRouter()
  router.post('/signup', ExpressRouterAdapter.adapt(router))
}

class ExpressRouterAdapter {
  static adapt (router) {
    return async (req, res) => {
      const httpRequest = {
        body: req.body
      }
      const httpResponse = await router.route(httpRequest)
      res.status(httpResponse.statusCode).json(httpResponse.body)
    }
  }
}

// presentation = É o que a API expoe, são as rotas, o que o mundo externo vê
// signup-router
class SignUpRouter {
  async route (httpRequest) {
    const { email, password, repeatPasswor } = httpRequest.body
    const user = new SignUpUseCase().signUp(email, password, repeatPasswor)

    return {
      statusCode: 200,
      body: user
    }
  }
}

// domain = Regras de negócio da aplicação
// signup-usecase
class SignUpUseCase {
  async signUp (email, password, repeatPassword) {
    if (password === repeatPassword) {
      new AddAccountRepostiry().add(email, password)
    }
  }
}

// infra = Repositórios ficam na Infra layer, é a camada de infra estrutura que é onde a gente escolhe qual framework/ORM a gente vai escolher
// para acessar o banco de dados
// add-account-repo
const mongoose = require('mongoose')
const AccountModel = mongoose.model('Account')

class AddAccountRepostiry {
  async add (email, password, repeatPassword) {
    const user = await AccountModel.create({ email, password })
    return user
  }
}


```