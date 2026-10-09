import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import ToggleButton from './ToggleButton';
//import ToggleSwitch from './ToggleSwitch';

import { getOpenTasks } from './taskStore';
import { today } from './dates';

// Keep only the tasks that pass the test, but if none do, keep them all.
// Applied in order, this picks the most urgent tasks that actually exist.
const narrow = (list, test) => {
  const matches = list.filter(test);
  return matches.length ? matches : list;
};

const TaskTracker = () => {

  const [takeTask, setTakeTask] = useState(false);
  const [task, setTask] = useState(undefined); //undefined while loading, null if there are none
  const [clearDistractions, setClearDistractions] = useState(false);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const items = await getOpenTasks('Jono');

        //due today if there are any, then high priority if any, then high toughness if any
        const requiredDate = today();
        let picked = narrow(items, (task) => task.dateRequired === requiredDate);
        picked = narrow(picked, (task) => task.priorityFlag);
        picked = narrow(picked, (task) => task.toughnessFlag);

        //if more than one task is left, pick one at random
        setTask(picked[Math.floor(Math.random() * picked.length)] || null);
      } catch (error) {
        console.error('Error retrieving tasks:', error);
      }
    }

    fetchTasks();
  }, []);

  const handleTakeTaskToggle = (value) => {
    setTakeTask(value);
    setClearDistractions(false);
  };

  const handleClearDistractionsToggle = (value) => {
    setClearDistractions(value);
  };

  if (!takeTask) {
    return (
      <ToggleButton
        label="Take a task"
        value={true}
        onToggle={handleTakeTaskToggle}
      />
    );
  }

  if (!clearDistractions) {
    return (
      <ToggleButton //ToggleButton - will be updated to ToggleSwitch later
        label="Have you cleared all distractions and ready to start?"
        value={true}
        onToggle={handleClearDistractionsToggle}
      />
    );
  }

  if (task === undefined) {
    return <Text>Finding your task...</Text>;
  }

  if (!task) {
    return <Text>No tasks to do. Nice work!</Text>;
  }

  return (
    <View>
      <Text>
        {task.taskName}{"\n"}
        Created: {task.dateCreated}{"\n"}
        Required: {task.dateRequired}{"\n"}
        Priority: {task.priorityFlag ? 'High' : 'Normal'}{"\n"}
        Toughness: {task.toughnessFlag ? 'High' : 'Normal'}{"\n"}
        Parent Task: {task.parentTaskId}{"\n"}
      </Text>
    </View>
  );
};
export default TaskTracker;
