import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// Guard qui utilise la stratégie 'jwt' définie avec Passport
// Il protège les routes en exigeant un JWT valide pour y accéder.
export class JwtAuthGuard extends AuthGuard('jwt') {}
