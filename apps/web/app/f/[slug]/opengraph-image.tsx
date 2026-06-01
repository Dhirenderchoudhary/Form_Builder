import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "Konoha Forms";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = params;

  let formTitle = "Mission Scroll";
  let formDescription = "Submit your answers to this mission scroll.";

  try {
    const { db, formsTable, eq } = await import("@repo/database");
    const forms = await db
      .select({ title: formsTable.title, description: formsTable.description })
      .from(formsTable)
      .where(eq(formsTable.slug, slug))
      .limit(1);

    if (forms[0]) {
      formTitle = forms[0].title;
      if (forms[0].description) {
        formDescription = forms[0].description;
      }
    }
  } catch (e) {
    // Fallback to default
  }

  // A beautiful, Naruto-themed deep dark background with orange accents
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #0A0A0A, #111111)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative corner accents */}
        <div style={{ position: "absolute", top: 40, left: 40, width: 60, height: 60, borderTop: "4px solid #FF6B00", borderLeft: "4px solid #FF6B00", opacity: 0.5 }} />
        <div style={{ position: "absolute", bottom: 40, right: 40, width: 60, height: 60, borderBottom: "4px solid #FF6B00", borderRight: "4px solid #FF6B00", opacity: 0.5 }} />

        {/* Content container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 80px",
          }}
        >
          <div
            style={{
              color: "#FF6B00",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              marginBottom: 40,
            }}
          >
            Konoha Forms · 巻物
          </div>

          <div
            style={{
              color: "#FFFFFF",
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: 30,
              textShadow: "0px 0px 40px rgba(255, 107, 0, 0.4)",
            }}
          >
            {formTitle}
          </div>

          <div
            style={{
              color: "#A3A3A3",
              fontSize: 36,
              fontWeight: 400,
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            {formDescription}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
