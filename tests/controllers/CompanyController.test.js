const CompanyService = require('../../services/CompanyService');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const server = require('../../server');
const should = chai.should();
const _ = require('lodash');
let token = "";
var companies = [];
let tab_id_companies = [];

let companiesData = [
    {
        name: "Company A",
        address: "123 Main St",
    },    
    {
        name: "Company B",
        address: "456 Elm St",
    },    
    {
        name: "Company C",
        address: "789 Oak St",
    },    
    {
        name: "Company D",
        address: "101 Pine St",
    }
];

// Préparation des données
it("Création des sociétés fictives", (done) => {
    CompanyService.addManyCompanies(companiesData, null, function (err, value) {
        if (err) done(err);
        tab_id_companies = _.map(value, '_id');
        done();
    });
});

// Fonction pour générer un ID aléatoire parmi les IDs des sociétés
function rdm_company(tab) {
    let rdm_id = tab[Math.floor(Math.random() * tab.length)];
    return rdm_id;
}

chai.use(chaiHttp);

// POST - /company
describe("POST - /company", () => {
    it("Ajouter une société. - S", (done) => {
        chai.request(server).post('/company').send({
            name: "New Company",
            address: "123 New St"
        })
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            expect(res).to.have.status(201);
            companies.push(res.body);
            done();
        });
    });

    it("Ajouter une société incorrecte. (Sans nom) - E", (done) => {
        chai.request(server).post('/company').send({
            address: '123 New St',
            city: 'New City',
        })
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            expect(res).to.have.status(405);
            done();
        });
    });
});

// GET - /company
describe("GET - /company", () => {
    it("Rechercher une société avec un champ valide. - S", (done) => {
        chai.request(server).get('/company').query({fields: ['name'], value: companies[0].name})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });

    it("Rechercher une société inexistante. - E", (done) => {
        chai.request(server).get('/company').query({fields: ['name'], value: 'Nonexistent'})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });
});

// GET - /company/:id
describe("GET - /company/:id", () => {
    it("Rechercher une société avec son id. - S", (done) => {
        chai.request(server).get('/company/' + companies[0]._id)
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });

    it("Rechercher une société incorrecte (avec un id inexistant). - E", (done) => {
        chai.request(server).get('/company/665f18739d3e172be5daf092')
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });
});

// PUT - /company
describe("PUT - /company", () => {
    it("Modifier une société. - S", (done) => {
        chai.request(server).put('/company/' + companies[0]._id)
        .auth(token, { type: 'bearer' }) 
        .send({name: 'Updated Company'})
        .end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });

    it("Modifier une société incorrecte (avec un id inexistant). - E", (done) => {
        chai.request(server).put('/company/665f18739d3e172be5daf092')
        .auth(token, { type: 'bearer' }) 
        .send({name: 'Updated Company'})
        .end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });
});

// DELETE - /company
describe("DELETE - /company", () => {
    it("Supprimer une société. - S", (done) => {
        chai.request(server).delete('/company/' + companies[0]._id)
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });

    it("Supprimer une société incorrecte (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/company/665f18739d3e172be5daf092')
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });
});

// Supprimer les sociétés fictives après les tests
it("Supprimer les sociétés fictives", (done) => {
    CompanyService.deleteManyCompanies(tab_id_companies, null, function (err, value) {
        done();
    });
});
