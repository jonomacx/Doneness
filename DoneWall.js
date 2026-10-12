import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { getCompletedTasks } from './taskStore';
import { formatTimestamp } from './dates';

const OWNER = 'Jono';
const PER_ROW = 3;
const GAP = 4; //the mortar between bricks
const BRICK_COLOURS = ['#a5472a', '#9a3f24', '#b04e2b', '#8f3b22'];

// Completed tasks as a brick wall: the first task completed is at the bottom left,
// and each new one is laid next to it, 3 to a row, so the wall grows upwards.
// Every other row is shifted by half a brick, like real brickwork.
const DoneWall = ({ onClose }) => {
  const [tasks, setTasks] = useState(null); //null while loading
  const [loadFailed, setLoadFailed] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    getCompletedTasks(OWNER)
      .then(setTasks)
      .catch((error) => {
        console.error('Error retrieving completed tasks:', error);
        setLoadFailed(true);
      });
  }, []);

  //3 bricks plus half a brick for the shifted rows fill the width
  const brickWidth = width ? (width - GAP * (PER_ROW + 1)) / (PER_ROW + 0.5) : 0;

  //rows[0] is the bottom row
  const rows = [];
  (tasks || []).forEach((task, i) => {
    if (i % PER_ROW === 0) rows.push([]);
    rows[rows.length - 1].push({ task, number: i });
  });

  let wall;
  if (loadFailed) wall = <Text style={styles.empty}>Couldn't load your completed tasks.</Text>;
  else if (!tasks) wall = <Text style={styles.empty}>Loading your wall...</Text>;
  else if (!tasks.length) wall = <Text style={styles.empty}>Complete a task to lay your first brick.</Text>;
  else
    wall = (
      <View style={styles.wall}>
        {rows
          .map((row, r) => (
            <View key={r} style={[styles.row, { paddingLeft: r % 2 ? GAP + brickWidth / 2 : GAP }]}>
              {row.map(({ task, number }) => (
                <View
                  key={task.taskId}
                  style={[styles.brick, { width: brickWidth, backgroundColor: BRICK_COLOURS[number % BRICK_COLOURS.length] }]}
                  accessible
                  accessibilityLabel={`${task.taskName}, completed ${formatTimestamp(task.dateCompleted)}`}
                >
                  <Text style={styles.brickName} numberOfLines={2}>
                    {task.taskName}
                  </Text>
                  <Text style={styles.brickDate}>{formatTimestamp(task.dateCompleted)}</Text>
                </View>
              ))}
            </View>
          ))
          .reverse()}
        <View style={styles.ground} />
      </View>
    );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Done Wall</Text>
          {!!tasks && !!tasks.length && (
            <Text style={styles.count}>
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} done
            </Text>
          )}
        </View>
        <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.link}>Close</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.wallArea} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {!!width && wall}
        </View>
      </ScrollView>
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
  count: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  link: {
    fontSize: 15,
    color: '#2196f3',
    paddingVertical: 4,
  },
  //the wall sits on the ground at the bottom of the screen until it is tall enough to scroll
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  wallArea: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  wall: {
    backgroundColor: '#ddd5cb', //mortar
    paddingTop: GAP,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: GAP,
  },
  brick: {
    height: 64,
    marginRight: GAP,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: 'space-between',
  },
  brickName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  brickDate: {
    fontSize: 10,
    color: '#f6e3db',
  },
  ground: {
    height: 6,
    backgroundColor: '#6b5b4e',
  },
});

export default DoneWall;
