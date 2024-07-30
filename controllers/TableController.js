const TableService = require('../services/TableService');

// La fonction permet d'ajouter une nouvelle table.
module.exports.addOneTable = function(req, res) {
    req.log.info("Création d'une nouvelle table");

    TableService.addOneTable(req.body, function(err, value) {
        if (err && err.type_error === "validator") {
            res.statusCode = 400; // Mauvaise demande
            res.send(err);
        } else if (err) {
            res.statusCode = 500; // Erreur interne du serveur
            res.send(err);
        } else {
            res.statusCode = 201; // Créé avec succès
            res.send(value);
        }
    });
};

// La fonction permet de récupérer toutes les tables.
module.exports.getAllTables = function(req, res) {
    req.log.info("Récupération de toutes les tables");

    TableService.getAllTables(function(err, values) {
        if (err) {
            res.statusCode = 500; // Erreur interne du serveur
            res.send(err);
        } else {
            res.statusCode = 200; // Succès
            res.send(values);
        }
    });
};

// La fonction permet de récupérer une table par son ID.
module.exports.getTableById = function(req, res) {
    const tableId = req.params.id;
    req.log.info(`Récupération de la table avec ID: ${tableId}`);

    TableService.getTableById(tableId, function(err, value) {
        if (err && err.type_error === "not-found") {
            res.statusCode = 404; // Non trouvé
            res.send(err);
        } else if (err) {
            res.statusCode = 500; // Erreur interne du serveur
            res.send(err);
        } else {
            res.statusCode = 200; // Succès
            res.send(value);
        }
    });
};

// La fonction permet de mettre à jour une table par son ID.
module.exports.updateTableById = function(req, res) {
    const tableId = req.params.id;
    req.log.info(`Mise à jour de la table avec ID: ${tableId}`);

    TableService.updateTableById(tableId, req.body, function(err, value) {
        if (err && err.type_error === "not-found") {
            res.statusCode = 404; // Non trouvé
            res.send(err);
        } else if (err && err.type_error === "validator") {
            res.statusCode = 400; // Mauvaise demande
            res.send(err);
        } else if (err) {
            res.statusCode = 500; // Erreur interne du serveur
            res.send(err);
        } else {
            res.statusCode = 200; // Succès
            res.send(value);
        }
    });
};

// La fonction permet de supprimer une table par son ID.
module.exports.deleteTableById = function(req, res) {
    const tableId = req.params.id;
    req.log.info(`Suppression de la table avec ID: ${tableId}`);

    TableService.deleteTableById(tableId, function(err) {
        if (err && err.type_error === "not-found") {
            res.statusCode = 404; // Non trouvé
            res.send(err);
        } else if (err) {
            res.statusCode = 500; // Erreur interne du serveur
            res.send(err);
        } else {
            res.statusCode = 204; // Pas de contenu
            res.send();
        }
    });
};
