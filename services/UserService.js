const UserSchema = require('../schemas/User')
const _ = require('lodash')
const async = require('async')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const bcrypt = require('bcryptjs');
const TokenUtils = require('../utils/token')
const SALT_WORK_FACTOR = 10;

var User = mongoose.model('User', UserSchema)
// var Article = mongoose.model('Article', ArticleSchema)

User.createIndexes()

module.exports.loginUser = async function (username, password, options, callback) {
    module.exports.findOneUser(['username', 'email'], username, null, async (err, value) => {
        if(err)
            callback(err)
        else {
            if (bcrypt.compareSync(password, value.password)) {
                var token = TokenUtils.createToken({ _id: value._id }, null)
                callback(null, {...value, token: token})
            }
            else {
                callback({msg: "La comparaison des mots de passe est fausse.", type_error: "no-comparaison"})
            }
        }
    })
}

module.exports.addOneUser = async function (user, options, callback) {
    try {
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        if (user && user.password)
            user.password = await bcrypt.hash(user.password, salt);
        var new_user = new User(user);
        var errors = new_user.validateSync();
        if (errors) {
            errors = errors['errors'];
            var text = Object.keys(errors).map((e) => {
                return errors[e]['properties']['message'];
            }).join(' ');
            var fields = _.transform(Object.keys(errors), function (result, value) {
                result[value] = errors[value]['properties']['message'];
            }, {});
            var err = {
                msg: text,
                fields_with_error: Object.keys(errors),
                fields: fields,
                type_error: "validator"
            };
            callback(err);
        } else {
            await new_user.save();
            callback(null, new_user.toObject());
        }
    } catch (error) {
        if (error.code === 11000) { // Erreur de duplicité
            var field = Object.keys(error.keyValue)[0];
            var err = {
                msg: `Duplicate key error: ${field} must be unique.`,
                fields_with_error: [field],
                fields: { [field]: `The ${field} is already taken.` },
                type_error: "duplicate"
            };
            callback(err);
        } else {
            callback(error); // Autres erreurs
        }
    }
};

module.exports.addManyUsers = async function (users, options, callback) {
  var errors = [];
  
  // Vérifier les erreurs de validation
  for (var i = 0; i < users.length; i++) {
      var user = users[i];
      const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
      if (user && user.password)
          user.password = await bcrypt.hash(user.password, salt);
      var new_user = new User(user);
      var error = new_user.validateSync();
      if (error) {
          error = error['errors'];
          var text = Object.keys(error).map((e) => {
              return error[e]['properties']['message'];
          }).join(' ');
          var fields = _.transform(Object.keys(error), function (result, value) {
              result[value] = error[value]['properties']['message'];
          }, {});
          errors.push({
              msg: text,
              fields_with_error: Object.keys(error),
              fields: fields,
              index: i,
              type_error: "validator"
          });
      }
  }
  
  if (errors.length > 0) {
      callback(errors);
  } else {
      try {
          // Tenter d'insérer les utilisateurs
          const data = await User.insertMany(users, { ordered: false });
          callback(null, data);
      } catch (error) {
          if (error.code === 11000) { // Erreur de duplicité
              const duplicateErrors = error.writeErrors.map(err => {
                  const field = err.err.errmsg.split(" dup key: { ")[1].split(':')[0].trim(); // Big brain
                  return {
                      msg: `Duplicate key error: ${field} must be unique.`,
                      fields_with_error: [field],
                      fields: { [field]: `The ${field} is already taken.` },
                      index: err.index,
                      type_error: "duplicate"
                  };
              });
              callback(duplicateErrors);
          } else {
              callback(error); // Autres erreurs
          }
      }
  }
};

