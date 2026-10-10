import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDay, formatTimestamp } from './dates';

// A task shown as a card. With `parent`, the bigger task it belongs to is shown
// as a smaller card above it, joined by a line.
const TaskCard = ({ task, parent }) => (
  <View style={styles.stack}>
    {!!parent && (
      <>
        <View style={[styles.card, styles.parentCard]}>
          <Text style={styles.label}>PART OF</Text>
          <Text style={styles.parentName}>{parent.taskName}</Text>
          {!!parent.dateRequired && <Text style={styles.meta}>Due {formatDay(parent.dateRequired)}</Text>}
        </View>
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
  parentCard: {
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
  parentName: {
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
