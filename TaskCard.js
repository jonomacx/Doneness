import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDay, formatTimestamp } from './dates';

// A smaller card for a task linked to the current one
const LinkedCard = ({ label, task }) => (
  <View style={[styles.card, styles.linkedCard]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.linkedName}>{task.taskName}</Text>
    {!!task.dateRequired && <Text style={styles.meta}>Due {formatDay(task.dateRequired)}</Text>}
  </View>
);

// A task shown as a card. The bigger task it is part of (`parent`) is shown above
// it, and any tasks that are part of it (`subtasks`) below, each joined by a line.
const TaskCard = ({ task, parent, subtasks = [] }) => (
  <View style={styles.stack}>
    {!!parent && (
      <>
        <LinkedCard label="PART OF" task={parent} />
        <View style={styles.connector} />
      </>
    )}

    <View style={styles.card}>
      <Text style={styles.label}>YOUR TASK</Text>
      <Text style={styles.name}>{task.taskName}</Text>

      <View style={styles.tags}>
        {!!task.priorityFlag && <Text style={[styles.tag, styles.priorityTag]}>High priority</Text>}
        {!!task.toughnessFlag && <Text style={[styles.tag, styles.toughTag]}>Tough</Text>}
      </View>

      <View style={styles.dates}>
        {!!task.dateRequired && <Text style={styles.meta}>Due {formatDay(task.dateRequired)}</Text>}
        {!!task.dateCreated && <Text style={styles.meta}>Added {formatTimestamp(task.dateCreated)}</Text>}
      </View>
    </View>

    {subtasks.map((subtask) => (
      <React.Fragment key={subtask.taskId}>
        <View style={styles.connector} />
        <LinkedCard label="SUBTASK" task={subtask} />
      </React.Fragment>
    ))}
  </View>
);

const styles = StyleSheet.create({
  stack: {
    alignItems: 'center',
    width: 320,
    maxWidth: '100%',
  },
  card: {
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  linkedCard: {
    backgroundColor: '#f7f7f7',
    paddingVertical: 14,
    marginHorizontal: 16,
  },
  connector: {
    width: 2,
    height: 24,
    backgroundColor: '#c8c8c8',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#888',
    marginBottom: 6,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  linkedName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  tag: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 8,
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
  dates: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
});

export default TaskCard;
