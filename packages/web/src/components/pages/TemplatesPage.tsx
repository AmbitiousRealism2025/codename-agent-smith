import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { useUser } from '@clerk/clerk-react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { ALL_TEMPLATES, getTemplateById } from '@/templates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowRight, Check, FileText, Code, BarChart3, Search, Zap, Plus, GitFork, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  'data-analyst': <BarChart3 className="w-8 h-8" />,
  'content-creator': <FileText className="w-8 h-8" />,
  'code-assistant': <Code className="w-8 h-8" />,
  'research-agent': <Search className="w-8 h-8" />,
  'automation-agent': <Zap className="w-8 h-8" />,
};

const CAPABILITY_COLORS: Record<string, string> = {
  'data-processing': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'statistics': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'visualization': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'reporting': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'file-access': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  'content-creation': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  'seo': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'formatting': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  'code-review': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'testing': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  'refactoring': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  'research': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  'web-search': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  'web-scraping': 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400',
  'fact-checking': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'automation': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  'scheduling': 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  'orchestration': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
};

function getCapabilityColor(tag: string): string {
  return CAPABILITY_COLORS[tag] || 'bg-muted text-muted-foreground';
}

export function TemplatesPage() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<Id<'templates'> | null>(null);

  const customTemplates = useQuery(api.templates.listForCurrentUser);
  const deleteTemplate = useMutation(api.templates.remove);

  const template = selectedTemplate ? getTemplateById(selectedTemplate) : null;

  const allTags = [...new Set(ALL_TEMPLATES.flatMap((t) => t.capabilityTags))].sort();

  const filteredTemplates = filterTag
    ? ALL_TEMPLATES.filter((t) => t.capabilityTags.includes(filterTag))
    : ALL_TEMPLATES;

  const handleStartWithTemplate = () => {
    setSelectedTemplate(null);
    navigate('/setup');
  };

  const handleForkTemplate = (templateId: string) => {
    navigate(`/templates/edit/new?fork=${templateId}`);
    setSelectedTemplate(null);
  };

  const handleDeleteCustomTemplate = async (id: Id<'templates'>) => {
    try {
      setDeletingId(id);
      await deleteTemplate({ id });
      toast.success('Template deleted');
    } catch {
      toast.error('Failed to delete template');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Agent Templates
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse 5 specialized templates for different use cases. Each includes tools, prompts, and architecture patterns.
          </p>
        </div>
        <div className="flex gap-2">
          {isSignedIn && (
            <Button variant="outline" onClick={() => navigate('/templates/edit/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          )}
          <Button onClick={() => navigate('/setup')}>
            Custom Interview
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={filterTag === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterTag(null)}
        >
          All
        </Button>
        {allTags.slice(0, 8).map((tag) => (
          <Button
            key={tag}
            variant={filterTag === tag ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterTag(filterTag === tag ? null : tag)}
          >
            {tag.replace(/-/g, ' ')}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((tmpl, index) => (
          <motion.div
            key={tmpl.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 h-full flex flex-col"
              onClick={() => setSelectedTemplate(tmpl.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {TEMPLATE_ICONS[tmpl.id] || <FileText className="w-8 h-8" />}
                  </div>
                  <CardTitle className="text-lg">{tmpl.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {tmpl.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {tmpl.capabilityTags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-0.5 text-xs rounded-full ${getCapabilityColor(tag)}`}
                    >
                      {tag.replace(/-/g, ' ')}
                    </span>
                  ))}
                  {tmpl.capabilityTags.length > 4 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                      +{tmpl.capabilityTags.length - 4}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {isSignedIn && customTemplates && customTemplates.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            My Custom Templates
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customTemplates.map((tmpl, index) => (
              <motion.div
                key={tmpl._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{tmpl.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/templates/edit/${tmpl._id}`)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteCustomTemplate(tmpl._id)}
                          disabled={deletingId === tmpl._id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {tmpl.description || 'No description'}
                    </p>
                    {tmpl.basedOn && (
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <GitFork className="w-3 h-3" />
                        Based on: {tmpl.basedOn}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {tmpl.capabilityTags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className={`px-2 py-0.5 text-xs rounded-full ${getCapabilityColor(tag)}`}
                        >
                          {tag.replace(/-/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {template && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {TEMPLATE_ICONS[template.id] || <FileText className="w-8 h-8" />}
                  </div>
                  <DialogTitle className="text-2xl">{template.name}</DialogTitle>
                </div>
                <DialogDescription className="text-base">
                  {template.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Capabilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {template.capabilityTags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2.5 py-1 text-xs rounded-full ${getCapabilityColor(tag)}`}
                      >
                        {tag.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Ideal For</h4>
                  <ul className="space-y-2">
                    {template.idealFor.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {template.requiredDependencies.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Required Dependencies</h4>
                    <div className="flex flex-wrap gap-2">
                      {template.requiredDependencies.map((dep) => (
                        <code
                          key={dep}
                          className="px-2 py-1 text-xs bg-muted rounded font-mono"
                        >
                          {dep}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={handleStartWithTemplate} className="flex-1">
                    Start Interview
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleForkTemplate(template.id)}
                    title="Create a custom version of this template"
                  >
                    <GitFork className="w-4 h-4 mr-2" />
                    Fork
                  </Button>
                  <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
