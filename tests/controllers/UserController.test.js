const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const server = require('./../../server')
let should = chai.should();
const _ = require('lodash')

var users = []
let token

chai.use(chaiHttp)

describe("POST - /register", () => {
    it("Ajouter un utilisateur. - S", (done) => {
        chai.request(server).post('/register').send({
            username: "John",
            email: "john1@gmail.com",
            password: "123456",
            firstName: "Xavier",
            lastName: "Colombel",
            phone_number: 1234567890,
        }).end((err, res) => {
            expect(res).to.have.status(201)
            users.push(res.body)
            done()
        });
    })
    it("Ajouter un utilisateur incorrect. (Sans username) - E", (done) => {
        chai.request(server).post('/register').send({
            email: 'lutfu.us@gmil.com',
            password: "123456"
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un utilisateur incorrect. (Avec un username existant) - E", (done) => {
        chai.request(server).post('/register').send({
            username: "John",
            email: "lutfu.us@gmai.com",
            password: "123456"
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un utilisateur incorrect. (Avec un champ vide) - E", (done) => {
        chai.request(server).post('/register').send({
            username: "dwarfSlaye",
            email: "",
            password: "123456"
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})

describe("POST - /login", () => {
    it("Login. - S", (done) => {
        chai.request(server).post('/login').send({
            username: "John",
            password: "123456"
        }).end((err, res) => {
            expect(res).to.have.status(200)
            token = res.body.token
            done()
        });
    })
    it("Login incorrect, mauvais mdp. - E", (done) => {
        chai.request(server).post('/login').send({
            username: "John",
            password: "1234567"
        }).end((err, res) => {
            expect(res).to.have.status(401)
            done()
        });
    })
    it("Login incorrect, mauvais username. - E", (done) => {
        chai.request(server).post('/login').send({
            username: "dwarfSlaeez111eyer",
            password: "lesfemmes"
        }).end((err, res) => {
            expect(res).to.have.status(401)
            done()
        });
    })
})

describe("GET - /user/:id", () => {
    it("Chercher un utilisateur correct. - S", (done) => {
        chai.request(server).get('/user/' + users[0]._id)
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Chercher un utilisateur incorrect, sans etre authentifié. - E", (done) => {
        chai.request(server).get('/user/' + users[0]._id)
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Chercher un utilisateur incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).get('/user/665f18739d3e172be5daf092')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Chercher un utilisateur incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).get('/user/123')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    
})

describe("PUT - /user", () => {
    it("Modifier un utilisateur. - S", (done) => {
        chai.request(server).put('/user/' + users[0]._id).send({ firstName: "Olivier" })
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Modifier un utilisateur sans etre authentifié. - E", (done) => {
        chai.request(server).put('/user/' + users[0]._id).send({ firstName: "Olivier" })
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Modifier un utilisateur avec un id invalide. - E", (done) => {
        chai.request(server).put('/user/123456789').send({firstName: "Olivier", email: "Edouard@gmail.com"})
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Modifier un utilisateur avec un id inexistant. - E", (done) => {
        chai.request(server).put('/user/66791a552b38d88d8c6e9ee7').send({firstName: "Olivier", email: "Edouard2@gmail.com"})
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Modifier un utilisateur avec un champ requis vide. - E", (done) => {
        chai.request(server).put('/user/' + users[0]._id).send({ username: "", firstName: "Edouard" })
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Modifier un utilisateur avec un champ unique existant. - E", (done) => {
        chai.request(server).put('/user/' + users[0]._id).send({ username: users[1].username})
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

})

describe("DELETE - /user", () => {
    it("Supprimer un utilisateur sans etre authentifié. - E", (done) => {
        chai.request(server).delete('/user/' + users[1]._id)
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Supprimer un utilisateur incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/user/665f18739d3e172be5daf092')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Supprimer un utilisateur incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/user/123')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Supprimer un utilisateur. - S", (done) => {
        chai.request(server).delete('/user/' + users[1]._id)
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
            // console.log(users)
            res.should.have.status(200)
            done()
        })
    })
})

describe("DELETE - /users", () => {
    it("Supprimer plusieurs utilisateurs incorrects (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/users/665f18739d3e172be5daf092&665f18739d3e172be5daf093')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(404)
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
    it("Supprimer plusieurs utilisateurs sans etre authentifié. - E", (done) => {
        chai.request(server).delete('/users').query({id: _.map(users, '_id')})
        .end((err, res) => {
            res.should.have.status(401)
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