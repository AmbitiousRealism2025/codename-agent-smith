export { dataAnalystTemplate } from './data-analyst';
export { contentCreatorTemplate } from './content-creator';
export { codeAssistantTemplate } from './code-assistant';
export { researchAgentTemplate } from './research-agent';
export { automationAgentTemplate } from './automation-agent';

export { dataAnalystDocumentTemplate } from './data-analyst';
export { contentCreatorDocumentTemplate } from './content-creator';
export { codeAssistantDocumentTemplate } from './code-assistant';
export { researchAgentDocumentTemplate } from './research-agent';
export { automationAgentDocumentTemplate } from './automation-agent';

export type {
  AgentTemplate,
  ToolConfiguration,
  AgentCapabilities,
  TemplateCategory,
  ToolSchemaDefinition,
  DocumentTemplate,
  DocumentSection,
} from './template-types';

export { createTemplate, convertToolSchemaToConfig, createDocumentTemplate } from './template-types';

import { dataAnalystTemplate } from './data-analyst';
import { contentCreatorTemplate } from './content-creator';
import { codeAssistantTemplate } from './code-assistant';
import { researchAgentTemplate } from './research-agent';
import { automationAgentTemplate } from './automation-agent';

import { dataAnalystDocumentTemplate } from './data-analyst';
import { contentCreatorDocumentTemplate } from './content-creator';
import { codeAssistantDocumentTemplate } from './code-assistant';
import { researchAgentDocumentTemplate } from './research-agent';
import { automationAgentDocumentTemplate } from './automation-agent';

import type { AgentTemplate } from './template-types';

export const ALL_TEMPLATES = [
  dataAnalystTemplate,
  contentCreatorTemplate,
  codeAssistantTemplate,
  researchAgentTemplate,
  automationAgentTemplate,
] as const;

export const ALL_DOCUMENT_TEMPLATES = [
  dataAnalystDocumentTemplate,
  contentCreatorDocumentTemplate,
  codeAssistantDocumentTemplate,
  researchAgentDocumentTemplate,
  automationAgentDocumentTemplate,
] as const;

export const TEMPLATE_COUNT = ALL_TEMPLATES.length;

export const TEMPLATE_CATEGORIES = [
  'data-processing',
  'creative',
  'development',
  'analytical',
  'automation',
] as const;

export function getTemplateById(id: string): AgentTemplate | undefined {
  return ALL_TEMPLATES.find((template) => template.id === id);
}

export function getDocumentTemplateById(id: string) {
  return ALL_DOCUMENT_TEMPLATES.find((template) => template.id === id);
}

export function getTemplatesByCapability(tag: string) {
  return ALL_TEMPLATES.filter((template) => template.capabilityTags.includes(tag));
}

export function getDocumentTemplatesByCapability(tag: string) {
  return ALL_DOCUMENT_TEMPLATES.filter((template) => template.capabilityTags.includes(tag));
}

export function getAllCapabilityTags(): string[] {
  const tags = new Set<string>();
  ALL_TEMPLATES.forEach((template) => {
    template.capabilityTags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

export interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  toolCount: number;
  capabilityTags: string[];
}

export interface DocumentTemplateSummary {
  id: string;
  name: string;
  description: string;
  sectionCount: number;
  capabilityTags: string[];
}

export function getTemplateSummaries(): TemplateSummary[] {
  return ALL_TEMPLATES.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    toolCount: template.defaultTools.length,
    capabilityTags: template.capabilityTags,
  }));
}

export function getDocumentTemplateSummaries(): DocumentTemplateSummary[] {
  return ALL_DOCUMENT_TEMPLATES.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    sectionCount: Object.keys(template.documentSections).length,
    capabilityTags: template.capabilityTags,
  }));
}

export function isValidTemplateId(id: string): boolean {
  return ALL_TEMPLATES.some((template) => template.id === id);
}

export function isValidDocumentTemplateId(id: string): boolean {
  return ALL_DOCUMENT_TEMPLATES.some(t => t.id === id);
}
