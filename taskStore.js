// Where the app gets its tasks from.
//
// Running locally (phone, or the browser on localhost) it uses DynamoDB via db.js.
// On the public demo website (e.g. GitHub Pages) there is no database it can safely
// reach, so it shows the sample tasks instead, dated from the day the page is opened.
// (Nothing in the app changes tasks yet. Once it does, the demo can save them in
// the browser's localStorage.)

import { Platform } from 'react-native';
import { docClient, TABLE } from './db';
import { sampleTasks } from './sampleTasks';

export const isDemo =
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  !['localhost', '127.0.0.1'].includes(window.location.hostname);

// All of this owner's tasks that have not been completed.
export async function getOpenTasks(ownerId) {
  if (isDemo) {
    return sampleTasks(ownerId).filter((task) => task.ownerId === ownerId && !task.dateCompleted);
  }

  const params = {
    TableName: TABLE,
    FilterExpression: 'ownerId = :ownerId AND attribute_not_exists(dateCompleted)',
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  };

  //a scan returns at most 1MB at a time, so keep going until it's all read
  let items = [];
  let result;
  do {
    result = await docClient.scan(params).promise();
    items = items.concat(result.Items);
    params.ExclusiveStartKey = result.LastEvaluatedKey;
  } while (result.LastEvaluatedKey);
  return items;
}
