import { z } from "zod";
import { type SelectFormField } from "@repo/database/models/form";
import { type AnswerValue } from "@repo/database/models/response";

export function buildResponseValidator(fields: SelectFormField[]) {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny;
    const v = field.validations;

    if (field.type === "number" || field.type === "rating" || field.type === "scale") {
      let numSchema = z.number({
        message: `"${field.label}" must be a number`,
      });
      if (v?.min !== undefined) numSchema = numSchema.min(v.min, `"${field.label}" must be at least ${v.min}`);
      if (v?.max !== undefined) numSchema = numSchema.max(v.max, `"${field.label}" must be at most ${v.max}`);
      fieldSchema = numSchema;
    } else if (field.type === "multi_select") {
      fieldSchema = z.array(z.string(), {
        message: `"${field.label}" must be a list of choices`,
      });
    } else if (field.type === "checkbox") {
      fieldSchema = z.boolean({
        message: `"${field.label}" must be a boolean`,
      });
    } else {
      let strSchema = z.string({
        message: `"${field.label}" must be a string`,
      });
      if (v?.minLength !== undefined) strSchema = strSchema.min(v.minLength, `"${field.label}" must be at least ${v.minLength} characters`);
      if (v?.maxLength !== undefined) strSchema = strSchema.max(v.maxLength, `"${field.label}" must be at most ${v.maxLength} characters`);
      if (v?.pattern) {
        strSchema = strSchema.regex(new RegExp(v.pattern), v.patternMessage ?? `"${field.label}" has an invalid format`);
      }
      
      // If the field is an email field type, add email validation
      if (field.type === "email") {
        strSchema = strSchema.email(`"${field.label}" must be a valid email address`);
      }
      // If the field is a URL field type, add URL validation
      if (field.type === "url") {
        strSchema = strSchema.url(`"${field.label}" must be a valid URL`);
      }
      
      fieldSchema = strSchema;
    }

    if (!field.required) {
      if (field.type === "checkbox" || field.type === "multi_select") {
        fieldSchema = fieldSchema.optional();
      } else {
        fieldSchema = fieldSchema.optional().or(z.literal(""));
      }
    } else {
      if (field.type === "multi_select") {
        fieldSchema = (fieldSchema as z.ZodArray<any>).min(1, `"${field.label}" is required`);
      } else if (
        field.type !== "number" && 
        field.type !== "rating" && 
        field.type !== "scale" && 
        field.type !== "checkbox"
      ) {
        fieldSchema = (fieldSchema as z.ZodString).min(1, `"${field.label}" is required`);
      }
    }

    schemaShape[field.id] = fieldSchema;
  }

  return z.object(schemaShape).strict();
}
