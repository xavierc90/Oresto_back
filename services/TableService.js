const Table = require('../schemas/Table')
const UserService = require('./UserService')
const mongoose = require('mongoose')

// Fonction pour ajouter une table
module.exports.addOneTable = async function (table, options, callback) {
    try {
        if (!table.user_id) {
            return callback({ msg: "user_id est requis.", type_error: "missing-field" });
        }  
        UserService.findOneUserById(table.user_id, options, async function (err, user) {
            if (err) {
                return callback(err);
            }
            const company = user.company && user.company[0];
            if (!company || !company._id) {
                return callback({ msg: "Aucune société trouvée pour cet utilisateur.", type_error: "no-company" });
            }
            const newTable = new Table({
                ...table,
                company_id: company._id,
                created_by: user._id
            });
    
            const errors = newTable.validateSync();
            if (errors) {
                const errorMessages = Object.keys(errors.errors).map(e => errors.errors[e].message).join(' ');
                const fieldsWithErrors = Object.keys(errors.errors);
                const fields = Object.fromEntries(fieldsWithErrors.map(field => [field, errors.errors[field].message]));
                
                const err = {
                    msg: errorMessages,
                    fields_with_error: fieldsWithErrors,
                    fields,
                    type_error: "validator"
                };
                return callback(err);
            }
            const savedTable = await newTable.save();
            callback(null, savedTable.toObject());
        });
    } catch (error) {
        callback({ msg: error.message || "Erreur inconnue", type_error: "unknown" });
    }
};

  // Fonction pour rechercher une table par son ID
module.exports.findOneTableById = function (table_id, options, callback) {
    var opts = { populate: options && options.populate ? ['company_id'] : [] }
    if (table_id && mongoose.isValidObjectId(table_id)) {
        Table.findById(table_id, null, opts).then((value) => {
            try {
                if (value) {
                    callback(null, value.toObject());
                } else {
                    callback({ msg: "Aucune table trouvée.", type_error: "no-found" });
                }
            } catch (e) {
                callback({ msg: "Erreur de traitement.", type_error: "error-mongo" });
            }
        }).catch((err) => {
            callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
        });
    } else {
        callback({ msg: "ObjectId non conforme.", type_error: 'no-valid' });
    }
}

  // Fonction pour rechercher toutes les tables avec pagination
  module.exports.findManyTables = function(search, page, limit, options, callback) {
    page = !page ? 1 : parseInt(page);
    limit = !limit ? 10 : parseInt(limit);
    var populate = options && options.populate ? options.populate : []; 
    
    if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
        return callback({ msg: `Format de ${isNaN(page) ? 'page' : 'limit'} invalide.`, type_error: 'no-valid' });
    }
    
    let query_mongo = search ? { $or: ["table_number", "table_size", "shape", "status"].map((field) => ({ [field]: { $regex: search, $options: 'i' } })) } : {};
    
    Table.countDocuments(query_mongo).then((count) => {
        if (count > 0) {
            const skip = (page - 1) * limit;
            Table.find(query_mongo, null, { skip: skip, limit: limit, populate: populate, lean: true }).then((results) => {
                callback(null, {
                    results: results,
                    count: count
                });
            }).catch((e) => {
                callback({ msg: 'Erreur lors de la recherche des tables.', type_error: 'error-mongo', error: e });
            });
        } else {
            callback(null, { results: [], count: 0 });
        }
    }).catch((e) => {
        callback({ msg: 'Erreur lors de la recherche des tables.', type_error: 'error-mongo', error: e });
    });
};