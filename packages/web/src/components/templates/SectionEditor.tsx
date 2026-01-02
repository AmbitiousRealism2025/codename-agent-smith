import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Plus, Trash2, GripVertical } from 'lucide-react';
import type { DocumentSection } from '@/templates';

interface SectionEditorProps {
  sectionKey: string;
  section: DocumentSection;
  onChange: (key: string, section: DocumentSection) => void;
}

export function SectionEditor({ sectionKey, section, onChange }: SectionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateSection = (updates: Partial<DocumentSection>) => {
    onChange(sectionKey, { ...section, ...updates });
  };

  const updateArrayItem = (
    field: 'subsections' | 'contentGuidance' | 'examples',
    index: number,
    value: string
  ) => {
    const current = section[field] || [];
    const updated = [...current];
    updated[index] = value;
    updateSection({ [field]: updated });
  };

  const addArrayItem = (field: 'subsections' | 'contentGuidance' | 'examples') => {
    const current = section[field] || [];
    updateSection({ [field]: [...current, ''] });
  };

  const removeArrayItem = (
    field: 'subsections' | 'contentGuidance' | 'examples',
    index: number
  ) => {
    const current = section[field] || [];
    updateSection({ [field]: current.filter((_, i) => i !== index) });
  };

  const renderArrayEditor = (
    label: string,
    field: 'subsections' | 'contentGuidance' | 'examples',
    placeholder: string
  ) => {
    const items = section[field] || [];
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{label}</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => addArrayItem(field)}
            className="h-7 px-2"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-2 group">
              <GripVertical className="w-4 h-4 mt-2.5 text-muted-foreground opacity-50" />
              <Textarea
                value={item}
                onChange={(e) => updateArrayItem(field, index, e.target.value)}
                placeholder={placeholder}
                className="min-h-[60px] flex-1"
                rows={2}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeArrayItem(field, index)}
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground italic py-2">
              No items yet. Click "Add" to create one.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-l-4 border-l-primary/30">
      <CardHeader 
        className="cursor-pointer py-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium capitalize">
            {sectionKey.replace(/-/g, ' ')}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
        {!isExpanded && section.description && (
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
            {section.description}
          </p>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-2">
            <Label htmlFor={`${sectionKey}-title`}>Section Title</Label>
            <Input
              id={`${sectionKey}-title`}
              value={section.title}
              onChange={(e) => updateSection({ title: e.target.value })}
              placeholder="Enter section title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${sectionKey}-description`}>Description</Label>
            <Textarea
              id={`${sectionKey}-description`}
              value={section.description}
              onChange={(e) => updateSection({ description: e.target.value })}
              placeholder="Describe what this section covers"
              rows={3}
            />
          </div>

          {renderArrayEditor(
            'Subsections',
            'subsections',
            'Enter subsection name'
          )}

          {renderArrayEditor(
            'Content Guidance',
            'contentGuidance',
            'Add guidance for generating this section'
          )}

          {renderArrayEditor(
            'Examples',
            'examples',
            'Add an example snippet or reference'
          )}
        </CardContent>
      )}
    </Card>
  );
}
