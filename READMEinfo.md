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
> ## StatusCode
401 = Unauthorized, mas não sabe quem é o usuário, não foi encontrado na base. 
403 = Unauthorized, porém sabe quem é o usuário, por exemplo um usuário logado X, que tenta fazer acesso a funções de um Admin por exemplo, ele não tem permissão para fazer aquela ação.

> ## Main layer
As variáveis de ambiente deveriam ficar dentro da layer Main, porém nenhuma das outras layers deveria acessar o Main layer e sim ao contrário, apenas o Main acessa as outras Layers, então para conseguir utilizar utilizar uma variável de ambiente dentro de qualquer outra layer, seria através de Dependency Injection. Então no nosso Main Layer quando formos utilizar o Token Generator por exemplo, ai sim podemos utilizar as variáveis de ambiente e não acessar diretamente o valor dentro da classe do Token Generator.