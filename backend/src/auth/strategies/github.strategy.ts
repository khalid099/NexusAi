import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';

export interface GithubProfile {
  email: string;
  name: string;
  githubId: string;
  avatarUrl: string;
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID') ?? 'placeholder',
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') ?? 'placeholder',
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL') ?? 'http://localhost:4000/auth/github/callback',
      scope: ['user:email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: unknown, user?: GithubProfile) => void,
  ): void {
    const email =
      profile.emails?.find((e) => e.primary)?.value ??
      profile.emails?.[0]?.value ??
      `${profile.username}@github.com`;

    const githubProfile: GithubProfile = {
      email,
      name: profile.displayName ?? profile.username ?? '',
      githubId: profile.id,
      avatarUrl: profile.photos?.[0]?.value ?? '',
    };

    done(null, githubProfile);
  }
}
