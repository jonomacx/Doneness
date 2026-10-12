// The rules for which task to offer next.
//
// 1. A task that is waiting on an open task (one whose parentOfTaskId points to it)
//    can't be done yet, so it is never offered. The task it waits on stands in for it:
//    that task counts as overdue, due today, or high priority, if it or anything
//    waiting on it is.
// 2. Overdue (due before today), if any are; otherwise due today, if any are.
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

// Each task that isn't waiting on another open task, along with the open tasks
// waiting on it (the task after it, the task after that, and so on).
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
  const todayDay = today().slice(0, 10);
  const dueDay = (t) => (t.dateRequired ? t.dateRequired.slice(0, 10) : null); //"YYYY-MM-DD" sorts as text
  const overdue = (t) => dueDay(t) !== null && dueDay(t) < todayDay;
  const dueToday = (t) => dueDay(t) === todayDay;

  let picked = readyTasks(openTasks);
  const anyOverdue = picked.some(({ chain }) => chain.some(overdue));
  picked = narrow(picked, ({ chain }) => chain.some(anyOverdue ? overdue : dueToday));
  picked = narrow(picked, ({ chain }) => chain.some((t) => t.priorityFlag));

  const tasks = picked.map(({ task }) => task);
  const tough = tasks.filter((t) => t.toughnessFlag);
  const easy = tasks.filter((t) => !t.toughnessFlag);
  if (tough.length && easy.length) return { tough, easy };
  return { task: pickRandom(tasks) };
};

module.exports = { chooseTask, pickRandom };
