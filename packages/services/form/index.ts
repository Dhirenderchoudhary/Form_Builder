import { and, eq, desc, count, sql } from "drizzle-orm";
import db from "@repo/database";
import {
  formsTable,
  formFieldsTable,
  type InsertForm,
  type SelectForm,
  type InsertFormField,
  type SelectFormField,
} from "@repo/database/models/form";
import { formResponsesTable } from "@repo/database/models/response";
import { usersTable } from "@repo/database/models/user";
import { BaseService } from "../base";
import { generateSlug } from "../utils/slug";

export type FormWithFields = SelectForm & {
  fields: SelectFormField[];
};

export type FormWithStats = SelectForm & {
  responseCount: number;
  theme?: { id: string; name: string; slug: string } | null;
  owner?: { id: string; fullName: string | null; email: string } | null;
};

export class FormService extends BaseService {

  async createForm(userId: string, data: Omit<InsertForm, "userId" | "slug">): Promise<SelectForm> {
    const slug = await this.generateUniqueSlug(data.title);

    const [form] = await db
      .insert(formsTable)
      .values({ ...data, userId, slug })
      .returning();

    if (!form) this.internal("Failed to create form");
    return form;
  }

  async getFormsByUser(userId: string): Promise<FormWithStats[]> {
    const rows = await db
      .select({
        form: formsTable,
        responseCount: count(formResponsesTable.id),
      })
      .from(formsTable)
      .leftJoin(formResponsesTable, eq(formResponsesTable.formId, formsTable.id))
      .where(and(eq(formsTable.userId, userId), sql`${formsTable.status} != 'archived'`))
      .groupBy(formsTable.id)
      .orderBy(desc(formsTable.updatedAt));

    return rows.map((r) => ({ ...r.form, responseCount: Number(r.responseCount) }));
  }

  async getFormById(formId: string, requestingUserId: string): Promise<FormWithFields> {
    const form = await this.findFormOrThrow(formId);
    this.assertOwner(form, requestingUserId);
    const fields = await this.getFieldsSorted(formId);
    return { ...form, fields };
  }

  async updateForm(
    formId: string,
    userId: string,
    data: Partial<Omit<InsertForm, "userId" | "id">>,
  ): Promise<SelectForm> {
    const form = await this.findFormOrThrow(formId);
    this.assertOwner(form, userId);

    let slug = form.slug;
    if (data.title && !data.slug) {
      slug = await this.generateUniqueSlug(data.title, formId);
    }

    const [updated] = await db
      .update(formsTable)
      .set({ ...data, slug })
      .where(eq(formsTable.id, formId))
      .returning();

    if (!updated) this.internal("Failed to update form");
    return updated;
  }

  async deleteForm(formId: string, userId: string): Promise<void> {
    const form = await this.findFormOrThrow(formId);
    this.assertOwner(form, userId);

    await db
      .update(formsTable)
      .set({ status: "archived" })
      .where(eq(formsTable.id, formId));
  }

  async setFormPassword(
    formId: string,
    userId: string,
    password: string | null,
  ): Promise<SelectForm> {
    const form = await this.findFormOrThrow(formId);
    this.assertOwner(form, userId);

    const { createHash } = await import("node:crypto");
    const passwordHash = password
      ? createHash("sha256").update(password).digest("hex")
      : undefined;

    const nextSettings = { ...(form.settings ?? {}) };
    if (passwordHash) {
      nextSettings.passwordHash = passwordHash;
    } else {
      delete nextSettings.passwordHash;
    }

    const [updated] = await db
      .update(formsTable)
      .set({ settings: nextSettings })
      .where(eq(formsTable.id, formId))
      .returning();

    if (!updated) this.internal("Failed to update password");
    return updated;
  }

  async publishForm(formId: string, userId: string): Promise<SelectForm> {
    const form = await this.findFormOrThrow(formId);
    this.assertOwner(form, userId);

    if (form.status === "published") return form;

    const fields = await this.getFieldsSorted(formId);
    if (fields.length === 0) this.badRequest("Cannot publish a form with no fields");

    const [updated] = await db
      .update(formsTable)
      .set({ status: "published", publishedAt: new Date() })
      .where(eq(formsTable.id, formId))
      .returning();

    if (!updated) this.internal("Failed to publish form");
    return updated;
  }

  async unpublishForm(formId: string, userId: string): Promise<SelectForm> {
    const form = await this.findFormOrThrow(formId);
    this.assertOwner(form, userId);

    const [updated] = await db
      .update(formsTable)
      .set({ status: "closed" })
      .where(eq(formsTable.id, formId))
      .returning();

    if (!updated) this.internal("Failed to unpublish form");
    return updated;
  }

