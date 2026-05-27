import { z } from "zod";
import { router, publicProcedure } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formService, themeService } from "../../services";
import { paginationSchema } from "../../schemas/form.schemas";

const TAGS = ["Explore"];
const getPath = generatePath("/explore");

export const exploreRouter = router({

  listForms: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/forms"),
        tags: TAGS,
        summary: "Browse publicly visible forms (visibility=public, status=published)",
      },
    })
    .input(
      paginationSchema.merge(
        z.object({ search: z.string().optional() }),
      ),
    )
    .output(z.any())
    .query(async ({ input }) => {
      return formService.listPublicForms({
        limit: input.pageSize,
        offset: (input.page - 1) * input.pageSize,
        search: input.search,
      });
    }),

  listThemes: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/themes"),
        tags: ["Themes"],
        summary: "List all available form themes",
      },
    })
    .input(z.undefined())
    .output(z.any())
    .query(async () => {
      return themeService.listThemes();
    }),

  getTheme: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/themes/{slug}"),
        tags: ["Themes"],
        summary: "Get a theme by slug",
      },
    })
    .input(z.object({ slug: z.string().min(1) }))
    .output(z.any())
    .query(async ({ input }) => {
      return themeService.getThemeBySlug(input.slug);
    }),
});
