import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import ToggleButton from './ToggleButton';
import TaskCard from './TaskCard';
//import ToggleSwitch from './ToggleSwitch';

import { getOpenTasks } from './taskStore';
import { today } from './dates';

// Keep only the tasks that pass the test, but if none do, keep them all.
// Applied in order, this picks the most urgent tasks that actually exist.
const narrow = (list, test) => {
  const matches = list.filter(test);
  return matches.length ? matches : list;
};

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)] || null;

const TaskTracker = () => {

  const [takeTask, setTakeTask] = useState(false);
  const [task, setTask] = useState(undefined); //undefined while loading, null if there are none
  const [clearDistractions, setClearDistractions] = useState(false);
  const [toughChoice, setToughChoice] = useState(null); //{ tough, easy } when the user gets to choose
  const [openTasks, setOpenTasks] = useState([]); //used to look up the task's parent

  useEffect(() => {
    async function fetchTasks() {
      try {
        const items = await getOpenTasks('Jono');
        setOpenTasks(items);

        //due today if there are any, then high priority if any
        const requiredDate = today();
        let picked = narrow(items, (task) => task.dateRequired === requiredDate);
        picked = narrow(picked, (task) => task.priorityFlag);

        //if there are both tough and easy tasks, let the user choose; otherwise pick one at random
        const tough = picked.filter((task) => task.toughnessFlag);
        const easy = picked.filter((task) => !task.toughnessFlag);
        if (tough.length && easy.length) {
          setToughChoice({ tough, easy });
          setTask(null);
        } else {
          setTask(pickRandom(picked));
        }
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

  const handleToughToggle = (value) => {
    setTask(pickRandom(value ? toughChoice.tough : toughChoice.easy));
    setToughChoice(null);
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

  if (toughChoice) {
    return (
      <View>
        <Text>Do you want to try and do a tough task now?{"\n"}</Text>
        <ToggleButton label="Yes" value={true} onToggle={handleToughToggle} />
        <Text></Text>
        <ToggleButton label="No" value={false} onToggle={handleToughToggle} />
      </View>
    );
  }

  if (!task) {
    return <Text>No tasks to do. Nice work!</Text>;
  }

  const parent = task.parentTaskId ? openTasks.find((t) => t.taskId === task.parentTaskId) : null;
  return <TaskCard task={task} parent={parent} />;
};
export default TaskTracker;
