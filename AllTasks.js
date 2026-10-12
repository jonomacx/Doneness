import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Modal, StyleSheet } from 'react-native';
import ToggleButton from './ToggleButton';
import { getOpenTasks, renameTask, deleteTask } from './taskStore';
import { today, tomorrow, formatDay } from './dates';
import { taskAfter, taskBefore } from './taskLinks';

const OWNER = 'Jono';

// Open tasks grouped by due date: overdue, today, tomorrow, each later date, then no due date.
// Within a group, the oldest added comes first.
const groupByDate = (tasks) => {
  const todayDay = today().slice(0, 10);
  const tomorrowDay = tomorrow().slice(0, 10);
  const heading = (day) => {
    if (!day) return 'No due date';
    if (day < todayDay) return 'Overdue';
    if (day === todayDay) return 'Today';
    if (day === tomorrowDay) return 'Tomorrow';
    return formatDay(day);
  };
  //overdue sorts as its own group just above today; no due date goes last
  const sortKey = (day) => (!day ? '9999' : day < todayDay ? '0000' : day);

  const sorted = tasks
    .map((task) => ({ task, day: task.dateRequired ? task.dateRequired.slice(0, 10) : null }))
    .sort((a, b) => {
      const byGroup = sortKey(a.day).localeCompare(sortKey(b.day));
      if (byGroup) return byGroup;
      if (a.day !== b.day) return (a.day || '').localeCompare(b.day || ''); //oldest overdue first
      return (a.task.dateCreated || '').localeCompare(b.task.dateCreated || '');
    });

  const groups = [];
  sorted.forEach(({ task, day }) => {
    const title = heading(day);
    if (!groups.length || groups[groups.length - 1].title !== title) groups.push({ title, tasks: [] });
    groups[groups.length - 1].tasks.push(task);
  });
  return groups;
};

