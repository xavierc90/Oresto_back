const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const server = require('./../../server')
const should = chai.should()
const _ = require('lodash')
const passport = require('passport')
var users = []
var token = ""
chai.use(chaiHttp)

describe("POST - /user", () => {
    it("Ajouter un utilisateur . - S", (done) => {
        chai.request(server).post('/user').send({
            firstName: "Test",
            lastName: "Test",
            username: "testeur",
            email: "betatesteur@gmail.com",
            password: "azerty",
            phone_number: 1234567890,
        }).end((err, res) => {
            expect(res).to.have.status(201)
            users.push(res.body)
            done()
        });
    })
    it("Ajouter un utilisateur incorrect. (Sans firstName) - E", (done) => {
        chai.request(server).post('/user').send({
            lastName: 'Us',
            username: 'dwarfSlayr',
            email: 'lutfu.us@gmil.com',
            password: "azerty"
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un utilisateur incorrect. (Avec username déjà existant) - E", (done) => {
        chai.request(server).post('/user').send({
            firstName: "luf",
            lastName: "Us",
            username: "test",
            email: "test@gmail.com",
            password: "azerty"
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un utilisateur incorrect. (Avec un champ vide) - E", (done) => {
        chai.request(server).post('/user').send({
            firstName: "luffu",
            lastName: "",
            username: "dwarfSlaye",
            email: "lufu.us@gmai.com",
            password: "azerty"
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})

describe("POST - /login", () => {
    it("Connexion utilisateur - S", (done) => {
        chai.request(server).post('/login').send({
            username: "testeur",
            password: "azerty",
        }).end((err, res) => {
            res.should.have.status(200)
            token = res.body.token
            done()    
        })
    })
    it("Connexion utilisateur - Identifiant incorrect - E", (done) => {
        chai.request(server).post('/login').send({
            username: "identifiant_incorrect",
            password: "azerty",
        }).end((err, res) => {
            res.should.have.status(401)
            done()    
        })
    })
    it("Connexion utilisateur - Mot de passe incorrect - E", (done) => {
        chai.request(server).post('/login').send({
            username: "test",
            password: "password_incorrect",
        }).end((err, res) => {
            res.should.have.status(401)
            done()    
        })
    })
})

describe("POST - /users", () => {
    it("Ajout de plusieurs utilisateurs. - E (Unauthorized)", (done) => {
        chai.request(server).post('/users')
        .send([{
            firstName: "Test",
            lastName: "Test",
            username: "plplplplpl",
            email: "testeur@gmail.com",
            password: "azerty",
            phone_number: 1234567890,
        },
        {
            firstName: "Test",
            lastName: "Test",
            username: "mlmlmlmlml",
            email: "besteur@gmail.com",
            password: "azty",
            phone_number: 1234567890,
        }])
        .end((err, res) => {
          res.should.have.status(401)
          done()
        })
      })
  it("Ajout de plusieurs utilisateurs. - S", (done) => {
    chai.request(server).post('/users')
    .auth(token, { type: 'bearer' }) 
    .send([{
      firstName: "Edouard",
      lastName: "BERNIER",
      username: "edbernie12",
      email: "edouard.berner545@155.fr",
      phone_number: 1234567890,
      password: "azerty"
    },
    {
      firstName: "Edouard",
      lastName: "BERNIER",
      username: "edbere123",
      email: "edouaer5455@155.fr",
      phone_number: 1234567890,
      password: "azerty"
    }])
    .end((err, res) => {
      res.should.have.status(200)
      users = [...users, ...res.body]
      done()
    })
  })
  it("Ajout de plusieurs utilisateurs incorrects (sans firstName). - E", (done) => {
    chai.request(server).post('/users').send([{
      lastName: "BERNIER",
      username: "edbernie13",
      email: "edouard.bernier546@155.fr",
      password: "azerty"
    },
    {
      lastName: "BERNIER",
      username: "edbernie124",
      email: "edouard.bernier5456@155.fr",
      password: "azerty"
    }])
    .auth(token, { type: 'bearer' }) 
    .end((err, res) => {
      res.should.have.status(405)
      done()
    })
  })
  it("Ajout de plusieurs utilisateurs incorrects (avec un username existant). - E", (done) => {
    chai.request(server).post('/users').send([{
      firstName: "Edouard",
      lastName: "BERNIER",
      username: "edbernie12",
      email: "edouard.bernier545@155.fr",
      password: "azerty"
    },
    {
      firstName: "Edouard",
      lastName: "BERNIER",
      username: "edbernie123",
      email: "edouard.bernier5455@155.fr",
      password: "azerty"
    }])
    .auth(token, { type: 'bearer' }) 
    .end((err, res) => {
      res.should.have.status(405)
      done()
    })
  })
  it("Ajouter de plusieurs utilisateurs incorrects (Avec un champ vide). - E", (done) => {
    chai.request(server).post('/users')
    .auth(token, { type: 'bearer' }) 
    .send([{
      firstName: "luffu",
      lastName: "",
      username: "dwarfSlaye",
      email: "lufu.us@gmai.com",
      password: "azerty"
    },
    {
      firstName: "Mathou",
      lastName: "",
      username: "tissoubebou",
      email: "lufu.us@gmailop.com",
      password: "azerty"
  }]).end((err, res) => {
        expect(res).to.have.status(405)
        done()
    })
})
})

describe("GET - /user", () => {
    it("Rechercher un utilisateur avec un champ valide. - E (Unauthorized)", (done) => {
        chai.request(server).get('/user').query({fields: ['username'], value: users[0].username})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Rechercher un utilisateur avec un champ valide. - S", (done) => {
        chai.request(server).get('/user').query({fields: ['username'], value: users[0].username})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Rechercher un utilisateur inexistant. - E", (done) => {
        chai.request(server).get('/user').query({fields: ['username'], value: 'lutfu4846844'})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Rechercher un utilisateur avec un champ non autorisé. - E", (done) => {
        chai.request(server).get('/user').query({fields: ['firstName'], value: 'lutfu4846844'})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Rechercher un utilisateur avec un champ vide. - E", (done) => {
        chai.request(server).get('/user').query({fields: ['email'], value: ''})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Rechercher un utilisateur sans query. - E", (done) => {
        chai.request(server).get('/user')
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

})

describe("GET - /user/:id", () => {
    it("Rechercher un utilisateur avec son id. - E (Unauthorized)", (done) => {
        chai.request(server).get('/user/' + users[0]._id)
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Rechercher un utilisateur avec son id. - S", (done) => {
        chai.request(server).get('/user/' + users[0]._id)
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Rechercher un utilisateur incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).get('/user/665f18739d3e172be5daf092')
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Rechercher un utilisateur incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).get('/user/123')
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
})

describe("GET - /users_by_filters", () => {
        it("Rechercher plusieurs utilisateurs avec filtres. - E (Unauthorized)", (done) => {
        chai.request(server).get('/users_by_filters').query({ page: 1, pageSize: 2})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Rechercher plusieurs utilisateurs avec filtres. - S", (done) => {
        chai.request(server).get('/users_by_filters').query({ page: 1, pageSize: 2})
        .set("Authorization", "Bearer " + token)
        .end((err, res) => {
            res.should.have.status(200)
            expect(res.body.results).to.be.an('array')
            done()
        })
    })
    it("Rechercher plusieurs utilisateurs avec query vide. - E", (done) => {
        chai.request(server).get('/users_by_filters').query({ page: 1, pageSize: 2})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            expect(res.body.results).to.be.an('array')
            expect(res.body.count).to.be.equal(3)
            done()
        })
    })
    it("Rechercher plusieurs utilisateurs avec une chaîne de caractère dans page - E", (done) => {
        chai.request(server).get('/users_by_filters').query({ page: 'salut les gens', pageSize: 2})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
})

describe("GET - /users", () => {
    it("Rechercher plusieurs utilisateurs par ID. - E (Unauthorized)", (done) => {
        chai.request(server).get('/users').query({id: _.map(users, '_id')})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Rechercher plusieurs utilisateurs par ID. - S", (done) => {
        chai.request(server).get('/users').query({id: _.map(users, '_id')})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Rechercher plusieurs utilisateurs incorrect(avec un id inexistant). - E", (done) => {
        chai.request(server).get('/users').query({id: ['665f18739d3e172be5daf092', '665f18739d3e172be5daf093']})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Rechercher plusieurs utilisateurs incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).get('/users').query({id: ['123', '456']})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
  })

describe("PUT - /user", () => {
    it("Modifier un utilisateur. - E (Unauthorized)", (done) => {
        chai.request(server).put('/user/' + users[0]._id)
        .send({firstName: 'loutfou'})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Modifier un utilisateur. - S", (done) => {
        chai.request(server).put('/user/' + users[0]._id)
        .auth(token, { type: 'bearer' }) 
        .send({firstName: 'loutfou'})
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Modifier un utilisateur incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).put('/user/665f18739d3e172be5daf092')
        .auth(token, { type: 'bearer' }) 
        .send({firstName: 'loutfou'})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Modifier un utilisateur incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).put('/user/123')
        .auth(token, { type: 'bearer' }) 
        .send({lastName: 'tissoubebou', firstName: 'loutfou'})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Modifier un utilisateur avec un champ vide. - E", (done) => {
        chai.request(server).put('/user/' + users[0]._id)
        .auth(token, { type: 'bearer' }) 
        .send({firstName: '', lastName: 'tissoubebou'})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Modifier un utilisateur avec un champ unique existant. - E", (done) => {
        chai.request(server).put('/user/' + users[0]._id)
        .auth(token, { type: 'bearer' }) 
        .send({username: users[1].username})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    
})

describe("PUT - /users", () => {
    it("Modifier plusieurs utilisateurs. - E (Unauthorized)", (done) => {
        chai.request(server).put('/users').query({id: _.map(users, '_id')})
        .send({firstName: 'loutfou'})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Modifier plusieurs utilisateurs. - S", (done) => {
        chai.request(server).put('/users').query({id: _.map(users, '_id')})
        .auth(token, { type: 'bearer' }) 
        .send({firstName: 'loutfou'})
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Modifier plusieurs utilisateurs incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).put('/users').query({id: ['667980900166578fd4b6b32b', '667980a00166578fd4b6b32c']})
        .auth(token, { type: 'bearer' }) 
        .send({firstName: 'loutfous'})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Modifier plusieurs utilisateurs incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).put('/users').query({id: ['123', '456']})
        .auth(token, { type: 'bearer' }) 
        .send({firstName: 'loutfou'})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Modifier plusieurs utilisateurs incorrect (sans renseigner l'id). - E", (done) => {
        chai.request(server).put('/users').query({id: []})
        .auth(token, { type: 'bearer' }) 
        .send({firstName: 'loutfou'})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Modifier plusieurs utilisateurs avec un champ vide. - E", (done) => {
        chai.request(server).put('/users').query({id: _.map(users, '_id')})
        .auth(token, { type: 'bearer' }) 
        .send({firstName: ''})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Modifier plusieurs utilisateurs avec un champ unique existant. - E", (done) => {
        chai.request(server).put('/users').query({id: _.map(users, '_id')})
        .auth(token, { type: 'bearer' }) 
        .send({username: users[1].username})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
})

describe("DELETE - /user", () => {
    it("Supprimer un utilisateur. - E (Unauthorized)", (done) => {
        chai.request(server).delete('/user/' + users[1]._id)
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Supprimer un utilisateur. - S", (done) => {
        chai.request(server).delete('/user/' + users[1]._id)
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("supprimer un utilisateur incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/user/665f18739d3e172be5daf092')
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("supprimer un utilisateur incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/user/123')
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
})

describe("DELETE - /users", () => {
    it("Supprimer plusieurs utilisateurs. - E (Unauthorized)", (done) => {
        chai.request(server).delete('/users').query({id: _.map(users, '_id')})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Supprimer plusieurs utilisateurs incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/users').query({id: ['123', '456']})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Supprimer plusieurs utilisateurs. - S", (done) => {
        chai.request(server).delete('/users').query({id: _.map(users, '_id')})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
})