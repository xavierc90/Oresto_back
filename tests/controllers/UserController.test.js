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
            firstname: "Test",
            lastname: "Test",
            email: "testeur@gmail.com",
            password: "azerty",
            phone_number: "1234567890"
        }).end((err, res) => {
            expect(res).to.have.status(201)
            users.push(res.body)
            done()
        });
    })
    it("Ajouter un utilisateur incorrect. (Sans firstname) - E", (done) => {
        chai.request(server).post('/register').send({
            lastname: 'Us',
            email: 'lutfu.us@gmil.com',
            phone_number: "1234567890",
            password: "azerty"
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un utilisateur incorrect. (Avec email déjà existant) - E", (done) => {
        chai.request(server).post('/register').send({
            firstname: "luf",
            lastname: "Us",
            email: "testeur@gmail.com",
            phone_number: "1234567890",
            password: "azerty"
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un utilisateur incorrect. (Avec un champ vide) - E", (done) => {
        chai.request(server).post('/register').send({
            firstname: "luffu",
            lastname: "",
            email: "lufu.us@gmai.com",
            phone_number: "1234567890",
            password: "azerty"
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})

describe("POST - /login", () => {
    it("Connexion utilisateur - S", (done) => {
        // console.log(users)
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
      it("Ajout de plusieurs utilisateurs. - S", (done) => {
        chai.request(server).post('/add_users')
        .send([{
          firstname: "Second",
          lastname: "User",
          email: "seconduser@test.fr",
          phone_number: "1234567890",
          password: "mdpmdp"
        },
        {
          firstname: "Third",
          lastname: "User",
          email: "thirduser@test.fr",
          phone_number: "1234567890",
          password: "azerty"
        }])
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
          res.should.have.status(201)
          users = [...users, ...res.body]
          done()
        })
      })
      it("Ajout de plusieurs utilisateurs. - E (Unauthorized)", (done) => {
        chai.request(server).post('/add_users')
        .send([{
          firstname: "Edouard",
          lastname: "BERNIER",
          username: "edbernie",
          email: "edouard.bernierrr@155.fr",
          phone_number: "1234567890",
          password: "azerty"
        },
        {
          firstname: "Edouard",
          lastname: "BERNIER",
          username: "edbernie123",
          email: "edouard.bernier5455@155.fr",
          phone_number: "1234567890",
          password: "azerty"
        }])
        .end((err, res) => {
          res.should.have.status(401)
          done()
        })
      })
  it("Ajout de plusieurs utilisateurs incorrects (sans firstname). - E", (done) => {
    chai.request(server).post('/add_users').send([{
      firstname: "",
      lastname: "BERNIER",
      username: "edbernie13",
      email: "edouard.bernier546@155.fr",
      phone_number: "1234567890",
      password: "azerty"
    },
    {
      firstname:"",
      lastname: "BERNIER",
      username: "edbernie124",
      email: "edouard.bernie6@155.fr",
      phone_number: "1234567890",
      password: "azerty"
    }])
    .auth(token, { type: 'bearer' }) 
    .end((err, res) => {
      res.should.have.status(405)
      done()
    })
  })
  it("Ajout de plusieurs utilisateurs incorrects (avec un email existant). - E", (done) => {
    chai.request(server).post('/add_users').send([{
      firstname: "First",
      lastname: "User",
      username: "betatest",
      email: "testeur@gmail.com",
      phone_number: "1234567890",
      password: "azerty"
    },
    {
      firstname: "Edouard",
      lastname: "BERNIER",
      username: "betatest",
      email: "seconduser@test.fr",
      phone_number: "1234567890",
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
      firstname: "jesuisunprenom",
      lastname: "jesuisunnom",
      email: "uneadresse@mail.fr",
      phone_number: 1234567890,
      password: ""
    },
    {
      firstname: "Mathou",
      lastname: "",
      username: "tissoubebou",
      email: "lufu.us@gmailop.com",
      phone_number: "1234567890",
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
    it("Rechercher un utilisateur avec un champ valide. - S", (done) => {
        chai.request(server).get('/find_user').query({fields: ['email'], value: users[0].email})
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Rechercher un utilisateur avec un champ valide. - E (Unauthorized)", (done) => {
        chai.request(server).get('/find_user').query({fields: ['username'], value: users[0].username})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Rechercher un utilisateur inexistant. - E", (done) => {
        chai.request(server).get('/find_user').query({fields: ['email'], value: 'lutfu4846844'})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Rechercher un utilisateur avec un champ non autorisé. - E", (done) => {
        chai.request(server).get('/find_user').query({fields: ['firstname'], value: 'lutfu4846844'})
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
    it("Rechercher un utilisateur avec son id. - S", (done) => {
        chai.request(server).get('/find_user/' + users[0]._id)
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Rechercher un utilisateur avec son id. - E (Unauthorized)", (done) => {
        chai.request(server).get('/find_user/' + users[0]._id)
        .end((err, res) => {
            res.should.have.status(401)
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
    it("Rechercher plusieurs utilisateurs par ID. - S", (done) => {
        chai.request(server).get('/find_users').query({id: _.map(users, '_id')})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Rechercher plusieurs utilisateurs par ID. - E (Unauthorized)", (done) => {
        chai.request(server).get('/find_users').query({id: _.map(users, '_id')})
        .end((err, res) => {
            res.should.have.status(401)
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
    it("Modifier un utilisateur. - S", (done) => {
        chai.request(server).put('/edit_user/' + users[0]._id)
        .auth(token, { type: 'bearer' }) 
        .send({firstname: 'loutfou'})
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Modifier un utilisateur. - E (Unauthorized)", (done) => {
        chai.request(server).put('/edit_user/' + users[0]._id)
        .send({firstname: 'loutfou'})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Modifier un utilisateur incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).put('/edit_user/665f18739d3e172be5daf092')
        .auth(token, { type: 'bearer' }) 
        .send({firstname: 'loutfou'})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Modifier un utilisateur incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).put('/edit_user/123')
        .auth(token, { type: 'bearer' }) 
        .send({lastname: 'tissoubebou', firstname: 'loutfou'})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Modifier un utilisateur avec un champ vide. - E", (done) => {
        chai.request(server).put('/edit_user/' + users[0]._id)
        .auth(token, { type: 'bearer' }) 
        .send({firstname: '', lastname: 'tissoubebou'})
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
    it("Supprimer un utilisateur. - S", (done) => {
        chai.request(server).delete('/delete_user/' + users[1]._id)
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Supprimer un utilisateur. - E (Unauthorized)", (done) => {
        chai.request(server).delete('/delete_user/' + users[1]._id)
        .end((err, res) => {
            res.should.have.status(401)
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