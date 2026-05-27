import { db, eq } from "@repo/database";
import { themesTable, type InsertTheme, type SelectTheme } from "@repo/database/models/theme";
import { BaseService } from "../base";

export class ThemeService extends BaseService {
  async listThemes(): Promise<SelectTheme[]> {
    return db.select().from(themesTable).where(eq(themesTable.isActive, true));
  }

  async getThemeById(id: string): Promise<SelectTheme> {
    const [theme] = await db.select().from(themesTable).where(eq(themesTable.id, id));
    if (!theme) this.notFound("Theme");
    return theme;
  }

  async getThemeBySlug(slug: string): Promise<SelectTheme> {
    const [theme] = await db.select().from(themesTable).where(eq(themesTable.slug, slug));
    if (!theme) this.notFound("Theme");
    return theme;
  }

  async createTheme(data: InsertTheme): Promise<SelectTheme> {
    const [theme] = await db.insert(themesTable).values(data).returning();
    if (!theme) this.internal("Failed to create theme");
    return theme;
  }
}

export default ThemeService;
