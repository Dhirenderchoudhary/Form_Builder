import { and, eq, count, sql, gte, lte, desc } from "drizzle-orm";
import db from "@repo/database";
import {
  formAnalyticsTable,
  type InsertFormAnalytics,
} from "@repo/database/models/analytics";
import { formResponsesTable } from "@repo/database/models/response";
import { createHash } from "crypto";
import { BaseService } from "../base";

export interface FormAnalyticsSummary {
  formId: string;
  totalViews: number;
  uniqueViews: number;
  totalStarts: number;
  totalSubmissions: number;
  completionRate: number;
  avgCompletionTimeMs: number | null;
  topCountries: Array<{ country: string; count: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  dailySubmissions: Array<{ date: string; count: number }>;
}

export class AnalyticsService extends BaseService {

  async trackEvent(data: Omit<InsertFormAnalytics, "id" | "occurredAt">): Promise<void> {

    const sessionHash = data.ipAddress
      ? createHash("sha256").update(data.ipAddress + data.formId).digest("hex")
      : undefined;

    await db.insert(formAnalyticsTable).values({
      ...data,
      sessionHash,
    });
  }

  async getFormAnalytics(
    formId: string,
    opts: { from?: Date; to?: Date } = {},
  ): Promise<FormAnalyticsSummary> {
    const timeFilter = and(
      eq(formAnalyticsTable.formId, formId),
      opts.from ? gte(formAnalyticsTable.occurredAt, opts.from) : undefined,
      opts.to ? lte(formAnalyticsTable.occurredAt, opts.to) : undefined,
    );

    const eventCounts = await db
      .select({
        event: formAnalyticsTable.event,
        total: count(),
      })
      .from(formAnalyticsTable)
      .where(timeFilter)
      .groupBy(formAnalyticsTable.event);

    const byEvent = Object.fromEntries(eventCounts.map((r) => [r.event, Number(r.total)]));

    const uniqueViewsResult = await db
      .select({
        uniqueViews: sql<number>`COUNT(DISTINCT ${formAnalyticsTable.sessionHash})`,
      })
      .from(formAnalyticsTable)
      .where(and(timeFilter, eq(formAnalyticsTable.event, "view")));
    const uniqueViews = uniqueViewsResult[0]?.uniqueViews ?? 0;

    const avgMsResult = await db
      .select({
        avgMs: sql<number | null>`AVG(${formResponsesTable.completionTimeMs})`,
      })
      .from(formResponsesTable)
      .where(
        and(
          eq(formResponsesTable.formId, formId),
          opts.from ? gte(formResponsesTable.submittedAt, opts.from) : undefined,
          opts.to ? lte(formResponsesTable.submittedAt, opts.to) : undefined,
        ),
      );
    const avgMs = avgMsResult[0]?.avgMs ?? null;

    const topCountries = await db
      .select({
        country: formAnalyticsTable.country,
        count: count(),
      })
      .from(formAnalyticsTable)
      .where(and(timeFilter, eq(formAnalyticsTable.event, "view")))
      .groupBy(formAnalyticsTable.country)
      .orderBy(desc(count()))
      .limit(10);

    const topReferrers = await db
      .select({
        referrer: formAnalyticsTable.referrer,
        count: count(),
      })
      .from(formAnalyticsTable)
      .where(
        and(
          timeFilter,
          eq(formAnalyticsTable.event, "view"),
          sql`${formAnalyticsTable.referrer} IS NOT NULL`,
        ),
      )
      .groupBy(formAnalyticsTable.referrer)
      .orderBy(desc(count()))
      .limit(10);

    const dailySubmissions = await db
      .select({
        date: sql<string>`${formAnalyticsTable.occurredAt}::date`,
        count: count(),
      })
      .from(formAnalyticsTable)
      .where(and(timeFilter, eq(formAnalyticsTable.event, "submit")))
      .groupBy(sql`${formAnalyticsTable.occurredAt}::date`)
      .orderBy(sql`${formAnalyticsTable.occurredAt}::date`);

    const totalViews = byEvent["view"] ?? 0;
    const totalStarts = byEvent["start"] ?? 0;
    const totalSubmissions = byEvent["submit"] ?? 0;
    const completionRate =
      totalViews > 0 ? Math.round((totalSubmissions / totalViews) * 100) : 0;

    return {
      formId,
      totalViews,
      uniqueViews: Number(uniqueViews ?? 0),
      totalStarts,
      totalSubmissions,
      completionRate,
      avgCompletionTimeMs: avgMs ? Math.round(Number(avgMs)) : null,
      topCountries: topCountries
        .filter((r) => r.country !== null)
        .map((r) => ({ country: r.country!, count: Number(r.count) })),
      topReferrers: topReferrers
        .filter((r) => r.referrer !== null)
        .map((r) => ({ referrer: r.referrer!, count: Number(r.count) })),
      dailySubmissions: dailySubmissions.map((r) => ({
        date: r.date,
        count: Number(r.count),
      })),
    };
  }

  async getFieldAnalytics(formId: string) {
    const { formFieldsTable } = require("@repo/database/models/form");
    const { responseAnswersTable, formResponsesTable } = require("@repo/database/models/response");

    // Fetch all choice-based fields for this form
    const fields = await db
      .select({ id: formFieldsTable.id, label: formFieldsTable.label, type: formFieldsTable.type })
      .from(formFieldsTable)
      .where(
        and(
          eq(formFieldsTable.formId, formId),
          sql`${formFieldsTable.type} IN ('select', 'radio', 'checkbox')`
        )
      );

    if (fields.length === 0) return [];

    const fieldIds = fields.map((f) => f.id);

    // Fetch all answers for these fields
    const answers = await db
      .select({
        fieldId: responseAnswersTable.fieldId,
        value: responseAnswersTable.value,
      })
      .from(responseAnswersTable)
      .innerJoin(formResponsesTable, eq(responseAnswersTable.responseId, formResponsesTable.id))
      .where(
        and(
          eq(formResponsesTable.formId, formId),
          sql`${responseAnswersTable.fieldId} = ANY(ARRAY[${sql.join(
            fieldIds.map((id) => sql`${id}::uuid`),
            sql`, `
          )}])`
        )
      );

    // Aggregate answers
    const distribution: Record<string, { label: string; type: string; choices: Record<string, number> }> = {};
    for (const field of fields) {
      distribution[field.id] = { label: field.label, type: field.type, choices: {} };
    }

    for (const answer of answers) {
      const fieldData = distribution[answer.fieldId];
      if (!fieldData || !answer.value) continue;

      if (Array.isArray(answer.value)) {
        for (const v of answer.value) {
          const valStr = String(v);
          fieldData.choices[valStr] = (fieldData.choices[valStr] || 0) + 1;
        }
      } else {
        const valStr = String(answer.value);
        fieldData.choices[valStr] = (fieldData.choices[valStr] || 0) + 1;
      }
    }

    // Convert into a friendly array format for charting
    return Object.values(distribution).map((d) => ({
      label: d.label,
      type: d.type,
      data: Object.entries(d.choices).map(([choice, count]) => ({ choice, count })).sort((a, b) => b.count - a.count),
    }));
  }
}

export default AnalyticsService;
