import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '@truerefurb/shared-types';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  facilityId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'truerefurb_super_secret_jwt_key_2026',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid JWT token claims');
    }
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      facilityId: payload.facilityId,
    };
  }
}
