// Creates the `tasks` table (if missing) and adds some sample tasks.
// Run with:  npm run seed      (start the database first with: npm run db)

const { dynamodb, docClient, TABLE, target } = require('./db');
const { sampleTasks } = require('./sampleTasks');

async function ensureTable() {
  const { TableNames } = await dynamodb.listTables().promise();
  if (TableNames.includes(TABLE)) return console.log(`Table "${TABLE}" already exists`);
  await dynamodb
    .createTable({
      TableName: TABLE,
      KeySchema: [
        { AttributeName: 'ownerId', KeyType: 'HASH' },
        { AttributeName: 'dateCreated', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'ownerId', AttributeType: 'S' },
        { AttributeName: 'dateCreated', AttributeType: 'S' },
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    })
    .promise();
  await dynamodb.waitFor('tableExists', { TableName: TABLE }).promise();
  console.log(`Created table "${TABLE}"`);
}

(async () => {
  console.log(`Seeding ${target}`);
  await ensureTable();
  for (const item of sampleTasks('Jono')) {
    await docClient.put({ TableName: TABLE, Item: item }).promise();
    console.log('  added:', item.taskName);
  }
  console.log('Done.');
})().catch((e) => {
  console.error('Seed failed:', e.message);
  if (e.code === 'UnknownEndpoint' || e.code === 'NetworkingError')
    console.error('Is the local database running? Start it with: npm run db');
  process.exit(1);
});
