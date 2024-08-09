const Table = require('../schemas/Table')
const UserService = require('./UserService')

module.exports.addOneTable = async function (table, options, callback) {
  try {
    // Vérifier si user_id est fourni
    if (!table.user_id) {
      return callback({ msg: "user_id est requis.", type_error: "missing-field" });
    }

    // Récupérer l'utilisateur à partir du user_id
    UserService.findOneUserById(table.user_id, options, async function (err, user) {
      if (err) {
        return callback(err); // Gestion des erreurs de recherche d'utilisateur
      }

      // Extraire le company_id de l'utilisateur
      const company = user.company && user.company[0]; // On suppose qu'il y a un seul company pour l'utilisateur
      if (!company || !company._id) {
        return callback({ msg: "Aucune société trouvée pour cet utilisateur.", type_error: "no-company" });
      }

      // Ajouter le company_id et created_by aux données de la table
      table.company_id = company._id;
      table.created_by = user._id.toString(); // Utiliser user._id comme chaîne de caractères

      // Création de la nouvelle table
      const newTable = new Table(table);

      // Validation
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

      // Sauvegarde
      const savedTable = await newTable.save();
      callback(null, savedTable.toObject());
    });
  } catch (error) {
    callback(error); // Autres erreurs
  }
};

