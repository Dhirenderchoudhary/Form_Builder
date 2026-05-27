import { and, eq, desc, count, sql, gte, lte } from "drizzle-orm";
import db from "@repo/database";
import {
  formResponsesTable,
  responseAnswersTable,
  type InsertFormResponse,
  type InsertResponseAnswer,
  type SelectFormResponse,
  type SelectResponseAnswer,
  type AnswerValue,
} from "@repo/database/models/response";
import {
  formsTable,
  formFieldsTable,
  type SelectFormField,
} from "@repo/database/models/form";
import { BaseService } from "../base";

export type SubmitFormInput = {
  formId: string;
  respondentEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  completionTimeMs?: number;
  metadata?: InsertFormResponse["metadata"];
  answers: Array<{ fieldId: string; value: AnswerValue }>;
};

export type ResponseWithAnswers = SelectFormResponse & {
  answers: SelectResponseAnswer[];
};

export type PaginatedResponses = {
  items: ResponseWithAnswers[];
  total: number;
  page: number;
  pageSize: number;
};

export class ResponseService extends BaseService {

  async submitResponse(input: SubmitFormInput): Promise<SelectFormResponse> {
    const { formId, answers, ...responseData } = input;

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(formFieldsTable.order);

    this.validateAnswers(fields, answers);

    const [response] = await db
      .insert(formResponsesTable)
      .values({ formId, ...responseData })
      .returning();

    if (!response) this.internal("Failed to save response");

    if (answers.length > 0) {
      const answerRows: InsertResponseAnswer[] = answers.map((a) => ({
        responseId: response.id,
        fieldId: a.fieldId,
        value: a.value,
      }));

      await db.insert(responseAnswersTable).values(answerRows);
    }

    return response;
  }

  async getFormResponses(
    formId: string,
    opts: { page?: number; pageSize?: number; from?: Date; to?: Date } = {},
  ): Promise<PaginatedResponses> {
    const { page = 1, pageSize = 20, from, to } = opts;
    const offset = (page - 1) * pageSize;

    const conditions = and(
      eq(formResponsesTable.formId, formId),
      from ? gte(formResponsesTable.submittedAt, from) : undefined,
      to ? lte(formResponsesTable.submittedAt, to) : undefined,
    );

    const totalResult = await db
      .select({ total: count() })
      .from(formResponsesTable)
      .where(conditions);
    const total = totalResult[0]?.total ?? 0;

    const responses = await db
      .select()
      .from(formResponsesTable)
      .where(conditions)
      .orderBy(desc(formResponsesTable.submittedAt))
      .limit(pageSize)
      .offset(offset);

    const responseIds = responses.map((r) => r.id);
    const answers =
      responseIds.length > 0
        ? await db
            .select()
            .from(responseAnswersTable)
            .where(
              sql`${responseAnswersTable.responseId} = ANY(ARRAY[${sql.join(
                responseIds.map((id) => sql`${id}::uuid`),
                sql`, `,
              )}])`,
            )
        : [];

    const answersByResponseId = answers.reduce<Record<string, SelectResponseAnswer[]>>(
      (acc, a) => {
        if (!acc[a.responseId]) acc[a.responseId] = [];
        acc[a.responseId]!.push(a);
        return acc;
      },
      {},
    );

    return {
      items: responses.map((r) => ({
        ...r,
        answers: answersByResponseId[r.id] ?? [],
      })),
      total: Number(total),
      page,
      pageSize,
    };
  }

  async getResponseById(responseId: string): Promise<ResponseWithAnswers> {
    const [response] = await db
      .select()
      .from(formResponsesTable)
      .where(eq(formResponsesTable.id, responseId));

    if (!response) this.notFound("Response");

    const answers = await db
      .select()
      .from(responseAnswersTable)
      .where(eq(responseAnswersTable.responseId, responseId));

    return { ...response, answers };
  }

  async deleteResponse(responseId: string): Promise<void> {
    await db.delete(formResponsesTable).where(eq(formResponsesTable.id, responseId));
  }

  async hasIpAlreadySubmitted(formId: string, ipAddress: string): Promise<boolean> {
    const [existing] = await db
      .select({ id: formResponsesTable.id })
      .from(formResponsesTable)
      .where(
        and(
          eq(formResponsesTable.formId, formId),
          eq(formResponsesTable.ipAddress, ipAddress),
        ),
      );
    return !!existing;
  }

  private validateAnswers(
    fields: SelectFormField[],
    answers: Array<{ fieldId: string; value: AnswerValue }>,
  ): void {
    const answerMap = new Map(answers.map((a) => [a.fieldId, a.value]));

    for (const field of fields) {
      const value = answerMap.get(field.id);
      const isEmpty = value === null || value === undefined || value === "" ||
        (Array.isArray(value) && value.length === 0);

      if (field.required && isEmpty) {
        this.badRequest(`Field "${field.label}" is required`);
      }

      if (!isEmpty && value !== null && value !== undefined) {
        const v = field.validations;

        if (typeof value === "string") {
          if (v.minLength && value.length < v.minLength) {
            this.badRequest(
              `"${field.label}" must be at least ${v.minLength} characters`,
            );
          }
          if (v.maxLength && value.length > v.maxLength) {
            this.badRequest(
              `"${field.label}" must be at most ${v.maxLength} characters`,
            );
          }
          if (v.pattern) {
            const regex = new RegExp(v.pattern);
            if (!regex.test(value)) {
              this.badRequest(
                v.patternMessage ?? `"${field.label}" has an invalid format`,
              );
            }
          }
        }

        if (typeof value === "number") {
          if (v.min !== undefined && value < v.min) {
            this.badRequest(`"${field.label}" must be at least ${v.min}`);
          }
          if (v.max !== undefined && value > v.max) {
            this.badRequest(`"${field.label}" must be at most ${v.max}`);
          }
        }
      }
    }
  }
}

export default ResponseService;
