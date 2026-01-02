import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { 
  TemplateEditor, 
  templateToEditable, 
  type EditableTemplate 
} from '@/components/templates/TemplateEditor';
import { MarkdownRenderer } from '@/components/document/MarkdownRenderer';
import { getDocumentTemplateById } from '@/templates';
import { ArrowLeft, Save, Eye, EyeOff, GitFork, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_SECTION = {
  title: '',
  description: '',
  subsections: [],
  contentGuidance: [],
  examples: [],
};

function createEmptyTemplate(): EditableTemplate {
  return {
    name: 'New Template',
    description: '',
    capabilityTags: [],
    idealFor: [],
    documentSections: {
      overview: { ...EMPTY_SECTION, title: 'Overview' },
      architecture: { ...EMPTY_SECTION, title: 'Architecture' },
      implementation: { ...EMPTY_SECTION, title: 'Implementation' },
      testing: { ...EMPTY_SECTION, title: 'Testing' },
      deployment: { ...EMPTY_SECTION, title: 'Deployment' },
      monitoring: { ...EMPTY_SECTION, title: 'Monitoring' },
      troubleshooting: { ...EMPTY_SECTION, title: 'Troubleshooting' },
      maintenance: { ...EMPTY_SECTION, title: 'Maintenance' },
    },
    planningChecklist: [],
    architecturePatterns: [],
    riskConsiderations: [],
    successCriteria: [],
    implementationGuidance: [],
  };
}

function generatePreview(template: EditableTemplate): string {
  let markdown = `# ${template.name}\n\n`;
  markdown += `${template.description}\n\n`;
  
  if (template.capabilityTags.length > 0) {
    markdown += `**Capabilities:** ${template.capabilityTags.join(', ')}\n\n`;
  }
  
  if (template.idealFor.length > 0) {
    markdown += `## Ideal For\n\n`;
    template.idealFor.forEach(item => {
      markdown += `- ${item}\n`;
    });
    markdown += '\n';
  }

  Object.entries(template.documentSections).forEach(([key, section]) => {
    if (section.title || section.description) {
      markdown += `## ${section.title || key}\n\n`;
      if (section.description) {
        markdown += `${section.description}\n\n`;
      }
      if (section.subsections.length > 0) {
        markdown += `### Subsections\n\n`;
        section.subsections.forEach(sub => {
          if (sub) markdown += `- ${sub}\n`;
        });
        markdown += '\n';
      }
    }
  });

  return markdown;
}

export function TemplateEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useUser();
  
  const forkFrom = searchParams.get('fork');
  const isNewTemplate = id === 'new';
  const isConvexId = id && !isNewTemplate && id.length > 20;
  
  const [template, setTemplate] = useState<EditableTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalConvexId, setOriginalConvexId] = useState<Id<'templates'> | null>(null);

  const customTemplate = useQuery(
    api.templates.get,
    isConvexId ? { id: id as Id<'templates'> } : 'skip'
  );
  
  const createTemplate = useMutation(api.templates.create);
  const updateTemplate = useMutation(api.templates.update);

  useEffect(() => {
    if (isNewTemplate) {
      if (forkFrom) {
        const builtIn = getDocumentTemplateById(forkFrom);
        if (builtIn) {
          const editable = templateToEditable(builtIn);
          editable.name = `${builtIn.name} (Custom)`;
          editable.basedOn = forkFrom;
          setTemplate(editable);
        } else {
          setTemplate(createEmptyTemplate());
        }
      } else {
        setTemplate(createEmptyTemplate());
      }
    } else if (isConvexId && customTemplate) {
      try {
        const parsed = JSON.parse(customTemplate.documentSections);
        setTemplate({
          name: customTemplate.name,
          description: customTemplate.description,
          basedOn: customTemplate.basedOn,
          capabilityTags: customTemplate.capabilityTags,
          idealFor: customTemplate.idealFor,
          documentSections: parsed,
          planningChecklist: customTemplate.planningChecklist,
          architecturePatterns: customTemplate.architecturePatterns,
          riskConsiderations: customTemplate.riskConsiderations,
          successCriteria: customTemplate.successCriteria,
          implementationGuidance: customTemplate.implementationGuidance,
        });
        setOriginalConvexId(customTemplate._id);
      } catch {
        toast.error('Invalid template data');
        navigate('/templates');
      }
    } else if (isConvexId && customTemplate === null) {
      toast.error('Template not found');
      navigate('/templates');
    } else if (!isConvexId && id) {
      const builtIn = getDocumentTemplateById(id);
      if (builtIn) {
        navigate(`/templates/edit/new?fork=${id}`);
      } else {
        toast.error('Template not found');
        navigate('/templates');
      }
    }
  }, [id, forkFrom, isNewTemplate, isConvexId, customTemplate, navigate]);

  const handleSave = async () => {
    if (!template) return;
    if (!isSignedIn) {
      toast.error('Please sign in to save templates');
      navigate('/sign-in');
      return;
    }

    if (!template.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    setIsSaving(true);
    try {
      const sectionsJson = JSON.stringify(template.documentSections);
      
      if (originalConvexId) {
        await updateTemplate({
          id: originalConvexId,
          name: template.name,
          description: template.description,
          capabilityTags: template.capabilityTags,
          idealFor: template.idealFor,
          documentSections: sectionsJson,
          planningChecklist: template.planningChecklist,
          architecturePatterns: template.architecturePatterns,
          riskConsiderations: template.riskConsiderations,
          successCriteria: template.successCriteria,
          implementationGuidance: template.implementationGuidance,
        });
        toast.success('Template updated successfully');
      } else {
        const newId = await createTemplate({
          name: template.name,
          description: template.description,
          basedOn: template.basedOn,
          capabilityTags: template.capabilityTags,
          idealFor: template.idealFor,
          documentSections: sectionsJson,
          planningChecklist: template.planningChecklist,
          architecturePatterns: template.architecturePatterns,
          riskConsiderations: template.riskConsiderations,
          successCriteria: template.successCriteria,
          implementationGuidance: template.implementationGuidance,
        });
        toast.success('Template created successfully');
        navigate(`/templates/edit/${newId}`, { replace: true });
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isConvexId && customTemplate === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading template...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/templates')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-lg leading-tight">
                {isNewTemplate ? 'Create Template' : 'Edit Template'}
              </h1>
              {template.basedOn && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <GitFork className="w-3 h-3" />
                  Forked from {template.basedOn}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !isSignedIn}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {originalConvexId ? 'Update' : 'Save'}
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {!isSignedIn && (
          <Card className="mb-6 border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="py-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Sign in to save your custom templates to the cloud.{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto text-yellow-700 dark:text-yellow-400 underline"
                  onClick={() => navigate('/sign-in')}
                >
                  Sign in now
                </Button>
              </p>
            </CardContent>
          </Card>
        )}

        <div className={showPreview ? 'grid gap-6 lg:grid-cols-2' : ''}>
          <div className={showPreview ? 'lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-4' : ''}>
            <TemplateEditor template={template} onChange={setTemplate} />
          </div>

          {showPreview && (
            <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <MarkdownRenderer content={generatePreview(template)} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
