// Where the app gets its tasks from.
//
// Running locally (phone, or the browser on localhost) it uses DynamoDB via db.js.
// On the public website (e.g. GitHub Pages) there is no database it can safely reach,
// so it keeps the visitor's tasks in their own browser (localStorage).

import { Platform } from 'react-native';
import { docClient, TABLE } from './db';

export const isDemo =
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  !['localhost', '127.0.0.1'].includes(window.location.hostname);

const DEMO_KEY = 'doneness.demo';
let demo = null; //{ tasks, addedIds }, kept in memory too in case the browser blocks storage

function loadDemoTasks() {
  if (!demo) {
    let saved = null;
    try {
      saved = JSON.parse(window.localStorage.getItem(DEMO_KEY));
    } catch (e) {}
    const addedIds = (saved && saved.addedIds) || [];
    //only keep the tasks the visitor added: earlier versions also stored daily example tasks
    const savedTasks = (saved && saved.tasks) || [];
    demo = { tasks: savedTasks.filter((t) => addedIds.includes(t.taskId)), addedIds };
    if (!saved || saved.day || demo.tasks.length !== savedTasks.length) saveDemoTasks();
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
    return loadDemoTasks().filter((task) => task.ownerId === ownerId && !task.dateCompleted);
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

// All of this owner's completed tasks, in the order they were completed.
export async function getCompletedTasks(ownerId) {
  let items;
  if (isDemo) {
    items = loadDemoTasks().filter((task) => task.ownerId === ownerId && task.dateCompleted);
  } else {
    const params = {
      TableName: TABLE,
      FilterExpression: 'ownerId = :ownerId AND attribute_exists(dateCompleted)',
      ExpressionAttributeValues: { ':ownerId': ownerId },
    };
    items = [];
    let result;
    do {
      result = await docClient.scan(params).promise();
      items = items.concat(result.Items);
      params.ExclusiveStartKey = result.LastEvaluatedKey;
    } while (result.LastEvaluatedKey);
  }
  //dateCompleted is an ISO timestamp (older tasks only have the day), so it sorts as text
  return items.sort(
    (a, b) => a.dateCompleted.localeCompare(b.dateCompleted) || a.dateCreated.localeCompare(b.dateCreated)
  );
}

// Mark a task as completed now.
export async function completeTask(task) {
  const dateCompleted = new Date().toISOString();
  if (isDemo) {
    const tasks = loadDemoTasks();
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
    loadDemoTasks();
    demo.tasks = demo.tasks.concat(task);
    demo.addedIds = (demo.addedIds || []).concat(task.taskId);
    saveDemoTasks();
    return task;
  }

  await docClient.put({ TableName: TABLE, Item: task }).promise();
  return task;
}

// Set the task that comes after `task` (its parentOfTaskId), or remove it with null.
export async function setTaskAfter(task, parentOfTaskId) {
  if (isDemo) {
    const tasks = loadDemoTasks();
    demo.tasks = tasks.map((t) => {
      if (t.taskId !== task.taskId) return t;
      const { parentOfTaskId: _old, ...rest } = t;
      return parentOfTaskId ? { ...rest, parentOfTaskId } : rest;
    });
    saveDemoTasks();
    return;
  }

  const key = { TableName: TABLE, Key: { ownerId: task.ownerId, dateCreated: task.dateCreated } };
  await docClient
    .update(
      parentOfTaskId
        ? { ...key, UpdateExpression: 'SET parentOfTaskId = :p', ExpressionAttributeValues: { ':p': parentOfTaskId } }
        : { ...key, UpdateExpression: 'REMOVE parentOfTaskId' }
    )
    .promise();
}

// Change a task's name.
export async function renameTask(task, taskName) {
  if (isDemo) {
    const tasks = loadDemoTasks();
    demo.tasks = tasks.map((t) => (t.taskId === task.taskId ? { ...t, taskName } : t));
    saveDemoTasks();
    return;
  }

  await docClient
    .update({
      TableName: TABLE,
      Key: { ownerId: task.ownerId, dateCreated: task.dateCreated },
      UpdateExpression: 'SET taskName = :taskName',
      ExpressionAttributeValues: { ':taskName': taskName },
    })
    .promise();
}

// Delete a task. If it was in the middle of a chain (A -> task -> C), A is linked to C
// so the order is kept.
export async function deleteTask(task, openTasks) {
  const before = openTasks.find((t) => t.parentOfTaskId === task.taskId);
  if (before) await setTaskAfter(before, task.parentOfTaskId || null);

  if (isDemo) {
    const tasks = loadDemoTasks();
    demo.tasks = tasks.filter((t) => t.taskId !== task.taskId);
    demo.addedIds = (demo.addedIds || []).filter((id) => id !== task.taskId);
    saveDemoTasks();
    return;
  }

  await docClient.delete({ TableName: TABLE, Key: { ownerId: task.ownerId, dateCreated: task.dateCreated } }).promise();
}
