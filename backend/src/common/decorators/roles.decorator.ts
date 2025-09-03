import { SetMetadata } from '@nestjs/common';

// Définition des rôles possibles dans l'application
export type Role = 'EMPLOYEE' | 'MANAGER' | 'ACCOUNTING';

// Clé utilisée pour stocker les rôles dans les métadonnées
export const ROLES_KEY = 'roles';

// Décorateur personnalisé "Roles"
// Il permet d'associer un ou plusieurs rôles à une route ou un contrôleur.
// Exemple d'utilisation : @Roles('MANAGER', 'ACCOUNTING')
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
