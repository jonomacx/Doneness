// Creates the `tasks` table (if missing) and adds some sample tasks.
// Run with:  npm run seed      (start the database first with: npm run db)

const { v4: uuidv4 } = require('uuid');
const { dynamodb, docClient, TABLE, target } = require('./db');
const dates = require('./dates');

const today = dates.today();
const tomorrow = dates.tomorrow();

const samples = [
  { taskName: 'Tough and priority task due today', dateRequired: today, priorityFlag: true, toughnessFlag: true },
  { taskName: 'Second tough priority task due today', dateRequired: today, priorityFlag: true, toughnessFlag: true },
  { taskName: 'Easy priority task due today', dateRequired: today, priorityFlag: true, toughnessFlag: false },
  { taskName: 'Normal task due today', dateRequired: today, priorityFlag: false, toughnessFlag: false },
  { taskName: 'Tough priority task due tomorrow', dateRequired: tomorrow, priorityFlag: true, toughnessFlag: true },
  { taskName: 'Finished task', dateRequired: today, priorityFlag: true, toughnessFlag: true, dateCompleted: today },
];

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
  for (const [i, s] of samples.entries()) {
    const item = {
      ownerId: 'Jono',
      // offset by i ms so each sort key is unique
      dateCreated: new Date(Date.now() + i).toISOString(),
      taskId: uuidv4(),
      parentTaskId: uuidv4(),
      ...s,
    };
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
