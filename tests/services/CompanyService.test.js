const e = require('express');
const CompanyService = require('../../services/CompanyService')
const UserService = require('../../services/UserService')
const chai = require('chai');
let expect = chai.expect;
const _ = require('lodash')
var companies_no_valid = []
var id_company_valid = []
var tab_id_companies = []
var companies = []


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

// Test de la fonction pour l'ajout d'un restaurant 

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
        var companies_no_valid = {
            address: "18 rue Hubert Metzger",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@labelleassiette.fr",
            user_id: rdm_user(tab_id_users)
        }
        CompanyService.addOneCompany(companies_no_valid, null, function (err, value) {
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
        var companies_no_valid = {
            name: "La belle assiette",
            address: "18 rue Hubert Metzger",
            postal_code: "90000",
            city: "Belfort",
        }
        CompanyService.addOneCompany(companies_no_valid, null, function (err, value) {
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

// Test de la fonction pour l'ajout de plusieurs restaurants 

describe("addManyCompanies", () => {
    it("Restaurants corrects. - S", (done) => {
        var companies_tab = [{
            name: "La gazelle d'or",
            address: "4, rue des 4 vents",
            postal_code: "90000",
            city: "Belfort",
            country: "Espagne",
            phone_number: "+33601020304",
            email: "contact@lagazelledor.fr",
            user_id: rdm_user(tab_id_users)
        },
        {
            name: "Le Saint Christophe",
            address: "14 place d'Armes",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@restaurantstchristophe.fr",
            user_id: rdm_user(tab_id_users)
        },
        {
            name: "Le Venezia",
            address: "3 rue Mercelin Barthelot",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@levenezia.fr",
            user_id: rdm_user(tab_id_users)
        }] 
        CompanyService.addManyCompanies(companies_tab, null, function (err, value) {
            tab_id_companies = _.map(value, '_id')
                companies = [...value, ...companies]
                expect(value).lengthOf(3)
                done()       
        })
    })
    it("Restaurants incorrects (sans nom). - E", (done) => {
        var companies_no_valid = [{
            address: "4, rue des 4 vents",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@lagazelledor.fr",
            user_id: rdm_user(tab_id_users)
        },
        {
            address: "14 place d'Armes",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@restaurantstchristophe.fr",
            user_id: rdm_user(tab_id_users)
        }]
        CompanyService.addManyCompanies(companies_no_valid, null, function (err, value) {
                done()       
        })
    })
    it("Restaurants incorrects (sans user_id). - E", (done) => {
        var companies_no_valid = [{
            name: "La gazelle d'or",
            address: "4, rue des 4 vents",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@lagazelledor.fr"
        },
        {
            name: "Le Saint Christophe",
            address: "14 place d'Armes",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@restaurantstchristophe.fr"
        }]
        CompanyService.addManyCompanies(companies_no_valid, null, function (err, value) {
            expect(err).to.be.an('Array').lengthOf(2)
            err.forEach((error) => {
                expect(error).to.have.property('fields_with_error').that.includes('user_id');
                expect(error).to.have.property('fields').that.has.property('user_id', 'Path `user_id` is required.');
            })
            done()
        })
    })
})

// Test de la fonction pour l'ajout de plusieurs restaurants 

describe('findManyCompanies', () => {
    it('Rechercher des restaurants avec plusieurs champs - S', (done) => {
        const tab_field = ['postal_code', 'country'];
        const values = ['90', 'France']; // Recherche partielle
        CompanyService.findManyCompanies(tab_field, values, null, (err, results) => {
            expect(err).to.be.null;
            expect(results).to.be.an('array');
            expect(results).to.have.length.greaterThan(0); // Ajustez en fonction des données présentes
            results.forEach(result => {
                expect(result.postal_code).to.include(values[0]);
                expect(result.country).to.include(values[1]);
            });
        // console.log(results)
            done();
        });
    });
    it('Rechercher des restaurants avec un champs (name) - S', (done) => {
        const tab_field = ['name'];
        const values = ['La'];
        CompanyService.findManyCompanies(tab_field, values, null, (err, results) => {
            expect(err).to.be.null;
            expect(results).to.be.an('array');
            expect(results).to.have.length.greaterThan(0); 
            results.forEach(result => {
                expect(result.name).to.include(values);
            });
        // console.log(results)
            done();
        });
    });
    it('Rechercher des restaurants avec un champs (city) - S', (done) => {
        const tab_field = ['city'];
        const values = ['Bel'];
        CompanyService.findManyCompanies(tab_field, values, null, (err, results) => {
            expect(err).to.be.null;
            expect(results).to.be.an('array');
            expect(results).to.have.length.greaterThan(0); 
            results.forEach(result => {
                expect(result.city).to.include(values);
            });
        // console.log(results)
            done();
        });
    });
    it('Rechercher des restaurants avec un champs (country) - S', (done) => {
        const tab_field = ['country'];
        const values = ['Es'];
        CompanyService.findManyCompanies(tab_field, values, null, (err, results) => {
            expect(err).to.be.null;
            expect(results).to.be.an('array');
            expect(results).to.have.length.greaterThan(0); 
            results.forEach(result => {
                expect(result.country).to.include(values);
            });
        // console.log(results)
            done();
        });
    });
    it('Rechercher des restaurants avec un champs (postal_code) - S', (done) => {
        const tab_field = ['postal_code'];
        const values = ['90'];
        CompanyService.findManyCompanies(tab_field, values, null, (err, results) => {
            expect(err).to.be.null;
            expect(results).to.be.an('array');
            expect(results).to.have.length.greaterThan(0); 
            results.forEach(result => {
                expect(result.postal_code).to.include(values);
            });
        // console.log(results)
            done();
        });
    });
});
