const e = require('express');
const CompanyService = require('../../services/CompanyService')
const UserService = require('../../services/UserService')
const TableService = require('../../services/TableService')
const chai = require('chai');
let expect = chai.expect;
const _ = require('lodash')

const table_valid = []

// Création des utilisateurs fictifs
let users = [
    {
        firstname: "Client 10",
        lastname: "Réservation",
        email:"client10@gmail.com",
        phone_number: "+33601020304",
        role: "manager",
        password: "azerty"
    },    
    {
        firstname: "Client 12",
        lastname: "Réservation",
        email:"client12@gmail.com",
        phone_number: "+33601020304",
        role: "manager",
        password: "azerty"
    },
    {
        firstname: "Client 13",
        lastname: "Réservation",
        email:"client13@gmail.com",
        phone_number: "+33601020304",
        role: "manager",
        password: "azerty"
    },
    {
        firstname: "Client 14",
        lastname: "Client",
        email:"client14@gmail.com",
        phone_number: "+33601020304",
        role: "manager",
        password: "azerty"
    }
]

// Test pour création des utilisateurs fictifs
it("Création des utilisateurs fictifs", (done) => {
    UserService.addManyUsers(users, null, function (err, value) {
        tab_id_users = _.map(value, '_id')
        // console.log(tab_id_users)
        done()
    })
})

// Fonction pour récupérer un user_id aléatoire
function rdm_user (tab) {
    let rdm_id = tab[Math.floor(Math.random() * (tab.length-1) )]
    return rdm_id
}

// Ajout d'unz table 
describe("addOneTable", () => {
    it("Table ajoutée correctement. - S", (done) => {
        var table_valid = {
            name: "La belle assiette",
            address: "18 rue Hubert Metzger",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@labelleassiette.fr",
            user_id: rdm_user(tab_id_users)
        }
        TableService.addOneTable(table_valid, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('user_id')
            expect(value).to.haveOwnProperty('name')
            done()        
        })
    })
})