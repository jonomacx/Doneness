// Sample tasks, used by seed.js for the local database and by the demo
// website (which keeps its tasks in the browser instead of DynamoDB).
// A task's parentTaskId is the taskId of the bigger task it is part of.

const { v4: uuidv4 } = require('uuid');
const dates = require('./dates');

const sampleTasks = (ownerId) => {
  const today = dates.today();
  const tomorrow = dates.tomorrow();
  const parentId = uuidv4();
  const samples = [
    { taskId: parentId, taskName: 'Get the house ready for winter', dateRequired: dates.daysFromNow(14), priorityFlag: false, toughnessFlag: false },
    { taskName: 'Tough and priority task due today', dateRequired: today, priorityFlag: true, toughnessFlag: true, parentTaskId: parentId },
    { taskName: 'Second tough priority task due today', dateRequired: today, priorityFlag: true, toughnessFlag: true },
    { taskName: 'Easy priority task due today', dateRequired: today, priorityFlag: true, toughnessFlag: false, parentTaskId: parentId },
    { taskName: 'Normal task due today', dateRequired: today, priorityFlag: false, toughnessFlag: false },
    { taskName: 'Tough priority task due tomorrow', dateRequired: tomorrow, priorityFlag: true, toughnessFlag: true },
    { taskName: 'Finished task', dateRequired: today, priorityFlag: true, toughnessFlag: true, dateCompleted: today },
  ];
  return samples.map((s, i) => ({
    ownerId,
    // offset by i ms so each sort key is unique
    dateCreated: new Date(Date.now() + i).toISOString(),
    taskId: uuidv4(),
    ...s,
  }));
};

module.exports = { sampleTasks };
