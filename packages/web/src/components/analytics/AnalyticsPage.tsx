import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { StatsCard } from './StatsCard';
import { UsageChart } from './UsageChart';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Percent, 
  Clock, 
  GitFork, 
  Share2 
} from 'lucide-react';

export function AnalyticsPage() {
  const stats = useQuery(api.analytics.getUserStats);

  if (stats === undefined) {
    return <LoadingSkeleton />;
  }

  if (stats === null) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Sign in to view your analytics
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Analytics
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track your agent configuration activity and usage patterns.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Sessions"
          value={stats.totalSessions}
          icon={FileText}
          description="Interviews started"
        />
        <StatsCard
          title="Completed"
          value={stats.completedSessions}
          icon={CheckCircle}
          description="Finished interviews"
        />
        <StatsCard
          title="Abandoned"
          value={stats.abandonedSessions}
          icon={XCircle}
          description="Incomplete sessions"
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          icon={Percent}
          description="Success rate"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Avg. Completion Time"
          value={stats.averageCompletionTime > 0 ? `${stats.averageCompletionTime} min` : 'N/A'}
          icon={Clock}
          description="Time to finish"
        />
        <StatsCard
          title="Custom Templates"
          value={stats.customTemplatesCount}
          icon={GitFork}
          description="Templates created"
        />
        <StatsCard
          title="Shared Documents"
          value={stats.sharedDocumentsCount}
          icon={Share2}
          description="Public share links"
        />
        <div />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <UsageChart
          title="Provider Usage"
          data={stats.providerUsage}
          emptyMessage="Complete your first interview to see provider stats"
        />
        <UsageChart
          title="Agent Archetype Distribution"
          data={stats.archetypeUsage}
          emptyMessage="Complete your first interview to see archetype stats"
        />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
        <div />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
