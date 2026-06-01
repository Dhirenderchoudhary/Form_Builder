import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../.env') });
import db from './index';
import { formsTable, formFieldsTable } from './models/form';
import { eq } from 'drizzle-orm';

async function main() {
  const forms = await db.select().from(formsTable).where(eq(formsTable.slug, 'feedback-survey-2'));
  const form = forms[0];
  if (!form) {
    console.log('Form not found');
    return;
  }
  await db.update(formsTable).set({ status: 'published' }).where(eq(formsTable.id, form.id));
  const fields = await db.select().from(formFieldsTable).where(eq(formFieldsTable.formId, form.id));
  console.log(JSON.stringify({ form, fields }, null, 2));
  process.exit(0);
}
main();
