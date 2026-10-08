// Shared DynamoDB connection for the app and the table*.js scripts.
//
// By default everything talks to the LOCAL database started with `npm run db`
// (http://localhost:8000). No real AWS keys are needed for that.
//
// To point the node scripts at real AWS instead, set DYNAMO_ENDPOINT=aws and
// supply credentials the normal AWS way (`aws configure`, or the
// AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY environment variables).
// Never paste keys into this file.

const AWS = require('aws-sdk');

const env = (typeof process !== 'undefined' && process.env) || {};
const endpoint = env.DYNAMO_ENDPOINT || 'http://localhost:8000';
const useAws = endpoint === 'aws';

AWS.config.update(
  useAws
    ? { region: env.AWS_REGION || 'eu-west-2' }
    : {
        region: 'eu-west-2',
        endpoint,
        // The local database accepts any keys; these are placeholders, not secrets.
        accessKeyId: 'local',
        secretAccessKey: 'local',
      }
);

module.exports = {
  TABLE: 'tasks',
  dynamodb: new AWS.DynamoDB(),
  docClient: new AWS.DynamoDB.DocumentClient(),
  target: useAws ? `AWS (${AWS.config.region})` : endpoint,
};
