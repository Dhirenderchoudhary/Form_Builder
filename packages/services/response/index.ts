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

    const response = await db.transaction(async (tx) => {
      // 1. Lock the form to serialize concurrent submissions
      const [form] = await tx
        .select()
        .from(formsTable)
        .where(eq(formsTable.id, formId))
        .for("update");
        
      if (!form) this.notFound("Form");

      // 2. Safely check maxResponses within the locked transaction
      if (form.maxResponses !== null) {
        const countResult = await tx
          .select({ total: count() })
          .from(formResponsesTable)
          .where(eq(formResponsesTable.formId, form.id));
        const total = countResult[0]?.total ?? 0;
        if (Number(total) >= form.maxResponses) {
          throw { code: "FORM_FULL", message: "This form has reached its maximum number of responses." };
        }
      }

      // 3. Safely check oneResponsePerIp within the locked transaction
      if (form.settings?.oneResponsePerIp && responseData.ipAddress && responseData.ipAddress !== "unknown_ip") {
        const [existing] = await tx
          .select({ id: formResponsesTable.id })
          .from(formResponsesTable)
          .where(
            and(
              eq(formResponsesTable.formId, formId),
              eq(formResponsesTable.ipAddress, responseData.ipAddress),
            ),
          );
        if (existing) {
          throw { code: "FORBIDDEN", message: "You have already submitted a response to this form." };
        }
      }

      // 4. Insert response
      const [insertedResponse] = await tx
        .insert(formResponsesTable)
        .values({ formId, ...responseData })
        .returning();

      if (!insertedResponse) this.internal("Failed to save response");

      // 5. Increment denormalized response count
      await tx
        .update(formsTable)
        .set({ responseCount: sql`${formsTable.responseCount} + 1` })
        .where(eq(formsTable.id, formId));

      // 6. Insert answers
      if (answers.length > 0) {
        const answerRows: InsertResponseAnswer[] = answers.map((a) => ({
          responseId: insertedResponse.id,
          fieldId: a.fieldId,
          value: a.value,
        }));

        await tx.insert(responseAnswersTable).values(answerRows);
      }

      return insertedResponse;
    });

    try {
      const { usersTable } = await import("@repo/database/models/user.js");
      const { EmailService } = await import("../email/index.js");
      
      const [formInfo] = await db
        .select({
          form: formsTable,
          owner: usersTable,
        })
        .from(formsTable)
        .innerJoin(usersTable, eq(formsTable.userId, usersTable.id))
        .where(eq(formsTable.id, formId));

      if (formInfo && process.env.RESEND_API_KEY) {
        const emailService = new EmailService({
          apiKey: process.env.RESEND_API_KEY,
          fromAddress: process.env.EMAIL_FROM ?? "noreply@konoha-forms.com",
          appName: process.env.APP_NAME ?? "Konoha Forms",
        });

        // Notify creator asynchronously (don't block submission)
        void emailService.sendNewResponseNotification({
          creatorEmail: formInfo.owner.email,
          creatorName: formInfo.owner.fullName,
          formTitle: formInfo.form.title,
          formSlug: formInfo.form.slug,
          responseId: response.id,
          respondentEmail: responseData.respondentEmail,
          submittedAt: response.submittedAt ?? new Date(),
          dashboardUrl: process.env.WEB_URL ?? "http://localhost:3000/dashboard",
        });

        // Send confirmation receipt to respondent
        if (responseData.respondentEmail) {
          void emailService.sendRespondentConfirmation({
            respondentEmail: responseData.respondentEmail,
            formTitle: formInfo.form.title,
            successMessage: formInfo.form.successMessage ?? "Thank you for your response!",
            appName: process.env.APP_NAME ?? "Konoha Forms",
          });
        }
      }
    } catch (error) {
      console.error("Failed to trigger emails", error);
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
    
    // Build a payload object mapping fieldId -> value
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      payload[field.id] = answerMap.get(field.id);
    }

    const { buildResponseValidator } = require("./validation");
    const schema = buildResponseValidator(fields);

    const result = schema.safeParse(payload);
    
    if (!result.success) {
      // Pick the first error to throw as a bad request
      const firstError = result.error.errors[0];
      this.badRequest(firstError?.message ?? "Invalid response data");
    }
  }
}

export default ResponseService;
