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


describe("POST - /register", () => {
    it("Ajouter un utilisateur . - S", (done) => {
        chai.request(server).post('/register').send({
            firstName: "Test",
            lastName: "Test",
            username: "betatest",
            email: "testeur@gmail.com",
            password: "azerty",
            phone_number: 1234567890,
        }).end((err, res) => {
            expect(res).to.have.status(201)
            users.push(res.body)
            done()
        });
    })
    it("Ajouter un utilisateur incorrect. (Sans firstName) - E", (done) => {
        chai.request(server).post('/register').send({
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
        chai.request(server).post('/register').send({
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
        chai.request(server).post('/register').send({
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
            email: "testeur@gmail.com",
            password: "azerty"
        }).end((err, res) => {
            res.should.have.status(200)
            token = res.body.token
            done()    
        })
    })
    it("Connexion utilisateur - Identifiant incorrect - E", (done) => {
        chai.request(server).post('/login').send({
            email: "email_incorrect",
            password: "azerty"
        }).end((err, res) => {
            res.should.have.status(401)
            done()    
        })
    })
    it("Connexion utilisateur - Mot de passe incorrect - E", (done) => {
        chai.request(server).post('/login').send({
            email: "testeur@gmail.com",
            password: "password_incorrect"
        }).end((err, res) => {
            res.should.have.status(401)
            done()    
        })
    })
})

describe("POST - /add_users", () => {
    it("Ajout de plusieurs utilisateurs. - E (Unauthorized)", (done) => {
        chai.request(server).post('/add_users')
        .send([{
          firstName: "Edouard",
          lastName: "BERNIER",
          username: "edbernie",
          email: "edouard.bernierrr@155.fr",
          phone_number: 1234567890,
          password: "azerty"
        },
        {
          firstName: "Edouard",
          lastName: "BERNIER",
          username: "edbernie123",
          email: "edouard.bernier5455@155.fr",
          phone_number: 1234567890,
          password: "azerty"
        }])
        .end((err, res) => {
          res.should.have.status(401)
          done()
        })
      })
      it("Ajout de plusieurs utilisateurs. - S", (done) => {
        chai.request(server).post('/add_users')
        .send([{
          firstName: "Second",
          lastName: "User",
          username: "seconduser",
          email: "seconduser@test.fr",
          phone_number: 1234567890,
          password: "mdpmdp"
        },
        {
          firstName: "Third",
          lastName: "User",
          username: "thirduser",
          email: "thirduser@test.fr",
          phone_number: 1234567890,
          password: "azerty"
        }])
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
          res.should.have.status(201)
          users = [...users, ...res.body]
          done()
        })
      })
  it("Ajout de plusieurs utilisateurs incorrects (sans firstName). - E", (done) => {
    chai.request(server).post('/add_users').send([{
      firstName:"",
      lastName: "BERNIER",
      username: "edbernie13",
      email: "edouard.bernier546@155.fr",
      phone_number: 1234567890,
      password: "azerty"
    },
    {
      firstName:"",
      lastName: "BERNIER",
      username: "edbernie124",
      email: "edouard.bernie6@155.fr",
      phone_number: 1234567890,
      password: "azerty"
    }])
    .auth(token, { type: 'bearer' }) 
    .end((err, res) => {
      res.should.have.status(405)
      done()
    })
  })
  it("Ajout de plusieurs utilisateurs incorrects (avec un username existant). - E", (done) => {
    chai.request(server).post('/add_users').send([{
      firstName: "First",
      lastName: "User",
      username: "betatest",
      email: "edouard@155.fr",
      phone_number: 1234567890,
      password: "azerty"
    },
    {
      firstName: "Edouard",
      lastName: "BERNIER",
      username: "betatest",
      email: "edouard.bernier5455@155.fr",
      phone_number: 1234567890,
      password: "azerty"
    }])
    .auth(token, { type: 'bearer' }) 
    .end((err, res) => {
      res.should.have.status(405)
      done()
    })
  })
  it("Ajouter de plusieurs utilisateurs incorrects (Avec un champ vide). - E", (done) => {
    chai.request(server).post('/add_users')
    .send([{
      firstName: "jesuisunprenom",
      lastName: "jesuisunnom",
      username: "pseudocorrect",
      email: "uneadresse@mail.fr",
      phone_number: 1234567890,
      password: "azerty"
    },
    {
      firstName: "Mathou",
      lastName: "",
      username: "tissoubebou",
      email: "lufu.us@gmailop.com",
      phone_number: 1234567890,
      password: "azerty"
  }])
    .auth(token, { type: 'bearer' }) 
    .end((err, res) => {
     expect(res).to.have.status(405)
     done()
    })
})
})

describe("GET - /find_user", () => {
    it("Rechercher un utilisateur avec un champ valide. - E (Unauthorized)", (done) => {
        chai.request(server).get('/find_user').query({fields: ['username'], value: users[0].username})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Rechercher un utilisateur avec un champ valide. - S", (done) => {
        chai.request(server).get('/find_user').query({fields: ['username'], value: users[0].username})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Rechercher un utilisateur inexistant. - E", (done) => {
        chai.request(server).get('/find_user').query({fields: ['username'], value: 'lutfu4846844'})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Rechercher un utilisateur avec un champ non autorisé. - E", (done) => {
        chai.request(server).get('/find_user').query({fields: ['firstName'], value: 'lutfu4846844'})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Rechercher un utilisateur avec un champ vide. - E", (done) => {
        chai.request(server).get('/find_user').query({fields: ['email'], value: ''})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Rechercher un utilisateur sans query. - E", (done) => {
        chai.request(server).get('/find_user')
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

})

describe("GET - /find_user/:id", () => {
    it("Rechercher un utilisateur avec son id. - E (Unauthorized)", (done) => {
        chai.request(server).get('/find_user/' + users[0]._id)
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Rechercher un utilisateur avec son id. - S", (done) => {
        chai.request(server).get('/find_user/' + users[0]._id)
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Rechercher un utilisateur incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).get('/find_user/665f18739d3e172be5daf092')
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Rechercher un utilisateur incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).get('/find_user/123')
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
})

describe("GET - /find_users", () => {
    it("Rechercher plusieurs utilisateurs par ID. - E (Unauthorized)", (done) => {
        chai.request(server).get('/find_users').query({id: _.map(users, '_id')})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Rechercher plusieurs utilisateurs par ID. - S", (done) => {
        chai.request(server).get('/find_users').query({id: _.map(users, '_id')})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Rechercher plusieurs utilisateurs incorrect(avec un id inexistant). - E", (done) => {
        chai.request(server).get('/find_users').query({id: ['665f18739d3e172be5daf092', '665f18739d3e172be5daf093']})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Rechercher plusieurs utilisateurs incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).get('/find_users').query({id: ['123', '456']})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
  })

describe("PUT - /edit_user", () => {
    it("Modifier un utilisateur. - E (Unauthorized)", (done) => {
        chai.request(server).put('/edit_user/' + users[0]._id)
        .send({firstName: 'loutfou'})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Modifier un utilisateur. - S", (done) => {
        chai.request(server).put('/edit_user/' + users[0]._id)
        .auth(token, { type: 'bearer' }) 
        .send({firstName: 'loutfou'})
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Modifier un utilisateur incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).put('/edit_user/665f18739d3e172be5daf092')
        .auth(token, { type: 'bearer' }) 
        .send({firstName: 'loutfou'})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Modifier un utilisateur incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).put('/edit_user/123')
        .auth(token, { type: 'bearer' }) 
        .send({lastName: 'tissoubebou', firstName: 'loutfou'})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Modifier un utilisateur avec un champ vide. - E", (done) => {
        chai.request(server).put('/edit_user/' + users[0]._id)
        .auth(token, { type: 'bearer' }) 
        .send({firstName: '', lastName: 'tissoubebou'})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    // it("Modifier un utilisateur avec un champ unique existant. - E", (done) => {
    //     chai.request(server).put('/edit_user/' + users[0]._id)
    //     .send({username: users[0].username})
    //     .auth(token, { type: 'bearer' })
    //     .end((err, res) => {
    //    // console.log(res.body)
    //         res.should.have.status(405)
    //         done()
    //     })
    // })    
})


describe("DELETE - /delete_user", () => {
    it("Supprimer un utilisateur. - E (Unauthorized)", (done) => {
        chai.request(server).delete('/delete_user/' + users[1]._id)
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Supprimer un utilisateur. - S", (done) => {
        chai.request(server).delete('/delete_user/' + users[1]._id)
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("supprimer un utilisateur incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/delete_user/665f18739d3e172be5daf092')
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("supprimer un utilisateur incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/delete_user/123')
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
})

describe("DELETE - /delete_users", () => {
    it("Supprimer plusieurs utilisateurs. - E (Unauthorized)", (done) => {
        // console.log(users)
        chai.request(server).delete('/delete_users').query({id: _.map(users, '_id')})
        .end((err, res) => {
            res.should.have.status(401)
            done()
    })
    })
    it("Supprimer plusieurs utilisateurs incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/delete_users').query({id: ['123', '456']})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Supprimer plusieurs utilisateurs. - S", (done) => {
        chai.request(server).delete('/delete_users').query({id: _.map(users, '_id')})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
})