import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import ToggleButton from './ToggleButton';
import TaskCard from './TaskCard';
//import ToggleSwitch from './ToggleSwitch';

import { getOpenTasks } from './taskStore';
import { chooseTask, pickRandom } from './chooseTask';

const TaskTracker = () => {

  const [takeTask, setTakeTask] = useState(false);
  const [task, setTask] = useState(undefined); //undefined while loading, null if there are none
  const [clearDistractions, setClearDistractions] = useState(false);
  const [toughChoice, setToughChoice] = useState(null); //{ tough, easy } when the user gets to choose
  const [openTasks, setOpenTasks] = useState([]); //used to look up the task's parent and subtasks

  useEffect(() => {
    async function fetchTasks() {
      try {
        const items = await getOpenTasks('Jono');
        setOpenTasks(items);

        //see chooseTask.js for the rules
        const choice = chooseTask(items);
        if (choice.tough) {
          setToughChoice(choice);
          setTask(null);
        } else {
          setTask(choice.task);
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

  const parent = task.parentOfTaskId ? openTasks.find((t) => t.taskId === task.parentOfTaskId) : null;
  const subtasks = openTasks.filter((t) => t.parentOfTaskId === task.taskId);
  return <TaskCard task={task} parent={parent} subtasks={subtasks} />;
};
export default TaskTracker;
