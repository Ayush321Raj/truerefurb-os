import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException, 
  BadRequestException, 
  NotFoundException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { 
  AuthUser, 
  AuthTokens, 
  UserRole, 
  ROLE_PERMISSIONS 
} from '@truerefurb/shared-types';

interface InternalUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  badgeId: string;
  facilityId: string;
  refreshTokenHash?: string;
  resetTokenHash?: string;
  resetTokenExpiry?: Date;
  isActive: boolean;
}

@Injectable()
export class AuthService {
  // In-memory user store seeded with standard refurbished electronics personas
  private users: Map<string, InternalUserRecord> = new Map();

  constructor(private readonly jwtService: JwtService) {
    this.seedDefaultUsers();
  }

  private async seedDefaultUsers() {
    const saltRounds = 10;
    const defaultPasswordHash = await bcrypt.hash('RefurbAdmin@2026', saltRounds);

    const seedData: Array<Omit<InternalUserRecord, 'refreshTokenHash' | 'resetTokenHash' | 'resetTokenExpiry'>> = [
      {
        id: 'usr-admin-01',
        email: 'alexa.vance@truerefurb.com',
        passwordHash: defaultPasswordHash,
        fullName: 'Alexa Vance',
        role: 'SUPER_ADMIN',
        badgeId: 'BADGE-ADM-001',
        facilityId: 'AUS-HUB-04',
        isActive: true,
      },
      {
        id: 'usr-mgr-02',
        email: 'carlos.m@truerefurb.com',
        passwordHash: defaultPasswordHash,
        fullName: 'Carlos Mendoza',
        role: 'TENANT_ADMIN',
        badgeId: 'BADGE-OPS-042',
        facilityId: 'AUS-HUB-04',
        isActive: true,
      },
      {
        id: 'usr-tech-03',
        email: 'marcus.v@truerefurb.com',
        passwordHash: defaultPasswordHash,
        fullName: 'Marcus Vance',
        role: 'REPAIR_TECHNICIAN',
        badgeId: 'BADGE-BCH-109',
        facilityId: 'AUS-HUB-04',
        isActive: true,
      },
      {
        id: 'usr-qa-04',
        email: 'sarah.lin@truerefurb.com',
        passwordHash: defaultPasswordHash,
        fullName: 'Sarah Lin',
        role: 'QA_INSPECTOR',
        badgeId: 'BADGE-QA-088',
        facilityId: 'AUS-HUB-04',
        isActive: true,
      },
      {
        id: 'usr-inv-05',
        email: 'darius.c@truerefurb.com',
        passwordHash: defaultPasswordHash,
        fullName: 'Darius Cole',
        role: 'INVENTORY_MANAGER',
        badgeId: 'BADGE-WH-021',
        facilityId: 'AUS-HUB-04',
        isActive: true,
      },
      {
        id: 'usr-sales-06',
        email: 'elena.r@truerefurb.com',
        passwordHash: defaultPasswordHash,
        fullName: 'Elena Rostova',
        role: 'SALES_EXECUTIVE',
        badgeId: 'BADGE-SLS-015',
        facilityId: 'AUS-HUB-04',
        isActive: true,
      },
    ];

    for (const u of seedData) {
      this.users.set(u.email.toLowerCase(), { ...u });
    }
  }

