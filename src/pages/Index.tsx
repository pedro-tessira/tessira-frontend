import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { apiFetch } from '@/lib/api';
import { getToken, setToken } from '@/lib/auth';
import { useMe } from '@/queries/useMe';
import { useQueryClient } from '@tanstack/react-query';
import { usePublicSsoProviders } from '@/queries/usePublicSsoProviders';

interface DevLoginResponse {
  token: string;
}

interface PasswordLoginResponse {
  token: string;
}

const Index = () => {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState(() => getToken());
  const [email, setEmail] = useState('admin@local');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { isLoading: isMeLoading } = useMe({ enabled: !!token });
  const { data: ssoProviders = [] } = usePublicSsoProviders();
  const hasSsoProviders = ssoProviders.length > 0;

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    if (!password.trim()) {
      setLoginError("Password is required.");
      return;
    }
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const body: { email: string; password: string } = { email: email.trim(), password };
      const response = await apiFetch<PasswordLoginResponse>('/api/auth/sessions', {
        method: 'POST',
        body: JSON.stringify(body),
        skipAuthRedirect: true,
      });
      setToken(response.token);
      setTokenState(response.token);
      queryClient.invalidateQueries({ queryKey: ['me'] });
    } catch (error: unknown) {
      const message = typeof error === 'object' && error && 'message' in error ? String(error.message) : 'Login failed.';
      setLoginError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-6 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TH</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Horizon</h1>
              <p className="text-sm text-muted-foreground">
                {hasSsoProviders ? "Choose how to sign in" : "Sign in to continue"}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {hasSsoProviders && (
              <>
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Sign in with SSO
                  </div>
                  <div className="grid gap-2">
                    {ssoProviders.map((provider) => (
                      <button
                        key={provider.id}
                        type="button"
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        Continue with {provider.displayName || provider.provider}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              </>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className="px-3 py-2 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  className="px-3 py-2 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
              {loginError && (
                <div className="text-xs text-destructive">{loginError}</div>
              )}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60"
              >
                {isLoggingIn ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (isMeLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">
        Loading your workspace...
      </div>
    );
  }

  return <AppShell />;
};

export default Index;
