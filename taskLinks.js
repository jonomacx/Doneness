// Rules for linking a new task to existing ones.
//
// A task's parentOfTaskId is the task that comes after it: that task can only be
// done once this one is completed. Each task can have at most one task right before
// it and one task right after it. Only open (not completed) tasks count.

// The open task that comes right after `task`, if any
const taskAfter = (task, openTasks) =>
  task.parentOfTaskId ? openTasks.find((t) => t.taskId === task.parentOfTaskId) || null : null;

// The open task that comes right before `task`, if any
const taskBefore = (task, openTasks) => openTasks.find((t) => t.parentOfTaskId === task.taskId) || null;

// For "can this task only be done after another task?": the tasks that could come
// right before the new one. Each is { task, reason }; reason is null if it can be picked.
const beforeOptions = (openTasks) =>
  openTasks.map((task) => ({
    task,
    reason: taskAfter(task, openTasks) ? 'Already has a task after it' : null,
  }));

// For "does this task need to be done before another task?": the tasks that could come
// right after the new one. `beforeId` is the task picked to come before it, if any.
const afterOptions = (openTasks, beforeId) =>
  openTasks.map((task) => {
    if (task.taskId === beforeId) return { task, reason: 'Already picked to come before' };
    if (taskBefore(task, openTasks)) return { task, reason: 'Already has a task before it' };
    //it would make a loop if this task already has to be done before the picked one
    //(following the tasks that come after it reaches the picked task)
    if (beforeId) {
      let t = taskAfter(task, openTasks);
      const seen = [task];
      while (t && !seen.includes(t)) {
        if (t.taskId === beforeId) return { task, reason: 'Would make a loop' };
        seen.push(t);
        t = taskAfter(t, openTasks);
      }
    }
    return { task, reason: null };
  });

// Open tasks in the order to show them: first each chain of linked tasks in the order
// they have to be done (chains sorted A-Z by their first task), then every task that
// isn't linked to another, A-Z. Returns { chains: [[task, ...], ...], others: [task, ...] }.
const orderTasks = (openTasks) => {
  const byName = (a, b) => a.taskName.localeCompare(b.taskName, undefined, { sensitivity: 'base' });
  const placed = new Set();
  const chains = [];

  //a chain starts at a task with nothing before it but something after it
  openTasks
    .filter((t) => !taskBefore(t, openTasks) && taskAfter(t, openTasks))
    .sort(byName)
    .forEach((start) => {
      const chain = [];
      let t = start;
      while (t && !placed.has(t)) {
        chain.push(t);
        placed.add(t);
        t = taskAfter(t, openTasks);
      }
      chains.push(chain);
    });

  //everything else, including any tasks caught in a loop of links
  const others = openTasks.filter((t) => !placed.has(t)).sort(byName);
  return { chains, others };
};

module.exports = { taskAfter, taskBefore, beforeOptions, afterOptions, orderTasks };
