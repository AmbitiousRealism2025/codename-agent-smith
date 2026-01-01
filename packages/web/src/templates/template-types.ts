import type { ZodSchema } from 'zod';
import type { AgentTemplate, ToolConfiguration, AgentCapabilities } from '@/types/agent';

export type { AgentTemplate, ToolConfiguration, AgentCapabilities };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const schemaDescriptionCache = new WeakMap<ZodSchema<any>, Record<string, unknown>>();

export type TemplateCategory =
  | 'data-processing'
  | 'creative'
  | 'analytical'
  | 'automation'
  | 'development';

export interface ToolSchemaDefinition {
  name: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  zodSchema: ZodSchema<any>;
  requiredPermissions: string[];
}

export function convertToolSchemaToConfig(
  name: string,
  description: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  zodSchema: ZodSchema<any>,
  requiredPermissions: string[]
): ToolConfiguration {
  const parameters = zodSchemaToJsonSchema(zodSchema);

  return {
    name,
    description,
    parameters,
    requiredPermissions,
  };
}

interface ZodFieldAnalysis {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseSchema: ZodSchema<any>;
  isOptional: boolean;
  isNullable: boolean;
  hasDefault: boolean;
  defaultValue?: unknown;
  description?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDefaultValue(def: any): unknown {
  if (typeof def?.defaultValue === 'function') {
    try {
      return def.defaultValue();
    } catch {
      return undefined;
    }
  }
  return def?.defaultValue;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function analyzeZodField(field: ZodSchema<any>): ZodFieldAnalysis {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: ZodSchema<any> = field;
  let isOptional = false;
  let isNullable = false;
  let hasDefault = false;
  let defaultValue: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let description: string | undefined = (field as any).description ?? (field._def as any)?.description;

  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const def = current._def as any;
    if (def?.description && !description) {
      description = def.description;
    }

    switch (def?.typeName) {
      case 'ZodOptional':
        isOptional = true;
        current = def.innerType;
        continue;
      case 'ZodDefault':
        isOptional = true;
        hasDefault = true;
        defaultValue = resolveDefaultValue(def);
        current = def.innerType;
        continue;
      case 'ZodNullable':
        isOptional = true;
        isNullable = true;
        current = def.innerType;
        continue;
      default:
        break;
    }

    break;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseDef = current._def as any;
  if (baseDef?.description && !description) {
    description = baseDef.description;
  }

  return {
    baseSchema: current,
    isOptional,
    isNullable,
    hasDefault,
    defaultValue,
    description,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function zodSchemaToJsonSchema(schema: ZodSchema<any>): Record<string, unknown> {
  const cached = schemaDescriptionCache.get(schema);
  if (cached) {
    return cached;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const def = schema._def as any;

  if (def?.typeName === 'ZodObject') {
    const shape = typeof def.shape === 'function' ? def.shape() : def.shape;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    const jsonSchema: Record<string, unknown> = {
      type: 'object',
      properties,
    };

    if (def?.description) {
      jsonSchema.description = def.description;
    }

    schemaDescriptionCache.set(schema, jsonSchema);

    for (const [key, value] of Object.entries(shape)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fieldSchema = value as ZodSchema<any>;
      const analysis = analyzeZodField(fieldSchema);
      properties[key] = describeZodField(fieldSchema, analysis);

      if (!analysis.isOptional) {
        required.push(key);
      }
    }

    jsonSchema.required = required;

    return jsonSchema;
  }

  const fallback = { type: 'object', properties: {} };
  schemaDescriptionCache.set(schema, fallback);
  return fallback;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function describeZodField(field: ZodSchema<any>, analysisOverride?: ZodFieldAnalysis): Record<string, unknown> {
  const cached = schemaDescriptionCache.get(field);
  if (cached) {
    return cached;
  }

  const analysis = analysisOverride ?? analyzeZodField(field);
  const baseDescription = { ...describeBaseSchema(analysis.baseSchema) };

  if (analysis.description) {
    baseDescription.description = analysis.description;
  }

  if (analysis.hasDefault) {
    baseDescription.default = analysis.defaultValue;
  }

  if (analysis.isNullable) {
    const typeValue = baseDescription.type;
    if (Array.isArray(typeValue)) {
      if (!typeValue.includes('null')) {
        baseDescription.type = [...typeValue, 'null'];
      }
    } else if (typeof typeValue !== 'undefined') {
      baseDescription.type = [typeValue, 'null'];
    } else {
      baseDescription.type = ['null'];
    }
  }

  if (analysis.isOptional) {
    baseDescription.optional = true;
  }

  schemaDescriptionCache.set(field, baseDescription);
  return baseDescription;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function describeBaseSchema(schema: ZodSchema<any>): Record<string, unknown> {
  const cached = schemaDescriptionCache.get(schema);
  if (cached) {
    return cached;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const def = schema._def as any;

  if (def?.typeName === 'ZodObject') {
    return zodSchemaToJsonSchema(schema);
  }

  let description: Record<string, unknown>;

  switch (def?.typeName) {
    case 'ZodString': {
      const stringDescription: Record<string, unknown> = { type: 'string' };
      if (Array.isArray(def.checks)) {
        for (const check of def.checks) {
          switch (check.kind) {
            case 'min':
              stringDescription.minLength = check.value;
              break;
            case 'max':
              stringDescription.maxLength = check.value;
              break;
            case 'length':
              stringDescription.minLength = check.value;
              stringDescription.maxLength = check.value;
              break;
            case 'email':
              stringDescription.format = 'email';
              break;
            case 'url':
              stringDescription.format = 'uri';
              break;
            case 'uuid':
              stringDescription.format = 'uuid';
              break;
            case 'cuid':
              stringDescription.format = 'cuid';
              break;
            case 'regex':
              stringDescription.pattern = check.regex?.source;
              break;
          }
        }
      }
      description = stringDescription;
      break;
    }
    case 'ZodNumber': {
      const numberDescription: Record<string, unknown> = { type: 'number' };
      if (Array.isArray(def.checks)) {
        for (const check of def.checks) {
          switch (check.kind) {
            case 'min':
              if (check.inclusive === false) {
                numberDescription.exclusiveMinimum = check.value;
              } else {
                numberDescription.minimum = check.value;
              }
              break;
            case 'max':
              if (check.inclusive === false) {
                numberDescription.exclusiveMaximum = check.value;
              } else {
                numberDescription.maximum = check.value;
              }
              break;
            case 'int':
              numberDescription.type = 'integer';
              break;
          }
        }
      }
      description = numberDescription;
      break;
    }
    case 'ZodBoolean':
      description = { type: 'boolean' };
      break;
    case 'ZodArray': {
      const arrayDescription: Record<string, unknown> = {
        type: 'array',
        items: describeZodField(def.type),
      };

      if (def?.minLength?.value !== undefined) {
        arrayDescription.minItems = def.minLength.value;
      }
      if (def?.maxLength?.value !== undefined) {
        arrayDescription.maxItems = def.maxLength.value;
      }

      description = arrayDescription;
      break;
    }
    case 'ZodEnum': {
      description = {
        type: 'string',
        enum: def.values,
        enumDescriptions: def.values?.map((value: unknown) => String(value)),
      };
      break;
    }
    case 'ZodLiteral': {
      const literalValue = def.value;
      description = {
        const: literalValue,
        type: typeof literalValue,
      };
      break;
    }
    case 'ZodRecord': {
      description = {
        type: 'object',
        additionalProperties: describeZodField(def.valueType ?? def.type),
      };
      break;
    }
    default:
      description = { type: 'any' };
  }

  if (def?.description) {
    description = { ...description, description: def.description };
  }

  schemaDescriptionCache.set(schema, description);
  return description;
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  capabilityTags: string[];
  idealFor: string[];
  systemPrompt: string;
  requiredDependencies: string[];
  recommendedIntegrations: string[];
}

export function createTemplate(
  metadata: TemplateMetadata,
  toolDefinitions: ToolSchemaDefinition[]
): AgentTemplate {
  const defaultTools = toolDefinitions.map(tool =>
    convertToolSchemaToConfig(
      tool.name,
      tool.description,
      tool.zodSchema,
      tool.requiredPermissions
    )
  );

  return {
    id: metadata.id,
    name: metadata.name,
    description: metadata.description,
    capabilityTags: metadata.capabilityTags,
    idealFor: metadata.idealFor,
    systemPrompt: metadata.systemPrompt,
    defaultTools,
    requiredDependencies: metadata.requiredDependencies,
    recommendedIntegrations: metadata.recommendedIntegrations,
  };
}

export interface DocumentSection {
  title: string;
  description: string;
  subsections: string[];
  contentGuidance: string[];
  examples?: string[];
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  capabilityTags: string[];
  idealFor: string[];
  documentSections: Record<string, DocumentSection>;
  planningChecklist: string[];
  architecturePatterns: string[];
  riskConsiderations: string[];
  successCriteria: string[];
  implementationGuidance: string[];
}

export interface DocumentTemplateMetadata {
  id: string;
  name: string;
  description: string;
  capabilityTags: string[];
  idealFor: string[];
  documentSections: Record<string, DocumentSection>;
  planningChecklist: string[];
  architecturePatterns: string[];
  riskConsiderations: string[];
  successCriteria: string[];
  implementationGuidance: string[];
}

const REQUIRED_SECTIONS = [
  'overview',
  'architecture',
  'implementation',
  'testing',
  'deployment',
  'monitoring',
  'troubleshooting',
  'maintenance'
];

export function createDocumentTemplate(metadata: DocumentTemplateMetadata): DocumentTemplate {
  const providedSections = Object.keys(metadata.documentSections);
  const missingSections = REQUIRED_SECTIONS.filter(key => !providedSections.includes(key));

  if (missingSections.length > 0) {
    throw new Error(
      `Document template "${metadata.id}" is missing required sections: ${missingSections.join(', ')}`
    );
  }

  return {
    id: metadata.id,
    name: metadata.name,
    description: metadata.description,
    capabilityTags: metadata.capabilityTags,
    idealFor: metadata.idealFor,
    documentSections: metadata.documentSections,
    planningChecklist: metadata.planningChecklist,
    architecturePatterns: metadata.architecturePatterns,
    riskConsiderations: metadata.riskConsiderations,
    successCriteria: metadata.successCriteria,
    implementationGuidance: metadata.implementationGuidance,
  };
}
