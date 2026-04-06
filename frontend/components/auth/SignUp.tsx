'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiRequest, createGuestSession, sanitizeNextPath, saveAuthSession, updateStoredUser } from '@/lib/auth';
import { LoginResponse, RegisterPayload } from '@/lib/auth-types';
import type { AuthProfile } from '@/lib/types';
import styles from './SignIn.module.css';

const BENEFITS = [
  'Create your personal AI workspace in seconds',
  'Save prompts, workflows, and model comparisons',
  'Start secure chats and automation from one dashboard',
];

const TRUST_ITEMS = ['Secure onboarding', 'JWT session', 'Ready for teams'];

export default function SignUp() {
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
  } = useForm<RegisterPayload>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (form: RegisterPayload) => {
    setIsSubmitting(true);
    setServerError('');

    try {
      const tokens = await apiRequest<LoginResponse>('/auth/register', {
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
      const message = submissionError instanceof Error ? submissionError.message : 'Unable to create account';
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
          <div className={styles.storyBadge}>Create your NexusAI account</div>
          <h1 className={styles.title}>
            Launch your
            <span> AI control room.</span>
          </h1>
          <p className={styles.subtitle}>
            Register once and move straight into your marketplace, chat workflows, and saved model stack.
          </p>

          <div className={styles.metricCard}>
            <div>
              <p className={styles.metricLabel}>Getting started</p>
              <p className={styles.metricValue}>Under 60 seconds</p>
            </div>
            <div className={styles.metricPulse}>
              <span />
              Ready
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

        <section className={styles.formPanel} aria-labelledby="signup-title">
          <div className={styles.formHead}>
            <p className={styles.kicker}>Start free</p>
            <h2 id="signup-title">Create your account</h2>
            <p>Register with your name, work email, and a secure password.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className={styles.field}>
              <span>Full name</span>
              <input
                type="text"
                name="name"
                placeholder="Jane Doe"
                autoComplete="name"
                {...register('name', {
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
              />
            </label>
            {errors.name && <p className={styles.errorMessage}>{errors.name.message}</p>}

            <label className={styles.field}>
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="user@example.com"
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
                placeholder="strongPassword123"
                autoComplete="new-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters long',
                  },
                  validate: {
                    hasLetter: (value) => /[A-Za-z]/.test(value) || 'Password must include a letter',
                    hasNumber: (value) => /\d/.test(value) || 'Password must include a number',
                  },
                })}
              />
            </label>
            {errors.password && <p className={styles.errorMessage}>{errors.password.message}</p>}

            <p className={styles.helperText}>Password must be at least 8 characters long.</p>
            {serverError && <p className={styles.errorMessage}>{serverError}</p>}

            <div className={styles.formMeta}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(event) => setRememberDevice(event.target.checked)}
                />
                <span>Keep me signed in on this device</span>
              </label>

              <Link href="/signin" className={styles.inlineLink}>
                Already have an account?
              </Link>
            </div>

            <button type="submit" className={styles.primaryButton} disabled={isSubmitting || !isValid}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <button type="button" className={styles.secondaryButton} onClick={continueAsGuest}>
            Continue as guest
          </button>

          <p className={styles.signupText}>
            By continuing, you agree to our{' '}
            <Link href="/" className={styles.inlineLink}>
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/" className={styles.inlineLink}>
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </section>
    </main>
  );
}
