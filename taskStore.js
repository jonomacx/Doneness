// Where the app gets its tasks from.
//
// Running locally (phone, or the browser on localhost) it uses DynamoDB via db.js.
// On the public demo website (e.g. GitHub Pages) there is no database it can safely
// reach, so it uses the sample tasks instead and saves changes in the visitor's own
// browser (localStorage). The samples start fresh each day so their dates stay current;
// tasks the visitor added themselves are kept.

import { Platform } from 'react-native';
import { docClient, TABLE } from './db';
import { sampleTasks } from './sampleTasks';
import { today } from './dates';

export const isDemo =
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  !['localhost', '127.0.0.1'].includes(window.location.hostname);

const DEMO_KEY = 'doneness.demo';
let demo = null; //{ day, tasks, addedIds }, kept in memory too in case the browser blocks storage

function loadDemoTasks(ownerId) {
  if (!demo || demo.day !== today()) {
    try {
      const saved = JSON.parse(window.localStorage.getItem(DEMO_KEY));
      if (saved && saved.day === today()) demo = saved;
    } catch (e) {}
  }
  if (!demo || demo.day !== today()) {
    //new day: fresh samples, plus the tasks the visitor added
    let previous = demo;
    if (!previous) {
      try {
        previous = JSON.parse(window.localStorage.getItem(DEMO_KEY));
      } catch (e) {}
    }
    const addedIds = (previous && previous.addedIds) || [];
    const added = previous ? previous.tasks.filter((t) => addedIds.includes(t.taskId)) : [];
    demo = { day: today(), tasks: sampleTasks(ownerId).concat(added), addedIds };
    saveDemoTasks();
  }
  return demo.tasks;
}

function saveDemoTasks() {
  try {
    window.localStorage.setItem(DEMO_KEY, JSON.stringify(demo));
  } catch (e) {}
}

// All of this owner's tasks that have not been completed.
export async function getOpenTasks(ownerId) {
  if (isDemo) {
    return loadDemoTasks(ownerId).filter((task) => task.ownerId === ownerId && !task.dateCompleted);
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

// Mark a task as completed today.
export async function completeTask(task) {
  const dateCompleted = today();
  if (isDemo) {
    const tasks = loadDemoTasks(task.ownerId);
    demo.tasks = tasks.map((t) => (t.taskId === task.taskId ? { ...t, dateCompleted } : t));
    saveDemoTasks();
    return;
  }

  await docClient
    .update({
      TableName: TABLE,
      Key: { ownerId: task.ownerId, dateCreated: task.dateCreated },
      UpdateExpression: 'SET dateCompleted = :dateCompleted',
      ExpressionAttributeValues: { ':dateCompleted': dateCompleted },
    })
    .promise();
}

// A unique id for a new task. (Not uuid, which needs extra setup to run on phones.)
const newTaskId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

// Save a new task. `fields` has taskName, and optionally dateRequired, priorityFlag,
// toughnessFlag and parentOfTaskId. Returns the saved task.
export async function addTask(ownerId, fields) {
  const task = { ownerId, dateCreated: new Date().toISOString(), taskId: newTaskId() };
  //DynamoDB rejects undefined values, so only copy the fields that are set
  Object.keys(fields).forEach((key) => {
    if (fields[key] !== undefined && fields[key] !== null) task[key] = fields[key];
  });

  if (isDemo) {
    loadDemoTasks(ownerId);
    demo.tasks = demo.tasks.concat(task);
    demo.addedIds = (demo.addedIds || []).concat(task.taskId);
    saveDemoTasks();
    return task;
  }

  await docClient.put({ TableName: TABLE, Item: task }).promise();
  return task;
}
