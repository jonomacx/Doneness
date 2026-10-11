import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import ToggleButton from './ToggleButton';
import TaskCard from './TaskCard';
import AddTask from './AddTask';
//import ToggleSwitch from './ToggleSwitch';

import { getOpenTasks, completeTask } from './taskStore';
import { chooseTask, pickRandom } from './chooseTask';

const DONE_MESSAGE = 'Nice work! That task is done.';

const TaskTracker = () => {

  const [takeTask, setTakeTask] = useState(false);
  const [task, setTask] = useState(undefined); //undefined while loading, null if there are none
  const [clearDistractions, setClearDistractions] = useState(false);
  const [toughChoice, setToughChoice] = useState(null); //{ tough, easy } when the user gets to choose
  const [openTasks, setOpenTasks] = useState([]); //used to look up the task's parent and subtasks
  const [askCompleted, setAskCompleted] = useState(false); //showing "have you completed the task?"
  const [saveFailed, setSaveFailed] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [message, setMessage] = useState(null); //shown on the start screen, e.g. after completing a task

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

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTakeTaskToggle = (value) => {
    setTakeTask(value);
    setClearDistractions(false);
    setMessage(null);
  };

  const handleAddTaskToggle = () => {
    setAddingTask(true);
    setMessage(null);
  };

  //a new task can change which task should come next, so choose again
  const handleTaskAdded = () => {
    setAddingTask(false);
    setMessage('Task added.');
    setToughChoice(null);
    setTask(undefined);
    fetchTasks();
  };

  const handleClearDistractionsToggle = (value) => {
    setClearDistractions(value);
  };

  const handleToughToggle = (value) => {
    setTask(pickRandom(value ? toughChoice.tough : toughChoice.easy));
    setToughChoice(null);
  };

  //Yes: save it as completed and go back to the start, ready for the next task. No: close the prompt.
  const handleCompletedToggle = async (value) => {
    if (!value) {
      setAskCompleted(false);
      setSaveFailed(false);
      return;
    }
    try {
      await completeTask(task);
    } catch (error) {
      console.error('Error completing task:', error);
      setSaveFailed(true);
      return;
    }
    setAskCompleted(false);
    setSaveFailed(false);
    setMessage(DONE_MESSAGE);
    setTakeTask(false);
    setToughChoice(null);
    setTask(undefined);
    fetchTasks();
  };

  if (addingTask) {
    return <AddTask onDone={handleTaskAdded} onCancel={() => setAddingTask(false)} />;
  }

  if (!takeTask) {
    return (
      <View style={styles.centred}>
        {!!message && <Text style={styles.message}>{message}{"\n"}</Text>}
        <ToggleButton
          label={message === DONE_MESSAGE ? 'Take another task' : 'Take a task'}
          value={true}
          onToggle={handleTakeTaskToggle}
        />
        <View style={styles.gap} />
        <ToggleButton label="Add a task" value={true} onToggle={handleAddTaskToggle} />
      </View>
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
  return (
    <>
      <TaskCard task={task} parent={parent} subtasks={subtasks} onPress={() => setAskCompleted(true)} />

      <Modal visible={askCompleted} transparent animationType="fade" onRequestClose={() => handleCompletedToggle(false)}>
        <View style={styles.backdrop}>
          <View style={styles.prompt}>
            <Text style={styles.question}>Have you completed the task?</Text>
            <Text style={styles.taskName}>{task.taskName}</Text>
            {saveFailed && <Text style={styles.error}>Couldn't save that. Please try again.</Text>}
            <View style={styles.buttons}>
              <View style={styles.button}>
                <ToggleButton label="Yes" value={true} onToggle={handleCompletedToggle} />
              </View>
              <View style={styles.button}>
                <ToggleButton label="No" value={false} onToggle={handleCompletedToggle} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  centred: {
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
  gap: {
    height: 12,
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
  taskName: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
  error: {
    fontSize: 13,
    textAlign: 'center',
    color: '#b42318',
    marginTop: 12,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
  },
});

export default TaskTracker;
