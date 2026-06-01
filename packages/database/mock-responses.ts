import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../.env') });
import { db } from './index';
import { formAnalyticsTable } from './models/analytics';
import { formResponsesTable, responseAnswersTable } from './models/response';
import { formsTable } from './models/form';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const formId = '7f6b9b79-a199-442e-bd09-d3b795e4597b';

const ips = ['192.168.1.1', '192.168.1.2', '10.0.0.5', '203.0.113.42', '198.51.100.12'];
const countries = ['US', 'IN', 'JP', 'UK', 'CA'];
const referrers = ['google.com', 'twitter.com', 'direct', 'linkedin.com', 'reddit.com'];

async function main() {
  console.log('Simulating traffic and responses...');
  
  // Track views and starts
  for (let i = 0; i < 15; i++) {
    const ip = ips[i % ips.length];
    const country = countries[i % countries.length];
    const referrer = referrers[i % referrers.length];
    const sessionHash = randomUUID();
    
    await db.insert(formAnalyticsTable).values({
      formId,
      event: 'view',
      ipAddress: ip,
      country,
      referrer,
      sessionHash,
      occurredAt: new Date(Date.now() - Math.random() * 86400000 * 3)
    });
    
    if (i % 3 !== 0) {
      await db.insert(formAnalyticsTable).values({
        formId,
        event: 'start',
        ipAddress: ip,
        country,
        referrer,
        sessionHash,
        occurredAt: new Date(Date.now() - Math.random() * 86400000 * 2)
      });
    }
  }

  // Submit responses
  for (let i = 0; i < 8; i++) {
    const ip = ips[i % ips.length];
    const responseId = randomUUID();
    const timeMs = 15000 + Math.random() * 60000;
    
    await db.insert(formResponsesTable).values({
      id: responseId,
      formId,
      ipAddress: ip,
      completionTimeMs: Math.floor(timeMs),
      metadata: { browser: 'Chrome', os: 'Mac OS' },
      submittedAt: new Date(Date.now() - Math.random() * 86400000 * 1)
    });

    const answers = [
      { fieldId: 'df426922-80f5-45fc-aeb7-04055baaf277', type: 'rating', value: Math.floor(Math.random() * 2) + 4 },
      { fieldId: 'bc9438f9-dc57-44d5-86e4-582d84c4a79b', type: 'scale', value: Math.floor(Math.random() * 3) + 7 },
      { fieldId: 'a4937275-9673-470a-aa9f-44512122a68b', type: 'select', value: ['web', 'mobile', 'desktop', 'api'][i % 4] },
      { fieldId: '299d9cf6-e9d9-42b5-90be-01a5813a665c', type: 'long_text', value: 'The UI is extremely beautiful, I love the theme!' },
      { fieldId: '085df2c4-7e16-4bc2-a3cc-707a80e46d49', type: 'long_text', value: 'Maybe add more integrations.' },
      { fieldId: 'da46b7d6-3f38-47a2-8be2-6c489012eff4', type: 'checkbox', value: i % 2 === 0 }
    ];

    for (const ans of answers) {
      await db.insert(responseAnswersTable).values({
        responseId,
        fieldId: ans.fieldId,
        fieldType: ans.type as any,
        value: ans.value
      });
    }

    await db.insert(formAnalyticsTable).values({
      formId,
      event: 'submit',
      ipAddress: ip,
      sessionHash: randomUUID(),
      occurredAt: new Date()
    });
  }

  // Update form response count
  const [{ count: currentCount }] = await db
    .select({ count: formResponsesTable.id })
    .from(formResponsesTable)
    .where(eq(formResponsesTable.formId, formId));

  // The count query returned rows, let's just do a proper count
  const countRes = await db.select({ c: formResponsesTable.id }).from(formResponsesTable).where(eq(formResponsesTable.formId, formId));
  
  await db.update(formsTable).set({ responseCount: countRes.length }).where(eq(formsTable.id, formId));
  
  console.log('Successfully added mock analytics and responses!');
  process.exit(0);
}
main();
