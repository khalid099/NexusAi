import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const MicrosoftStrategy = require('passport-microsoft').Strategy;

export interface MicrosoftProfile {
  email: string;
  name: string;
  microsoftId: string;
  avatarUrl: string;
}

@Injectable()
export class MsStrategy extends PassportStrategy(MicrosoftStrategy, 'microsoft') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('MICROSOFT_CLIENT_ID') ?? 'placeholder',
      clientSecret: configService.get<string>('MICROSOFT_CLIENT_SECRET') ?? 'placeholder',
      callbackURL: configService.get<string>('MICROSOFT_CALLBACK_URL') ?? 'http://localhost:4000/auth/microsoft/callback',
      scope: ['user.read'],
      tenant: 'common',
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: { id: string; displayName?: string; emails?: { value: string }[]; photos?: { value: string }[] },
    done: (err: unknown, user?: MicrosoftProfile) => void,
  ): void {
    const microsoftProfile: MicrosoftProfile = {
      email: profile.emails?.[0]?.value ?? '',
      name: profile.displayName ?? '',
      microsoftId: profile.id,
      avatarUrl: profile.photos?.[0]?.value ?? '',
    };

    done(null, microsoftProfile);
  }
}
