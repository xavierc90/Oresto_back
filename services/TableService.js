const Table = require('../schemas/Table'); 

module.exports.addOneTable = async function (table, options, callback) {
  try {
    table.user_id = options && options.user ? options.user._id : table.user_id;
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
  } catch (error) {
    callback(error); // Autres erreurs
  }
};