module.exports.findOneUser = function (tab_field, value, options, callback) {
    var field_unique = ["username", "email"];
    if (tab_field && Array.isArray(tab_field) && value && _.filter(tab_field, (e) => { return field_unique.indexOf(e) == -1}).length == 0) {
       var obj_find = [];
       _.forEach(tab_field, (e) => {
           obj_find.push({ [e]: value })
       })
       User.findOne({ $or: obj_find }).then((value) => {
           if (value)
            callback(null, value.toObject());
           else {
            callback({ msg: "Utilisateur non trouvé.", type_error: "no-found" });
           }
       }).catch((err) => {
           callback({ msg: "Error interne mongo.", type_error: "error-mongo" });
       })
    }
    else {
        let msg = "";
        if (!tab_field || !Array.isArray(tab_field)) {
            msg += "Les champs de recherche sont incorrects. ";
        }
        if (!value) {
            msg += msg ? "Et la valeur de recherche est vide. " : "La valeur de recherche est vide. ";
        }
        if (_.filter(tab_field, (e) => { return field_unique.indexOf(e) == -1}).length > 0) {
            var field_not_authorized = _.filter(tab_field, (e) => { return field_unique.indexOf(e) == -1})
            msg += msg ? ` Et (${field_not_authorized.join(",")}) ne sont pas des champs de recherche autorisés.` :
             `Les champs (${field_not_authorized.join(",")}) ne sont pas des champs de recherche autorisés.`
             callback({ msg: msg, type_error: 'no-valid', field_not_authorized: field_not_authorized });
        }
        else
            callback({ msg: msg, type_error: 'no-valid' });
        }
}

module.exports.findManyUsers = function (search, page, limit, options, callback) {
    page = !page ? 1 : parseInt(page)
    limit = !limit ? 10 : parseInt(limit)
    if (typeof page !== 'number' || typeof limit !== 'number' || isNaN(page) || isNaN(limit)) {
        callback({msg: `format de ${typeof page !== 'number' ? 'page' : 'limit'} invalide.`, type_error: 'no-valid'});
    } else {
        let query_mongo = search ? {$or: _.map(["firstName", "lastName", "username", "phone_number", "email"], (e) =>
        { return {[e]: {$regex: search}} })} : {}
        User.countDocuments().then((value) => {
            if (value > 0) {
                const skip = ((page - 1) * limit);
                User.find(query_mongo, null, { skip: skip, limit: limit }).then((results) => {
                    callback(null, { results: results, count: value });
                })
            } else {
                callback(null, { results: [], count: 0 });
            }
        }).catch((e) => {
            callback (e)
        })
    }
}

module.exports.findOneUserById = function (user_id, options, callback) {
    if (user_id && mongoose.isValidObjectId(user_id)) {
        User.findById(user_id, null).then((value) => {
            try {
                if (value) {
                    callback(null, value.toObject());
                } else {
                    callback({ msg: "Aucun utilisateur trouvé.", type_error: "no-found" });
                }
            }
            catch (e) {
                
            }
        }).catch((err) => {
            callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
        });
    } else {
        callback({ msg: "ObjectId non conforme.", type_error: 'no-valid' });
    }
}

