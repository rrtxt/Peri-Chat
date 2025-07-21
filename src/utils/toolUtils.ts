import { StructuredTool } from "langchain/tools";
import { ZodTypeAny } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

type ToolSchema = {
  name: string;
  description: string;
  parameters: Record<string, any>; // JSON schema
};

export function generateToolSchema(tool: StructuredTool): ToolSchema {
  // Try multiple ways to get the Zod schema
  const zodSchema =
    tool.schema || (tool as any)._zodSchema || (tool as any).zodSchema;

  if (!zodSchema) {
    console.warn(
      `Tool "${tool.name}" does not have a schema defined, returning empty schema.`
    );
    return {
      name: tool.name,
      description: tool.description,
      parameters: {},
    };
  }

  try {
    return {
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(zodSchema),
    };
  } catch (error) {
    console.error(`Error converting schema for tool "${tool.name}":`, error);
    return {
      name: tool.name,
      description: tool.description,
      parameters: {},
    };
  }
}
