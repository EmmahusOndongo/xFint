// Configuration globale de l'application
export const APP = {
  // Port sur lequel l'application écoute (par défaut 5000 si non défini dans l'environnement)
  PORT: Number(process.env.PORT || 5000),

  // Domaine des cookies (par défaut 'localhost')
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'localhost',

  // Indique si les cookies doivent être marqués comme "secure" (HTTPS uniquement)
  // La valeur est une string dans process.env, on la convertit en booléen
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
};
