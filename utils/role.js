const User = require('../schemas/User'); // Assurez-vous d'avoir le bon chemin

/**
 * Vérifie si l'utilisateur a le rôle requis.
 * @param {string} userId - ID de l'utilisateur à vérifier
 * @param {Array<string>} roles - Liste des rôles autorisés
 * @returns {Promise<boolean>} - Retourne true si l'utilisateur a un des rôles requis, sinon false
 */
async function checkUserRole(userId, roles) {
    try {
        const user = await User.findById(userId).exec();
        if (!user) {
            return false;
        }
        return roles.includes(user.role);
    } catch (error) {
        throw new Error('Erreur lors de la vérification du rôle de l\'utilisateur.');
    }
}

module.exports = {
    checkUserRole
};
