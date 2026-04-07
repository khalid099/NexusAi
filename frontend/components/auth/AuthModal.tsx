'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiRequest, createGuestSession, saveAuthSession, sanitizeNextPath, updateStoredUser } from '@/lib/auth';
import type { LoginResponse, RegisterPayload, LoginPayload } from '@/lib/auth-types';
import type { AuthProfile } from '@/lib/types';
import styles from './AuthModal.module.css';

type AuthMode = 'signin' | 'signup';

interface AuthModalProps {
  initialMode?: AuthMode;
  nextPath?: string;
  inlinePage?: boolean;
  onClose?: () => void;
  onSuccess?: (profile: AuthProfile) => void;
  onToast?: (message: string) => void;
}

interface SignUpFormValues extends RegisterPayload {
  confirmPassword: string;
}

const FEATURE_LIST = [
  '525+ AI models from 30+ labs',
  'Custom agent builder with any model',
  'Connect tools, memory and APIs',
  'Real-time analytics and monitoring',
];

const SOCIAL_PROVIDERS = [
  {
    id: 'google',
    label: 'Google',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    ),
  },
  {
    id: 'microsoft',
    label: 'Microsoft',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" width="18" height="18">
        <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
        <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
        <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
        <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
      </svg>
    ),
  },
];

async function fetchProfile(accessToken: string): Promise<AuthProfile> {
  return apiRequest<AuthProfile>('/users/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export default function AuthModal({
  initialMode = 'signin',
  nextPath = '/landing',
  inlinePage = false,
  onClose,
  onSuccess,
  onToast,
}: AuthModalProps) {
  const router = useRouter();
  const safeNextPath = useMemo(() => sanitizeNextPath(nextPath), [nextPath]);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const signInForm = useForm<LoginPayload>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpFormValues>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleAuthSuccess = async (tokens: LoginResponse) => {
    const profile = await fetchProfile(tokens.accessToken);
    saveAuthSession(tokens, profile, rememberDevice ? 'local' : 'session');
    updateStoredUser(profile);
    onSuccess?.(profile);

    if (onClose) {
      onClose();
    } else {
      router.push(safeNextPath);
      router.refresh();
    }
  };

  const submitSignIn = signInForm.handleSubmit(async (form) => {
    setIsSubmitting(true);
    setServerError('');

    try {
      const tokens = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      await handleAuthSuccess(tokens);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  });

  const submitSignUp = signUpForm.handleSubmit(async (form) => {
    setIsSubmitting(true);
    setServerError('');

    try {
      const tokens = await apiRequest<LoginResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      await handleAuthSuccess(tokens);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Unable to create account');
    } finally {
      setIsSubmitting(false);
    }
  });

  const continueAsGuest = () => {
    createGuestSession();

    if (onClose) {
      onClose();
      onToast?.('Continuing as guest');
      return;
    }

    router.push(safeNextPath);
    router.refresh();
  };

  const handleSocialClick = (providerId: string) => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    window.location.href = `${apiBase}/auth/${providerId}`;
  };

  return (
    <div className={inlinePage ? styles.pageShell : styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} aria-hidden={onClose ? 'true' : 'false'} />

      <section className={`${styles.modal} ${inlinePage ? styles.modalInline : ''}`} aria-modal="true" role="dialog" aria-labelledby="auth-title">
        <div className={styles.leftPanel}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>
              <svg viewBox="0 0 14 14" aria-hidden="true">
                <path d="M7 1 L13 7 L7 13 L1 7 Z" />
              </svg>
            </div>
            <span>NexusAI</span>
          </div>

          <div className={styles.botHalo}>
            <div className={styles.botAvatar}>
              <div className={styles.botAntennaLeft} />
              <div className={styles.botAntennaRight} />
              <div className={styles.botHead}>
                <div className={styles.botStripe} />
                <div className={styles.botEyes}>
                  <span />
                  <span />
                </div>
                <div className={styles.botMouth} />
              </div>
            </div>
          </div>

          <div className={styles.leftContent}>
            <h2>Build Smarter with AI Agents</h2>
            <p>
              Access 525+ models, create custom agents, and automate your workflow all in one platform.
            </p>

            <ul className={styles.featureList}>
              {FEATURE_LIST.map((item) => (
                <li key={item}>
                  <span className={styles.featureDot} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => {
              if (onClose) {
                onClose();
                return;
              }
              router.push('/landing');
            }}
            aria-label="Close auth modal"
          >
            <span />
            <span />
          </button>

          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${mode === 'signin' ? styles.tabActive : ''}`}
              onClick={() => {
                setMode('signin');
                setServerError('');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
              onClick={() => {
                setMode('signup');
                setServerError('');
              }}
            >
              Create Account
            </button>
          </div>

          {mode === 'signin' ? (
            <form className={styles.formWrap} onSubmit={submitSignIn} noValidate>
              <div className={styles.formHead}>
                <h1 id="auth-title">Welcome back</h1>
                <p>Sign in to your NexusAI account to continue.</p>
              </div>

              <label className={styles.field}>
                <span>Email address</span>
                <input
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  {...signInForm.register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
              </label>
              {signInForm.formState.errors.email && <p className={styles.error}>{signInForm.formState.errors.email.message}</p>}

              <label className={styles.field}>
                <span>Password</span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...signInForm.register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                />
              </label>
              {signInForm.formState.errors.password && <p className={styles.error}>{signInForm.formState.errors.password.message}</p>}

              <button type="button" className={styles.textAction} onClick={() => onToast?.('Password reset flow is not available yet.')}>
                Forgot password?
              </button>

              {serverError && <p className={styles.error}>{serverError}</p>}

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSubmitting || !signInForm.formState.isValid}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>

              <div className={styles.divider}>
                <span>Or continue with</span>
              </div>

              <div className={styles.socialRow}>
                {SOCIAL_PROVIDERS.map((provider) => (
                  <button key={provider.id} type="button" className={styles.socialButton} onClick={() => handleSocialClick(provider.id)}>
                    {provider.icon}
                    {provider.label}
                  </button>
                ))}
              </div>

              <label className={styles.rememberRow}>
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(event) => setRememberDevice(event.target.checked)}
                />
                <span>Remember this device</span>
              </label>

              <p className={styles.footerText}>
                Don&apos;t have an account?{' '}
                <button type="button" className={styles.inlineSwitch} onClick={() => setMode('signup')}>
                  Create one
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </button>
              </p>
            </form>
          ) : (
            <form className={styles.formWrap} onSubmit={submitSignUp} noValidate>
              <div className={styles.formHead}>
                <h1 id="auth-title">Create your account</h1>
                <p>Get started with NexusAI. It&apos;s free.</p>
              </div>

              <label className={styles.field}>
                <span>Full name</span>
                <input
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  {...signUpForm.register('name', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                />
              </label>
              {signUpForm.formState.errors.name && <p className={styles.error}>{signUpForm.formState.errors.name.message}</p>}

              <label className={styles.field}>
                <span>Email address</span>
                <input
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  {...signUpForm.register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
              </label>
              {signUpForm.formState.errors.email && <p className={styles.error}>{signUpForm.formState.errors.email.message}</p>}

              <label className={styles.field}>
                <span>Password</span>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  {...signUpForm.register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                />
              </label>
              {signUpForm.formState.errors.password && <p className={styles.error}>{signUpForm.formState.errors.password.message}</p>}

              <label className={styles.field}>
                <span>Confirm password</span>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  {...signUpForm.register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === signUpForm.getValues('password') || 'Passwords do not match',
                  })}
                />
              </label>
              {signUpForm.formState.errors.confirmPassword && <p className={styles.error}>{signUpForm.formState.errors.confirmPassword.message}</p>}

              {serverError && <p className={styles.error}>{serverError}</p>}

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSubmitting || !signUpForm.formState.isValid}
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>

              <div className={styles.divider}>
                <span>Or continue with</span>
              </div>

              <div className={styles.socialRow}>
                {SOCIAL_PROVIDERS.map((provider) => (
                  <button key={provider.id} type="button" className={styles.socialButton} onClick={() => handleSocialClick(provider.id)}>
                    {provider.icon}
                    {provider.label}
                  </button>
                ))}
              </div>

              <label className={styles.rememberRow}>
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(event) => setRememberDevice(event.target.checked)}
                />
                <span>Keep me signed in on this device</span>
              </label>

              <p className={styles.footerText}>
                Already have an account?{' '}
                <button type="button" className={styles.inlineSwitch} onClick={() => setMode('signin')}>
                  Sign in
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </button>
              </p>
            </form>
          )}

        </div>
      </section>
    </div>
  );
}
