const CompanyService = require('../../services/CompanyService')
const UserService = require('../../services/UserService')
const chai = require('chai');
let expect = chai.expect;
const _ = require('lodash')
var company_valid = []

let tab_id_users = []
let users = [
    {
        firstname: "Client 1",
        lastname: "Réservation",
        email:"client1@gmail.com",
        phone_number: "+33601020304",
        password: "azerty"
    },    
    {
        firstname: "Client 2",
        lastname: "Réservation",
        email:"client2@gmail.com",
        phone_number: "+33601020304",
        password: "azerty"
    },    
    {
        firstname: "Client 3",
        lastname: "Réservation",
        email:"client1@gmail.com",
        phone_number: "+33601020304",
        password: "azerty"
    },
    {
        firstName: "Detenteur d'article 4",
        lastName: "Client",
        username: "oui4",
        email:"client4@gmail.com",
        password: "azerty"
    }
]

it("Création des utilisateurs fictifs", (done) => {
    UserService.addManyUsers(users, null, function (err, value) {
        tab_id_users = _.map(value, '_id')
        done()
    })
})

function rdm_user (tab) {
    let rdm_id = tab[Math.floor(Math.random() * (tab.length-1) )]
    return rdm_id
}


describe("addOneCompany", () => {
    it("Restaurant correct. - S", (done) => {
        var company_valid = {
            name: "La belle assiette",
            address: "18 rue Hubert Metzger",
            user_id: rdm_user(tab_id_users)
        }
        CompanyService.addOneCompany(company, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('user_id')
            expect(value).to.haveOwnProperty('name')
            expect(value).to.haveOwnProperty('address')
            company_valid.push(value)
            console.log(company_valid)
            done()        
        })
    })
})