  // --- Password Hashing Utilities ---
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // --- Token Generation & Rotation ---
  async generateTokens(user: InternalUserRecord): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      facilityId: user.facilityId,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    // Refresh token with 7-day expiration and random entropy
    const refreshTokenId = crypto.randomUUID();
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, jti: refreshTokenId },
      { expiresIn: '7d' }
    );

    // Hash refresh token before saving (defense in depth)
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 8);
    this.users.set(user.email.toLowerCase(), user);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 mins in seconds
      tokenType: 'Bearer',
    };
  }

  // --- Core Authentication Methods ---
  async register(dto: {
    email: string;
    password: string;
    fullName: string;
    role?: UserRole;
    badgeId?: string;
    facilityId?: string;
  }): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const emailKey = dto.email.toLowerCase();
    if (this.users.has(emailKey)) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const newUser: InternalUserRecord = {
      id: `usr-${Date.now()}`,
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      role: dto.role || 'REPAIR_TECHNICIAN',
      badgeId: dto.badgeId || `BADGE-${Math.floor(100 + Math.random() * 900)}`,
      facilityId: dto.facilityId || 'AUS-HUB-04',
      isActive: true,
    };

    this.users.set(emailKey, newUser);
    const tokens = await this.generateTokens(newUser);

    return {
      user: this.toAuthUser(newUser),
      tokens,
    };
  }

  async login(email: string, password: string): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const user = this.users.get(email.toLowerCase());
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await this.verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);
    return {
      user: this.toAuthUser(user),
      tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const user = this.users.get(payload.email.toLowerCase());

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid or revoked refresh token');
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isValid) {
        // Token reuse detection: revoke immediately
        user.refreshTokenHash = undefined;
        this.users.set(user.email.toLowerCase(), user);
        throw new UnauthorizedException('Refresh token reuse detected. Please re-authenticate.');
      }

      // Rotate tokens
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Expired or malformed refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    for (const [key, user] of this.users.entries()) {
      if (user.id === userId) {
        user.refreshTokenHash = undefined;
        this.users.set(key, user);
        break;
      }
    }
  }

  // --- Password Reset Flow ---
  async requestPasswordReset(email: string): Promise<{ resetToken: string; message: string }> {
    const user = this.users.get(email.toLowerCase());
    if (!user) {
      // Don't leak user existence in production; return generic confirmation
      return { resetToken: '', message: 'If an account exists, a reset code was dispatched.' };
    }

    // Generate random secure token
    const rawResetToken = crypto.randomBytes(24).toString('hex');
    user.resetTokenHash = await bcrypt.hash(rawResetToken, 8);
    // Token expires in 1 hour
    user.resetTokenExpiry = new Date(Date.now() + 3600 * 1000);
    this.users.set(email.toLowerCase(), user);

    return {
      resetToken: rawResetToken,
      message: 'Password reset token generated (valid for 60 minutes).',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    let matchedUser: InternalUserRecord | null = null;
    let matchedKey: string | null = null;

    for (const [key, user] of this.users.entries()) {
      if (user.resetTokenHash && user.resetTokenExpiry && user.resetTokenExpiry > new Date()) {
        const matches = await bcrypt.compare(token, user.resetTokenHash);
        if (matches) {
          matchedUser = user;
          matchedKey = key;
          break;
        }
      }
    }

    if (!matchedUser || !matchedKey) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    matchedUser.passwordHash = await this.hashPassword(newPassword);
    matchedUser.resetTokenHash = undefined;
    matchedUser.resetTokenExpiry = undefined;
    matchedUser.refreshTokenHash = undefined; // Force re-login on all devices
    this.users.set(matchedKey, matchedUser);

    return { success: true, message: 'Password has been securely reset. Please log in.' };
  }

  async getMe(userId: string): Promise<AuthUser> {
    for (const user of this.users.values()) {
      if (user.id === userId) {
        return this.toAuthUser(user);
      }
    }
    throw new NotFoundException('User profile not found');
  }

  private toAuthUser(record: InternalUserRecord): AuthUser {
    const tenantId = 'TEN-001';

    return {
      id: record.id,
      email: record.email,
      fullName: record.fullName,
      role: record.role,
      badgeId: record.badgeId,
      tenantId,
      facilityId: record.facilityId,
      dataScope: {
        scopeType: 'TENANT',
        tenantId,
        facilityId: record.facilityId,
      },
      permissions: ROLE_PERMISSIONS[record.role] || [],
    };
  }
}