  async getPublicFormBySlug(slug: string): Promise<FormWithFields> {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.slug, slug));

    if (!form) this.notFound("Form");
    if (form.status === "archived") this.notFound("Form");
    if (form.status === "draft") this.notFound("Form");
    if (form.status === "closed") {
      throw { code: "FORM_CLOSED", message: "This form is no longer accepting responses." };
    }
    if (form.closesAt && form.closesAt < new Date()) {
      throw { code: "FORM_EXPIRED", message: "This form has expired." };
    }
    if (form.maxResponses !== null) {
      const countResult = await db
        .select({ total: count() })
        .from(formResponsesTable)
        .where(eq(formResponsesTable.formId, form.id));
      const total = countResult[0]?.total ?? 0;

      if (Number(total) >= (form.maxResponses ?? 0)) {
        throw { code: "FORM_FULL", message: "This form has reached its maximum number of responses." };
      }
    }

    const fields = await this.getFieldsSorted(form.id);
    return { ...form, fields };
  }

  async listPublicForms(opts: { limit?: number; offset?: number; search?: string } = {}): Promise<{
    items: FormWithStats[];
    total: number;
  }> {
    const { limit = 20, offset = 0, search } = opts;

    const baseWhere = and(
      eq(formsTable.status, "published"),
      eq(formsTable.visibility, "public"),
      search ? sql`${formsTable.title} ILIKE ${`%${search}%`}` : undefined,
    );

    const totalResult = await db
      .select({ total: count() })
      .from(formsTable)
      .where(baseWhere);
    const total = totalResult[0]?.total ?? 0;

    const rows = await db
      .select({
        form: formsTable,
        responseCount: count(formResponsesTable.id),
        owner: {
          id: usersTable.id,
          fullName: usersTable.fullName,
          email: usersTable.email,
        },
      })
      .from(formsTable)
      .leftJoin(formResponsesTable, eq(formResponsesTable.formId, formsTable.id))
      .leftJoin(usersTable, eq(usersTable.id, formsTable.userId))
      .where(baseWhere)
      .groupBy(formsTable.id, usersTable.id)
      .orderBy(desc(formsTable.publishedAt))
      .limit(limit)
      .offset(offset);

    return {
      items: rows.map((r) => ({
        ...r.form,
        responseCount: Number(r.responseCount),
        owner: r.owner,
      })),
      total: Number(total),
    };
  }

  async addField(
    formId: string,
    userId: string,
    data: Omit<InsertFormField, "formId" | "order">,
  ): Promise<SelectFormField> {
    await this.assertOwnerByFormId(formId, userId);

    const maxOrderResult = await db
      .select({ maxOrder: sql<number>`COALESCE(MAX(${formFieldsTable.order}), -1)` })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId));
    const maxOrder = maxOrderResult[0]?.maxOrder ?? -1;

    const [field] = await db
      .insert(formFieldsTable)
      .values({ ...data, formId, order: (maxOrder) + 1 })
      .returning();

    if (!field) this.internal("Failed to add field");
    return field;
  }

  async updateField(
    fieldId: string,
    userId: string,
    data: Partial<Omit<InsertFormField, "formId" | "id">>,
  ): Promise<SelectFormField> {
    const field = await this.findFieldOrThrow(fieldId);
    await this.assertOwnerByFormId(field.formId, userId);

    const [updated] = await db
      .update(formFieldsTable)
      .set(data)
      .where(eq(formFieldsTable.id, fieldId))
      .returning();

    if (!updated) this.internal("Failed to update field");
    return updated;
  }

  async deleteField(fieldId: string, userId: string): Promise<void> {
    const field = await this.findFieldOrThrow(fieldId);
    await this.assertOwnerByFormId(field.formId, userId);
    await db.delete(formFieldsTable).where(eq(formFieldsTable.id, fieldId));

    await this.reorderFields(field.formId);
  }

  async reorderField(
    fieldId: string,
    userId: string,
    newOrder: number,
  ): Promise<SelectFormField[]> {
    const field = await this.findFieldOrThrow(fieldId);
    await this.assertOwnerByFormId(field.formId, userId);

    const fields = await this.getFieldsSorted(field.formId);
    const currentIdx = fields.findIndex((f) => f.id === fieldId);
    if (currentIdx === -1) this.notFound("Field");

    const reordered = [...fields];
    const [moved] = reordered.splice(currentIdx, 1);
    if (!moved) this.notFound("Field");
    reordered.splice(newOrder, 0, moved);

    await Promise.all(
      reordered.map((f, idx) =>
        db
          .update(formFieldsTable)
          .set({ order: idx })
          .where(eq(formFieldsTable.id, f.id)),
      ),
    );

    return this.getFieldsSorted(field.formId);
  }

  async findFormOrThrow(formId: string): Promise<SelectForm> {
    const [form] = await db.select().from(formsTable).where(eq(formsTable.id, formId));
    if (!form) this.notFound("Form");
    return form;
  }

  private async findFieldOrThrow(fieldId: string): Promise<SelectFormField> {
    const [field] = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.id, fieldId));
    if (!field) this.notFound("Field");
    return field;
  }

  private assertOwner(form: SelectForm, userId: string): void {
    if (form.userId !== userId) this.forbidden();
  }

  private async assertOwnerByFormId(formId: string, userId: string): Promise<SelectForm> {
    const form = await this.findFormOrThrow(formId);
    this.assertOwner(form, userId);
    return form;
  }

  async getFieldsSorted(formId: string): Promise<SelectFormField[]> {
    return db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(formFieldsTable.order);
  }

  private async generateUniqueSlug(title: string, excludeFormId?: string): Promise<string> {
    let base = generateSlug(title);
    let slug = base;
    let attempt = 0;

    while (true) {
      const conditions = excludeFormId
        ? and(eq(formsTable.slug, slug), sql`${formsTable.id} != ${excludeFormId}`)
        : eq(formsTable.slug, slug);

      const [existing] = await db.select({ id: formsTable.id }).from(formsTable).where(conditions);

      if (!existing) break;
      attempt++;
      slug = `${base}-${attempt}`;
    }

    return slug;
  }

  private async reorderFields(formId: string): Promise<void> {
    const fields = await this.getFieldsSorted(formId);
    await Promise.all(
      fields.map((f, idx) =>
        db.update(formFieldsTable).set({ order: idx }).where(eq(formFieldsTable.id, f.id)),
      ),
    );
  }
}

export default FormService;
