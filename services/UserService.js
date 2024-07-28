const UserSchema = require('../schemas/User');
const _ = require('lodash');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const TokenUtils = require('../utils/token');
const SALT_WORK_FACTOR = 10;

const User = mongoose.model('User', UserSchema);

User.createIndexes();

module.exports.loginUser = async function (email, password, options, callback) {
  try {
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return callback({ msg: 'L\'adresse email ou le mot de passe n\'est pas correct', type_error: 'no-valid-login' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return callback({ msg: 'La comparaison des mots de passe est incorrecte', type_error: 'no_comparaison' });
    }

    const token = TokenUtils.createToken({ _id: user._id }, null);
    callback(null, { ...user.toObject(), token: token });
  } catch (err) {
    callback(err);
  }
};

module.exports.addOneUser = async function (user, options, callback) {
  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    if (user && user.password) user.password = await bcrypt.hash(user.password, salt);
    const new_user = new User(user);
    let errors = new_user.validateSync();
    if (errors) {
      errors = errors['errors'];
      const text = Object.keys(errors)
        .map((e) => {
          return errors[e]['properties']['message'];
        })
        .join(' ');
      const fields = _.transform(
        Object.keys(errors),
        function (result, value) {
          result[value] = errors[value]['properties']['message'];
        },
        {}
      );
      const err = {
        msg: text,
        fields_with_error: Object.keys(errors),
        fields: fields,
        type_error: 'validator',
      };
      callback(err);
    } else {
      await new_user.save();
      callback(null, new_user.toObject());
    }
  } catch (error) {
    if (error.code === 11000) {
      // Erreur de duplicité
      const field = Object.keys(error.keyValue)[0];
      const err = {
        msg: `Duplicate key error: ${field} must be unique.`,
        fields_with_error: [field],
        fields: { [field]: `The ${field} is already taken.` },
        type_error: 'duplicate',
      };
      callback(err);
    } else {
      callback(error); // Autres erreurs
    }
  }
};

module.exports.findOneUserById = async function (user_id, options, callback) {
  try {
    if (!user_id || !mongoose.isValidObjectId(user_id)) {
      return callback({ msg: 'ObjectId non conforme.', type_error: 'no-valid' });
    }

    const user = await User.findById(user_id).exec();
    if (!user) {
      return callback({ msg: 'Aucun utilisateur trouvé.', type_error: 'no-found' });
    }

    callback(null, user.toObject());
  } catch (err) {
    callback({ msg: 'Impossible de chercher l\'élément.', type_error: 'error-mongo' });
  }
};

module.exports.updateOneUser = async function (user_id, update, options, callback) {
  update.updated_at = new Date();

  try {
    if (!user_id || !mongoose.isValidObjectId(user_id)) {
      return callback({ msg: 'Id invalide.', type_error: 'no-valid' });
    }

    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    if (update && update.password) update.password = await bcrypt.hash(update.password, salt);
    
    const user = await User.findByIdAndUpdate(new ObjectId(user_id), update, { returnDocument: 'after', runValidators: true }).exec();
    if (!user) {
      return callback({ msg: 'Utilisateur non trouvé.', type_error: 'no-found' });
    }

    callback(null, user.toObject());
  } catch (errors) {
    if (errors.code === 11000) {
      const field = Object.keys(errors.keyPattern)[0];
      const duplicateErrors = {
        msg: `Duplicate key error: ${field} must be unique.`,
        fields_with_error: [field],
        fields: { [field]: `The ${field} is already taken.` },
        type_error: 'duplicate'
      };
      callback(duplicateErrors);
    } else {
      const text = Object.keys(errors).map((e) => {
        return errors[e]['properties']['message'];
      }).join(' ');
      const fields = _.transform(Object.keys(errors), function (result, value) {
        result[value] = errors[value]['properties']['message'];
      }, {});
      const err = {
        msg: text,
        fields_with_error: Object.keys(errors),
        fields: fields,
        type_error: 'validator'
      };
      callback(err);
    }
  }
};

module.exports.deleteOneUser = async function (user_id, options, callback) {
  try {
    if (!user_id || !mongoose.isValidObjectId(user_id)) {
      return callback({ msg: 'Id invalide.', type_error: 'no-valid' });
    }

    const user = await User.findByIdAndDelete(user_id).exec();
    if (!user) {
      return callback({ msg: 'Utilisateur non trouvé.', type_error: 'no-found' });
    }

    callback(null, user.toObject());
  } catch (err) {
    callback({ msg: 'Impossible de chercher l\'élément.', type_error: 'error-mongo' });
  }
};

module.exports.deleteManyUsers = async function (users_id, options, callback) {
  try {
    if (!Array.isArray(users_id) || users_id.length === 0 || users_id.filter((e) => !mongoose.isValidObjectId(e)).length > 0) {
      return callback({ msg: 'Tableau non conforme.', type_error: 'no-valid' });
    }

    const userIds = users_id.map((e) => new ObjectId(e));
    const result = await User.deleteMany({ _id: userIds }).exec();
    callback(null, result);
  } catch (err) {
    callback({ msg: 'Erreur mongo suppression.', type_error: 'error-mongo' });
  }
};
