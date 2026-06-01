import { db, formsTable, formFieldsTable, eq } from "@repo/database";

async function main() {
  const form = await db.select().from(formsTable).where(eq(formsTable.id, "7f6b9b79-a199-442e-bd09-d3b795e4597b"));
  console.log("Form:", form);
  process.exit(0);
}
main();
