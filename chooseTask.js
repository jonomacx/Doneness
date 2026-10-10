// The rules for which task to offer next.
//
// 1. A task that still has open subtasks can't be done yet, so it is never offered.
//    Its subtasks stand in for it: a subtask counts as due today, or high priority,
//    if it or anything it is part of is.
// 2. Due today, if any are.
// 3. Then high priority, if any are.
// 4. If what's left has both tough and easy tasks, the user chooses; otherwise one
//    is picked at random.

const { today } = require('./dates');

// Keep only the tasks that pass the test, but if none do, keep them all.
const narrow = (list, test) => {
  const matches = list.filter(test);
  return matches.length ? matches : list;
};

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)] || null;

// Each task with no open subtasks, along with the open tasks it is part of
// (its parent, that task's parent, and so on).
const readyTasks = (openTasks) => {
  const byId = new Map(openTasks.map((t) => [t.taskId, t]));
  const hasOpenSubtask = new Set(openTasks.map((t) => t.parentOfTaskId).filter(Boolean));

  return openTasks
    .filter((t) => !hasOpenSubtask.has(t.taskId))
    .map((task) => {
      const chain = [task];
      let parent = byId.get(task.parentOfTaskId);
      while (parent && !chain.includes(parent)) {
        chain.push(parent);
        parent = byId.get(parent.parentOfTaskId);
      }
      return { task, chain };
    });
};

// Returns { task } (null if there is nothing to do), or { tough, easy } when the
// user should choose between a tough and an easy task.
const chooseTask = (openTasks) => {
  const requiredDate = today();
  let picked = readyTasks(openTasks);
  picked = narrow(picked, ({ chain }) => chain.some((t) => t.dateRequired === requiredDate));
  picked = narrow(picked, ({ chain }) => chain.some((t) => t.priorityFlag));

  const tasks = picked.map(({ task }) => task);
  const tough = tasks.filter((t) => t.toughnessFlag);
  const easy = tasks.filter((t) => !t.toughnessFlag);
  if (tough.length && easy.length) return { tough, easy };
  return { task: pickRandom(tasks) };
};

module.exports = { chooseTask, pickRandom };
