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
  { id: 'google', label: 'Google' },
  { id: 'github', label: 'GitHub' },
  { id: 'microsoft', label: 'Microsoft' },
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

  const handleSocialClick = (provider: string) => {
    onToast?.(`${provider} auth is not connected yet`);
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
                  <button key={provider.id} type="button" className={styles.socialButton} onClick={() => handleSocialClick(provider.label)}>
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
                  Create one -&gt;
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
                  <button key={provider.id} type="button" className={styles.socialButton} onClick={() => handleSocialClick(provider.label)}>
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
                  Sign in -&gt;
                </button>
              </p>
            </form>
          )}

          <button type="button" className={styles.guestButton} onClick={continueAsGuest}>
            Continue as guest
          </button>
        </div>
      </section>
    </div>
  );
}