module.exports.findManyUsersById = function (users_id, options, callback) {
    if (users_id && Array.isArray(users_id) && users_id.length > 0 && users_id.filter((e) => { return mongoose.isValidObjectId(e)}).length == users_id.length) {
        users_id = users_id.map((e) => { return new ObjectId(e) })
        User.find({ _id: users_id }).then((value) => {
            try {
                if (value && Array.isArray(value) && value.length != 0) {
                    callback(null, value);
                } else {
                    callback({ msg: "Aucun utilisateur trouvé.", type_error: "no-found" });
                }
            }
            catch (e) {
                
            }
        }).catch((err) => {
            callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
        });
    }
    else if (users_id && Array.isArray(users_id) && users_id.length > 0 && users_id.filter((e) => { return mongoose.isValidObjectId(e)}).length != users_id.length) {
        callback({ msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.", type_error: 'no-valid', fields: users_id.filter((e) => { return !mongoose.isValidObjectId(e)}) });
    }
    else if (users_id && !Array.isArray(users_id)) {
        callback({ msg: "L'argement n'est pas un tableau.", type_error: 'no-valid' });

    }
    else {
        callback({ msg: "Tableau non conforme.", type_error: 'no-valid' });
    }
}

module.exports.updateOneUser = async function (user_id, update,options, callback) {
    if (user_id && mongoose.isValidObjectId(user_id)) {
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        if (update && update.password)
            update.password = await bcrypt.hash(update.password, salt)
        User.findByIdAndUpdate(new ObjectId(user_id), update, { returnDocument: 'after', runValidators: true }).then((value) => {
            try {
                if (value) {
                    callback(null, value.toObject())}
                else {
                    callback({ msg: "Utilisateur non trouvé.", type_error: "no-found" })
                }
            } catch (e) {
                
                callback(e)
            }
        }).catch((errors) => {
            if (errors.code === 11000) {
                var field = Object.keys(errors.keyPattern)[0]
                const duplicateErrors = {
                    msg: `Duplicate key error: ${field} must be unique.`,
                    fields_with_error: [field],
                    fields: { [field]: `The ${field} is already taken.` },
                    type_error: "duplicate"
                };
                callback(duplicateErrors)
            } else {
                errors = errors['errors']
                var text = Object.keys(errors).map((e) => {
                    return errors[e]['properties']['message']
                }).join(' ')
                var fields = _.transform(Object.keys(errors), function (result, value) {
                    result[value] = errors[value]['properties']['message'];
                }, {});
                var err = {
                    msg: text,
                    fields_with_error: Object.keys(errors),
                    fields: fields,
                    type_error: "validator"
                }
                callback(err)
            }
        })
    }
    else {
        callback({ msg: "Id invalide.", type_error: 'no-valid' })
    }
}


module.exports.updateManyUsers = async function (users_id, update,options, callback) {
    if (users_id && Array.isArray(users_id) && users_id.length > 0 && users_id.filter((e) => { return mongoose.isValidObjectId(e)}).length == users_id.length) {
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        if (update && update.password)
            update.password = await bcrypt.hash(update.password, salt)
        users_id = users_id.map((e) => { return new ObjectId(e) })
        User.updateMany({ _id: users_id }, update, { runValidators: true }).then((value) => {
            try { 
                if (value && value.matchedCount != 0)
                    callback(null, value)
                else {
                    callback({ msg: "Aucun utilisateur trouvé.", type_error: "no-found" })
                }
            } catch (e) {
                
                callback(e)
            }
        }).catch((errors) => {
            if (errors.code === 11000) {
                var field = Object.keys(errors.keyPattern)[0]
                const duplicateErrors = {
                    msg: `Duplicate key error: ${field} must be unique.`,
                    fields_with_error: [field],
                    fields: { [field]: `The ${field} is already taken.` },
                    type_error: "duplicate"
                };
                callback(duplicateErrors)
            } else {
                errors = errors['errors']
                var text = Object.keys(errors).map((e) => {
                    return errors[e]['properties']['message']
                }).join(' ')
                var fields = _.transform(Object.keys(errors), function (result, value) {
                    result[value] = errors[value]['properties']['message'];
                }, {});
                var err = {
                    msg: text,
                    fields_with_error: Object.keys(errors),
                    index: errors.index,
                    fields: fields,
                    type_error: "validator"
                }
                callback(err)
            }
        })
    }
    else {
        callback({ msg: "Id invalide.", type_error: 'no-valid' })
    }
}

module.exports.deleteOneUser = function (user_id,options, callback) {
    if (user_id && mongoose.isValidObjectId(user_id)) {
        User.findByIdAndDelete(user_id).then((value) => {
            try {
                if (value)
                    callback(null, value.toObject())
                else
                callback({ msg: "Utilisateur non trouvé.", type_error: "no-found" });
            }
            catch (e) {
                
                callback(e)
            }
        }).catch((e) => {
            callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
        })
    }
    else {
        callback({ msg: "Id invalide.", type_error: 'no-valid' })
    }
}

module.exports.deleteManyUsers = function(users_id,options, callback) {
    if (users_id && Array.isArray(users_id) && users_id.length > 0 && users_id.filter((e) => { return mongoose.isValidObjectId(e)}).length == users_id.length) {
        users_id = users_id.map((e) => { return new ObjectId(e)})
        User.deleteMany({_id: users_id}).then((value) => {
            callback(null, value)
        }).catch((err) => {
            callback({ msg: "Erreur mongo suppression.", type_error: "error-mongo" }); 
        })
    }
    else if (users_id && Array.isArray(users_id) && users_id.length > 0 && users_id.filter((e) => { return mongoose.isValidObjectId(e)}).length != users_id.length) {
        callback({ msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.", type_error: 'no-valid', fields: users_id.filter((e) => { return !mongoose.isValidObjectId(e)}) });
    }
    else if (users_id && !Array.isArray(users_id)) {
        callback({ msg: "L'argument n'est pas un tableau.", type_error: 'no-valid' });

    }
    else {
        callback({ msg: "Tableau d'id invalide.", type_error: 'no-valid' })
    }
}












/* 
function checkSchemaUser(user, callback) {
    //var element_check = user
    var element_check = _.pick(user, UserSchema.authorized)
    var required_isnt_include = _.difference(UserSchema.required.sort(), _.keys(_.pick(element_check, UserSchema.required)).sort())
    var required_is_empty = _.filter(UserSchema.required, (e) => { return _.isEmpty(element_check[e]) })
    required_is_empty = _.difference(required_is_empty, required_isnt_include)
    var text_error = ""
    if (required_isnt_include.length > 0)
        text_error += `Une des propriétés requis (${required_isnt_include.join(', ')}) n'est pas inclus. `
    if (required_is_empty.length > 0)
        text_error += `Une des propriétés requis (${required_is_empty.join(', ')}) est inclus mais vide.`
    var error = {
        msg: text_error,
        key_required_not_include: required_isnt_include,
        key_required_empty: required_is_empty
    }
    if (required_isnt_include.length > 0 || required_is_empty.length > 0) {
        callback(error)
    }
    else {
        callback(null, element_check)
    }
}

// La fonction permet d'ajouter un utilisateur.
module.exports.addOneUser = function (user, callback) {
    checkSchemaUser(user, function (err, value) {
        if (err)
            callback(err)
        else {
            value.id = _.uniqueId()
            UserSchema.elements.push(value)
            callback(null, value)
        }
    })
}

// La fonction permet d'ajouter plusieurs utilisateurs.
module.exports.addManyUsers = function (users, callback) {
    var i = 0;
    async.map(users, function (user, next) {
        checkSchemaUser(user, function (err, value) {
            if (err) {
                err.index = i
                next(null, err)
            }
            else {
                next(null, null)
            }
            i++;
        })
    }, function (err, val) {
        var error = _.filter(val, (e) => { return !_.isEmpty(e) })
        if (error.length > 0) {
            callback(error)
        }
        else {
            async.map(users, checkSchemaUser, function (err, val) {
                var tab = _.map(val, (e) => { e.id = _.uniqueId(); return e })
                UserSchema.elements = [...UserSchema.elements, ...tab]
                callback(null, val)
            })
        }
    });
}

// La fonction permet de chercher un utilisateur.
module.exports.findOneUserById = function (id, callback) {
    var user = _.find(UserSchema.elements, ["id", id])
    if (user) {
        callback(null, user)
    }
    else {
        callback({ error: true, msg: 'Utilisateur not found.', error_type: 'Not-Found' })
    }
}

// La fonction permet de chercher plusieurs utilisateurs.
module.exports.findManyUsersById = function (ids, callback) {
    var users = _.filter(UserSchema.elements, (e) => {
        return ids.indexOf(e.id) > -1
    })
    callback(null, users)
}

// La fonction permet de supprimer un utilisateur.
module.exports.deleteOneUser = function (id, callback) {
    var user_index = _.findIndex(UserSchema.elements, ["id", String(id)])
    if (user_index > -1) {
        var user_delete = UserSchema.elements.splice(user_index, 1)[0]
        callback(null, {msg: "Element supprimé.", user_delete: user_delete})
    }
    else {
        callback({error: 1, msg: "L'utilisateur à effacé n'a pas été trouvé. (Id invalide)"})
    }
}

// La fonction permet de supprimer plusieurs utilisateurs.
module.exports.deleteManyUsers = function (ids, callback) {
    var count_remove = 0
    for (var i = 0; i < ids.length;i++) {
        var user_index = _.findIndex(UserSchema.elements, ["id", String(ids[i])])
        if (user_index > -1)  {
            count_remove++
            UserSchema.elements.splice(user_index, 1)
        }

    }
    callback(null, {msg: `${count_remove} élément(s) supprimé(s).`, count_remove: count_remove})
}

// La fonction permet de modifier un utilisateur.
module.exports.updateOneUser = function (id, user_edition, callback) {
    var user_index = _.findIndex(UserSchema.elements, ["id", id])
    var user_tmp = { ...UserSchema.elements[user_index], ...user_edition }
    checkSchemaUser(user_tmp, function (err, value) {
        if (err)
            callback(err)
        else {
            UserSchema.elements[user_index] = { ...UserSchema.elements[user_index], ...value }
            callback(null, UserSchema.elements[user_index])
        }
    })
}

// La fonction permet de modifier plusieurs utilisateurs.
module.exports.updateManyUsers = function () {

} */