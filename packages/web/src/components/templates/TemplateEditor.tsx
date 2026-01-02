import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SectionEditor } from './SectionEditor';
import { Plus, Trash2, X, Tag } from 'lucide-react';
import type { DocumentSection, DocumentTemplate } from '@/templates';

export interface EditableTemplate {
  name: string;
  description: string;
  basedOn?: string;
  capabilityTags: string[];
  idealFor: string[];
  documentSections: Record<string, DocumentSection>;
  planningChecklist: string[];
  architecturePatterns: string[];
  riskConsiderations: string[];
  successCriteria: string[];
  implementationGuidance: string[];
}

interface TemplateEditorProps {
  template: EditableTemplate;
  onChange: (template: EditableTemplate) => void;
}

const REQUIRED_SECTIONS = [
  'overview',
  'architecture',
  'implementation',
  'testing',
  'deployment',
  'monitoring',
  'troubleshooting',
  'maintenance',
];

export function TemplateEditor({ template, onChange }: TemplateEditorProps) {
  const [newTag, setNewTag] = useState('');
  const [newIdealFor, setNewIdealFor] = useState('');
  const [activeTab, setActiveTab] = useState<'metadata' | 'sections' | 'guidance'>('metadata');

  const updateTemplate = (updates: Partial<EditableTemplate>) => {
    onChange({ ...template, ...updates });
  };

  const updateSection = (key: string, section: DocumentSection) => {
    updateTemplate({
      documentSections: {
        ...template.documentSections,
        [key]: section,
      },
    });
  };

  const addTag = () => {
    if (newTag.trim() && !template.capabilityTags.includes(newTag.trim())) {
      updateTemplate({
        capabilityTags: [...template.capabilityTags, newTag.trim().toLowerCase().replace(/\s+/g, '-')],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    updateTemplate({
      capabilityTags: template.capabilityTags.filter((t) => t !== tag),
    });
  };

  const addIdealFor = () => {
    if (newIdealFor.trim() && !template.idealFor.includes(newIdealFor.trim())) {
      updateTemplate({
        idealFor: [...template.idealFor, newIdealFor.trim()],
      });
      setNewIdealFor('');
    }
  };

  const removeIdealFor = (item: string) => {
    updateTemplate({
      idealFor: template.idealFor.filter((i) => i !== item),
    });
  };

  const updateArrayField = (
    field: 'planningChecklist' | 'architecturePatterns' | 'riskConsiderations' | 'successCriteria' | 'implementationGuidance',
    index: number,
    value: string
  ) => {
    const updated = [...template[field]];
    updated[index] = value;
    updateTemplate({ [field]: updated });
  };

  const addArrayField = (
    field: 'planningChecklist' | 'architecturePatterns' | 'riskConsiderations' | 'successCriteria' | 'implementationGuidance'
  ) => {
    updateTemplate({ [field]: [...template[field], ''] });
  };

  const removeArrayField = (
    field: 'planningChecklist' | 'architecturePatterns' | 'riskConsiderations' | 'successCriteria' | 'implementationGuidance',
    index: number
  ) => {
    updateTemplate({ [field]: template[field].filter((_, i) => i !== index) });
  };

  const renderArrayEditor = (
    label: string,
    field: 'planningChecklist' | 'architecturePatterns' | 'riskConsiderations' | 'successCriteria' | 'implementationGuidance',
    placeholder: string
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addArrayField(field)}
          className="h-7"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Item
        </Button>
      </div>
      <div className="space-y-2">
        {template[field].map((item, index) => (
          <div key={index} className="flex items-start gap-2 group">
            <span className="text-muted-foreground text-sm mt-2 w-6">{index + 1}.</span>
            <Textarea
              value={item}
              onChange={(e) => updateArrayField(field, index, e.target.value)}
              placeholder={placeholder}
              className="min-h-[40px] flex-1"
              rows={2}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeArrayField(field, index)}
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {template[field].length === 0 && (
          <p className="text-sm text-muted-foreground italic py-2">
            No items yet. Click "Add Item" to create one.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b pb-2">
        <Button
          variant={activeTab === 'metadata' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('metadata')}
        >
          Basic Info
        </Button>
        <Button
          variant={activeTab === 'sections' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('sections')}
        >
          Document Sections
        </Button>
        <Button
          variant={activeTab === 'guidance' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('guidance')}
        >
          Guidance & Criteria
        </Button>
      </div>

      {activeTab === 'metadata' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={template.name}
                  onChange={(e) => updateTemplate({ name: e.target.value })}
                  placeholder="e.g., Custom Code Assistant"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={template.description}
                  onChange={(e) => updateTemplate({ description: e.target.value })}
                  placeholder="Describe what this agent template is designed for..."
                  rows={4}
                />
              </div>

              {template.basedOn && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Based on:</span> {template.basedOn}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Capability Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {template.capabilityTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-primary/10 text-primary rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a capability tag"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ideal For</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {template.idealFor.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <span className="flex-1 text-sm py-2 px-3 bg-muted rounded">
                      {item}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIdealFor(item)}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newIdealFor}
                  onChange={(e) => setNewIdealFor(e.target.value)}
                  placeholder="Add use case (e.g., 'Building REST APIs')"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIdealFor())}
                />
                <Button type="button" variant="outline" onClick={addIdealFor}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'sections' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Edit the document sections that will be generated for this template.
            All 8 required sections are shown below.
          </p>
          {REQUIRED_SECTIONS.map((key) => (
            <SectionEditor
              key={key}
              sectionKey={key}
              section={template.documentSections[key] || {
                title: key.charAt(0).toUpperCase() + key.slice(1),
                description: '',
                subsections: [],
                contentGuidance: [],
                examples: [],
              }}
              onChange={updateSection}
            />
          ))}
        </div>
      )}

      {activeTab === 'guidance' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              {renderArrayEditor(
                'Planning Checklist',
                'planningChecklist',
                'Add a planning step or consideration'
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {renderArrayEditor(
                'Architecture Patterns',
                'architecturePatterns',
                'Describe an architecture pattern'
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {renderArrayEditor(
                'Risk Considerations',
                'riskConsiderations',
                'Add a risk or mitigation strategy'
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {renderArrayEditor(
                'Success Criteria',
                'successCriteria',
                'Define a success criterion'
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {renderArrayEditor(
                'Implementation Guidance',
                'implementationGuidance',
                'Add implementation step or guidance'
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export function templateToEditable(template: DocumentTemplate): EditableTemplate {
  return {
    name: template.name,
    description: template.description,
    capabilityTags: [...template.capabilityTags],
    idealFor: [...template.idealFor],
    documentSections: JSON.parse(JSON.stringify(template.documentSections)),
    planningChecklist: [...template.planningChecklist],
    architecturePatterns: [...template.architecturePatterns],
    riskConsiderations: [...template.riskConsiderations],
    successCriteria: [...template.successCriteria],
    implementationGuidance: [...template.implementationGuidance],
  };
}

export function editableToTemplate(editable: EditableTemplate, id: string): DocumentTemplate {
  return {
    id,
    name: editable.name,
    description: editable.description,
    capabilityTags: editable.capabilityTags,
    idealFor: editable.idealFor,
    documentSections: editable.documentSections,
    planningChecklist: editable.planningChecklist,
    architecturePatterns: editable.architecturePatterns,
    riskConsiderations: editable.riskConsiderations,
    successCriteria: editable.successCriteria,
    implementationGuidance: editable.implementationGuidance,
  };
}
