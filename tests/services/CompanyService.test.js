const CompanyService = require('../../services/CompanyService')
const UserService = require('../../services/UserService')
const chai = require('chai');
let expect = chai.expect;
const _ = require('lodash')
var id_company_valid = ""
var tab_id_companies = []
var new_company = []

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
        var new_company = {
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
            new_company.push(value)
            done()        
        })
    })
    it("restaurant incorrect. (Sans name) - E", (done) => {
        var company_no_valid = {
            address: "15 rue du fort",
            user_id: rdm_user(tab_id_users)

        }
        CompanyService.addOneCompany(company_no_valid, null, function (err, value) {
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('name')
            expect(err['fields']['name']).to.equal('Path `name` is required.')
            done()
        })
})
})
