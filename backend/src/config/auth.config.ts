// Configuration liée à l'authentification JWT
export const AUTH = {
  ACCESS: {
    // Secret utilisé pour signer et vérifier les tokens d'accès (obligatoire)
    SECRET: process.env.JWT_ACCESS_SECRET!,

    // Durée de validité des tokens d'accès (par défaut 1h si non défini)
    EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES || '1h',

    // Nom du cookie qui contiendra le token d'accès (par défaut "sh_access")
    COOKIE: process.env.AUTH_COOKIE_ACCESS || 'sh_access',
  },
  REFRESH: {
    // Secret utilisé pour signer et vérifier les tokens de rafraîchissement (obligatoire)
    SECRET: process.env.JWT_REFRESH_SECRET!,

    // Durée de validité des tokens de rafraîchissement (par défaut 7j si non défini)
    EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES || '7d',

    // Nom du cookie qui contiendra le token de rafraîchissement (par défaut "sh_refresh")
    COOKIE: process.env.AUTH_COOKIE_REFRESH || 'sh_refresh',
  },
};
