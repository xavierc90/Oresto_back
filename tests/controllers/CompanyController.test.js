const UserService = require('../../services/UserService')
const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const server = require('../../server')
const should = chai.should()
const _ = require('lodash')
let token = ""
var company = []

let tab_id_users = []
let users = [
    {
        firstname: "Client 5",
        lastname: "Réservation",
        email:"client5@gmail.com",
        phone_number: "+33601020304",
        password: "azerty"
    },    
    {
        firstname: "Client 6",
        lastname: "Réservation",
        email:"client6@gmail.com",
        phone_number: "+33601020304",
        password: "azerty"
    },    
    {
        firstname: "Client 7",
        lastname: "Réservation",
        email:"client7@gmail.com",
        phone_number: "+33601020304",
        password: "azerty"
    },
    {
        firstname: "Client 8",
        lastname: "Client",
        email:"client8@gmail.com",
        phone_number: "+33601020304",
        password: "azerty"
    }
]

it("Création des utilisateurs fictifs", (done) => {
    UserService.addManyUsers(users, null, function (err, value) {
        tab_id_users = _.map(value, '_id')
        // console.log(err)
        done()
    })
})

function rdm_user (tab) {
    let rdm_id = tab[Math.floor(Math.random() * (tab.length-1) )]
    return rdm_id
}

describe("POST - /login", () => {
    it("Connexion utilisateur - S", (done) => {
        chai.request(server).post('/login').send({
            email: "client2@gmail.com",
            password: "azerty",
        }).end((err, res) => {
            res.should.have.status(200)
            token = res.body.token
            done()    
        })
    })
})

chai.use(chaiHttp)

describe("POST - /add_company", () => {
    it("Ajouter un restaurant - S", (done) => {
        chai.request(server).post('/add_company').send({
            name: "La belle assiette",
            address: "18 rue Hubert Metzger",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@labelleassiette.fr",
            user_id: rdm_user(tab_id_users)
        })
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            expect(res).to.have.status(201)
            company.push(res.body)
            done()
        });
    }),
    it("Ajouter un restaurant - E (Unauthorized)", (done) => {
        chai.request(server).post('/add_company').send({
            name: "La belle assiette",
            address: "18 rue Hubert Metzger",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@labelleassiette.fr",
            user_id: rdm_user(tab_id_users)
        })
        .end((err, res) => {
            expect(res).to.have.status(401)
            company.push(res.body)
            done()
        });
    }),
    it("Ajouter un restaurant incorrect. (Sans name) - E", (done) => {
        chai.request(server).post('/add_company').send({
            address: "18 rue Hubert Metzger",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@labelleassiette.fr",
            user_id: rdm_user(tab_id_users)
        })
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un restaurant incorrect. (Avec un champ vide) - E", (done) => {
        chai.request(server).post('/add_company').send({
            name: "",
            address: "18 rue Hubert Metzger",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@labelleassiette.fr",
            user_id: rdm_user(tab_id_users)
        })
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})