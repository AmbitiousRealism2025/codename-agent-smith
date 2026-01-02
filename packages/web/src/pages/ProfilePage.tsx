import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useMutation, useQuery } from 'convex/react';
import { User, Mail, Calendar } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPreferences } from '@/components/settings/UserPreferences';

export function ProfilePage() {
  const { user: clerkUser, isLoaded } = useUser();
  const convexUser = useQuery(api.users.get);
  const getOrCreateUser = useMutation(api.users.getOrCreate);

  useEffect(() => {
    if (isLoaded && clerkUser && convexUser === null) {
      getOrCreateUser().catch(console.error);
    }
  }, [isLoaded, clerkUser, convexUser, getOrCreateUser]);

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!clerkUser) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    );
  }

  const createdAt = convexUser?.createdAt
    ? new Date(convexUser.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3">
        <User className="h-8 w-8 text-primary" />
        <h1 className="font-display text-3xl font-bold text-foreground">Profile</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Manage your account and preferences.
      </p>

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              {clerkUser.imageUrl && (
                <img
                  src={clerkUser.imageUrl}
                  alt={clerkUser.fullName ?? 'Profile'}
                  className="h-20 w-20 rounded-full border-2 border-border"
                />
              )}
              <div className="space-y-3">
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {clerkUser.fullName ?? 'Anonymous User'}
                  </p>
                </div>
                {clerkUser.primaryEmailAddress && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{clerkUser.primaryEmailAddress.emailAddress}</span>
                  </div>
                )}
                {createdAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {createdAt}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <UserPreferences />
      </div>
    </div>
  );
}
