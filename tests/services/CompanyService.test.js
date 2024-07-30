const CompanyService = require('../../services/CompanyService')
const UserService = require('../../services/UserService')
const chai = require('chai');
let expect = chai.expect;
const _ = require('lodash')
var company = []
var company_no_valid = []

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
        email:"client3@gmail.com",
        phone_number: "+33601020304",
        password: "azerty"
    },
    {
        firstname: "Client 4",
        lastname: "Client",
        email:"client4@gmail.com",
        phone_number: "+33601020304",
        password: "azerty"
    }
]

it("Création des utilisateurs fictifs", (done) => {
    UserService.addManyUsers(users, null, function (err, value) {
        tab_id_users = _.map(value, '_id')
        // console.log(tab_id_users)
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
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@labelleassiette.fr",
            user_id: rdm_user(tab_id_users)
        }
        CompanyService.addOneCompany(company_valid, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('user_id')
            expect(value).to.haveOwnProperty('name')
            done()        
        })
    })
    it("Restaurant incorrect (Sans name). - E", (done) => {
        var company_no_valid = {
            address: "18 rue Hubert Metzger",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@labelleassiette.fr",
            user_id: rdm_user(tab_id_users)
        }
        CompanyService.addOneCompany(company_no_valid, null, function (err, value) {
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('name')
            expect(err['fields']['name']).to.equal('Path `name` is required.')
            // console.log(err)
            done()      
        })
    })
    it("Restaurant incorrect (Sans user_id). - E", (done) => {
        var company_no_valid = {
            name: "La belle assiette",
            address: "18 rue Hubert Metzger",
            postal_code: "90000",
            city: "Belfort",
        }
        CompanyService.addOneCompany(company_no_valid, null, function (err, value) {
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('user_id')
            expect(err['fields']['user_id']).to.equal('Path `user_id` is required.')
            // console.log(err)
            done()      
        })
    })
})
