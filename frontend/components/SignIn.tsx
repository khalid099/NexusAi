'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiRequest, createGuestSession, sanitizeNextPath, saveAuthSession, updateStoredUser } from '@/lib/auth';
import { LoginPayload, LoginResponse } from '@/lib/auth-types';
import type { AuthProfile } from '@/lib/types';
import styles from './SignIn.module.css';

const BENEFITS = [
  'Save your favorite models and prompts',
  'Sync chat history across web and mobile',
  'Launch agents with team-ready workflows',
];

const TRUST_ITEMS = ['JWT auth', 'SSO ready', 'Workspace sync'];

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = sanitizeNextPath(searchParams.get('next'));
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginPayload>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (form: LoginPayload) => {
    setIsSubmitting(true);
    setServerError('');

    try {
      const tokens = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      const profile: AuthProfile = await apiRequest('/users/me', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      saveAuthSession(tokens, profile, rememberDevice ? 'local' : 'session');
      updateStoredUser(profile);

      router.push(nextPath);
      router.refresh();
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : 'Unable to sign in';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const continueAsGuest = () => {
    createGuestSession();
    router.push(nextPath);
    router.refresh();
  };

  return (
    <main className={styles.page}>
      <div className={styles.backdrop} />

      <section className={styles.shell}>
        <div className={styles.storyPanel}>
          <div className={styles.storyBadge}>NexusAI access</div>
          <h1 className={styles.title}>
            Step back into your
            <span> AI workspace.</span>
          </h1>
          <p className={styles.subtitle}>
            Pick up your chats, saved models, and active automations without losing momentum.
          </p>

          <div className={styles.metricCard}>
            <div>
              <p className={styles.metricLabel}>Team signal</p>
              <p className={styles.metricValue}>18 live workflows</p>
            </div>
            <div className={styles.metricPulse}>
              <span />
              Synced
            </div>
          </div>

          <ul className={styles.benefitList}>
            {BENEFITS.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>

          <div className={styles.trustRow}>
            {TRUST_ITEMS.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <section className={styles.formPanel} aria-labelledby="signin-title">
          <div className={styles.formHead}>
            <p className={styles.kicker}>Welcome back</p>
            <h2 id="signin-title">Sign in to NexusAI</h2>
            <p>
              Use your work email or continue with your preferred provider.
            </p>
          </div>

          <div className={styles.socialGrid}>
            <button type="button" className={styles.socialButton}>
              <span className={styles.socialIcon}>G</span>
              Continue with Google
            </button>
            <button type="button" className={styles.socialButton}>
              <span className={styles.socialIcon}>GH</span>
              Continue with GitHub
            </button>
          </div>

          <div className={styles.divider}>
            <span>or sign in with email</span>
          </div>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className={styles.field}>
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="founder@nexusai.app"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
              />
            </label>
            {errors.email && <p className={styles.errorMessage}>{errors.email.message}</p>}

            <label className={styles.field}>
              <span>Password</span>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
              />
            </label>
            {errors.password && <p className={styles.errorMessage}>{errors.password.message}</p>}

            {serverError && <p className={styles.errorMessage}>{serverError}</p>}

            <div className={styles.formMeta}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  name="remember"
                  checked={rememberDevice}
                  onChange={(event) => setRememberDevice(event.target.checked)}
                />
                <span>Remember this device</span>
              </label>

              <button type="button" className={styles.inlineTextButton} onClick={() => setServerError('Password reset is not available yet.')}>
                Forgot password?
              </button>
            </div>

            <button type="submit" className={styles.primaryButton} disabled={isSubmitting || !isValid}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <button type="button" className={styles.secondaryButton} onClick={continueAsGuest}>
            Continue as guest
          </button>

          <p className={styles.signupText}>
            New to NexusAI?{' '}
            <Link href={`/signup?next=${encodeURIComponent(nextPath)}`} className={styles.inlineLink}>
              Create an account
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
}
