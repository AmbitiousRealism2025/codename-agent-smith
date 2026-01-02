import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { motion } from 'framer-motion';
import { api } from '../../../../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, FileText, AlertCircle, Clock } from 'lucide-react';
import { getTemplateById } from '@/templates';
import { MarkdownRenderer } from '@/components/document/MarkdownRenderer';

interface ValidShareData {
  agentName: string;
  templateId: string;
  documentContent: string;
  createdAt: number;
  expired: false;
}

function isValidShareData(data: unknown): data is ValidShareData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'documentContent' in data &&
    'agentName' in data &&
    'createdAt' in data
  );
}

export function SharedSessionPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const shareData = useQuery(api.shares.getByCode, code ? { shareCode: code } : 'skip');

  if (!code) {
    return <NotFound />;
  }

  if (shareData === undefined) {
    return <LoadingState />;
  }

  if (shareData === null) {
    return <NotFound />;
  }

  if ('expired' in shareData && shareData.expired === true) {
    return <ExpiredState />;
  }

  if (!isValidShareData(shareData)) {
    return <NotFound />;
  }

  const template = getTemplateById(shareData.templateId);
  const formattedDate = new Date(shareData.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <a
        href="#shared-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to content
      </a>
      <ThemeToggle />

      <main id="shared-content" className="container mx-auto px-4 py-8 max-w-4xl" tabIndex={-1}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go to Agent Advisor
        </Button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Clock className="h-4 w-4" />
            <span>Shared on {formattedDate}</span>
          </div>
          <h1 className="text-3xl font-bold">{shareData.agentName}</h1>
          {template && (
            <p className="text-muted-foreground mt-1">
              {template.name} Configuration
            </p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Planning Document
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[70vh] overflow-y-auto">
            <MarkdownRenderer content={shareData.documentContent} />
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            Want to create your own agent configuration?
          </p>
          <Button onClick={() => navigate('/')}>
            Get Started with Agent Advisor
          </Button>
        </div>
      </main>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-background">
      <ThemeToggle />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-10 w-64 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function NotFound() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex items-center justify-center"
    >
      <ThemeToggle />
      <div className="text-center px-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Share Not Found</h1>
        <p className="text-muted-foreground mb-6">
          This shared document doesn't exist or the link is invalid.
        </p>
        <Button onClick={() => navigate('/')}>
          Go to Agent Advisor
        </Button>
      </div>
    </motion.div>
  );
}

function ExpiredState() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex items-center justify-center"
    >
      <ThemeToggle />
      <div className="text-center px-4">
        <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Link Expired</h1>
        <p className="text-muted-foreground mb-6">
          This shared document link has expired and is no longer available.
        </p>
        <Button onClick={() => navigate('/')}>
          Go to Agent Advisor
        </Button>
      </div>
    </motion.div>
  );
}
