// Sample tasks, used by seed.js for the local database and by the demo
// website (which keeps its tasks in the browser instead of DynamoDB).
// A task's parentOfTaskId is the taskId of the bigger task it is part of.

const { v4: uuidv4 } = require('uuid');
const dates = require('./dates');

const sampleTasks = (ownerId) => {
  const today = dates.today();
  const tomorrow = dates.tomorrow();
  const winterId = uuidv4();
  const toughId = uuidv4();
  const samples = [
    // a chain: winter jobs -> tough task -> its first step
    { taskId: winterId, taskName: 'Get the house ready for winter', dateRequired: dates.daysFromNow(14), priorityFlag: false, toughnessFlag: false },
    { taskId: toughId, taskName: 'Tough and priority task due today', dateRequired: today, priorityFlag: true, toughnessFlag: true, parentOfTaskId: winterId },
    { taskName: 'Gather what you need for the tough task', dateRequired: tomorrow, priorityFlag: false, toughnessFlag: false, parentOfTaskId: toughId },
    { taskName: 'Second tough priority task due today', dateRequired: today, priorityFlag: true, toughnessFlag: true },
    { taskName: 'Easy priority task due today', dateRequired: today, priorityFlag: true, toughnessFlag: false, parentOfTaskId: winterId },
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