// Every open task as a card, with Edit (rename) and X (delete).
// Calls onClose(changed) when the user is done; `changed` is true if anything was edited.
const AllTasks = ({ onClose }) => {
  const [tasks, setTasks] = useState(null); //null while loading
  const [loadFailed, setLoadFailed] = useState(false);
  const [editing, setEditing] = useState(null); //{ task, name } while renaming
  const [deleting, setDeleting] = useState(null); //the task waiting for delete confirmation
  const [saveFailed, setSaveFailed] = useState(false);
  const [changed, setChanged] = useState(false);

  const load = async () => {
    try {
      setTasks(await getOpenTasks(OWNER));
      setLoadFailed(false);
    } catch (error) {
      console.error('Error retrieving tasks:', error);
      setLoadFailed(true);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveName = async () => {
    const name = editing.name.trim();
    if (!name) return;
    try {
      await renameTask(editing.task, name);
    } catch (error) {
      console.error('Error renaming task:', error);
      setSaveFailed(true);
      return;
    }
    setEditing(null);
    setSaveFailed(false);
    setChanged(true);
    load();
  };

  const confirmDelete = async (yes) => {
    if (!yes) {
      setDeleting(null);
      setSaveFailed(false);
      return;
    }
    try {
      await deleteTask(deleting, tasks);
    } catch (error) {
      console.error('Error deleting task:', error);
      setSaveFailed(true);
      return;
    }
    setDeleting(null);
    setSaveFailed(false);
    setChanged(true);
    load();
  };

  let list;
  if (loadFailed) list = <Text style={styles.empty}>Couldn't load your tasks.</Text>;
  else if (!tasks) list = <Text style={styles.empty}>Loading your tasks...</Text>;
  else if (!tasks.length) list = <Text style={styles.empty}>No tasks to do. Nice work!</Text>;
  else
    list = groupByDate(tasks).map((group) => (
      <View key={group.title}>
        <Text style={[styles.groupTitle, group.title === 'Overdue' && styles.overdue]}>{group.title.toUpperCase()}</Text>
        {group.tasks.map((task) => {
          const before = taskBefore(task, tasks); //has to be completed first
          const after = taskAfter(task, tasks); //can only be done once this one is completed
          const isEditing = editing && editing.task.taskId === task.taskId;
          return (
            <View key={task.taskId} style={styles.card}>
              {isEditing ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={editing.name}
                    onChangeText={(name) => setEditing({ ...editing, name })}
                    onSubmitEditing={saveName}
                    autoFocus
                    accessibilityLabel="Task name"
                  />
                  {saveFailed && <Text style={styles.error}>Couldn't save that. Please try again.</Text>}
                  <View style={styles.editButtons}>
                    <View style={styles.half}>
                      <ToggleButton label="Save" value={true} onToggle={saveName} />
                    </View>
                    <View style={styles.half}>
                      <ToggleButton
                        label="Cancel"
                        value={true}
                        onToggle={() => {
                          setEditing(null);
                          setSaveFailed(false);
                        }}
                      />
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.titleRow}>
                    <Text style={styles.name}>{task.taskName}</Text>
                    <Pressable
                      onPress={() => setDeleting(task)}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${task.taskName}`}
                      hitSlop={8}
                      style={({ pressed }) => [styles.delete, pressed && styles.deletePressed]}
                    >
                      <Text style={styles.deleteText}>✕</Text>
                    </Pressable>
                  </View>
                  <View style={styles.tags}>
                    {!!task.priorityFlag && <Text style={[styles.tag, styles.priorityTag]}>High priority</Text>}
                    {!!task.toughnessFlag && <Text style={[styles.tag, styles.toughTag]}>Tough</Text>}
                  </View>
                  {!!task.dateRequired && <Text style={styles.meta}>Due {formatDay(task.dateRequired)}</Text>}
                  {!!before && <Text style={styles.meta}>Comes after: {before.taskName}</Text>}
                  {!!after && <Text style={styles.meta}>Unlocks: {after.taskName}</Text>}
                  <Pressable
                    onPress={() => {
                      setEditing({ task, name: task.taskName });
                      setSaveFailed(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${task.taskName}`}
                    style={styles.editLink}
                  >
                    <Text style={styles.link}>Edit</Text>
                  </Pressable>
                </>
              )}
            </View>
          );
        })}
      </View>
    ));

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>All tasks</Text>
        <Pressable onPress={() => onClose(changed)} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.link}>Close</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>{list}</ScrollView>

      <Modal visible={!!deleting} transparent animationType="fade" onRequestClose={() => confirmDelete(false)}>
        <View style={styles.backdrop}>
          <View style={styles.prompt}>
            <Text style={styles.question}>Delete this task?</Text>
            {!!deleting && <Text style={styles.promptTask}>{deleting.taskName}</Text>}
            {saveFailed && <Text style={styles.error}>Couldn't delete that. Please try again.</Text>}
            <View style={styles.editButtons}>
              <View style={styles.half}>
                <ToggleButton label="Delete" value={true} onToggle={confirmDelete} />
              </View>
              <View style={styles.half}>
                <ToggleButton label="Keep" value={false} onToggle={confirmDelete} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  listContent: {
    padding: 16,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#888',
    marginTop: 16,
    marginBottom: 8,
  },
  overdue: {
    color: '#b42318',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    padding: 16,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
  delete: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deletePressed: {
    backgroundColor: '#fde8e8',
  },
  deleteText: {
    fontSize: 16,
    color: '#888',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  priorityTag: {
    backgroundColor: '#fde8e8',
    color: '#b42318',
  },
  toughTag: {
    backgroundColor: '#ece8fd',
    color: '#5b3cc4',
  },
  meta: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
  },
  editLink: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  link: {
    fontSize: 15,
    color: '#2196f3',
    paddingVertical: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  editButtons: {
    flexDirection: 'row',
    marginTop: 12,
    marginHorizontal: -6,
  },
  half: {
    flex: 1,
    marginHorizontal: 6,
  },
  error: {
    fontSize: 13,
    color: '#b42318',
    textAlign: 'center',
    marginTop: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  prompt: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 320,
    maxWidth: '100%',
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#222',
  },
  promptTask: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
});

export { groupByDate };
export default AllTasks;
