import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import ToggleButton from './ToggleButton';
import { getOpenTasks, addTask } from './taskStore';
import { toDay, today, tomorrow, daysFromNow, formatDay } from './dates';

// Asks about the new task one question at a time, then saves it.
// Steps: name -> due date (-> pick a date) -> priority -> toughness
//        -> part of a bigger task? (-> pick the task) -> save
// The bigger-task question is skipped when there are no other tasks.
const OWNER = 'Jono';

// "25/12/2026" -> "2026-12-25T00:00:00.000Z", or null if it isn't a real date
const parseDate = (text) => {
  const match = text.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match.map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return toDay(date);
};

const AddTask = ({ onDone, onCancel }) => {
  const [steps, setSteps] = useState(['name']); //the questions visited so far, for Back
  const [fields, setFields] = useState({ taskName: '' });
  const [dateText, setDateText] = useState('');
  const [dateError, setDateError] = useState(false);
  const [openTasks, setOpenTasks] = useState(null); //null while loading

  const step = steps[steps.length - 1];
  const goTo = (next) => setSteps(steps.concat(next));
  const back = () => (steps.length > 1 ? setSteps(steps.slice(0, -1)) : onCancel());

  //load the existing tasks now, for the "part of a bigger task" question
  useEffect(() => {
    getOpenTasks(OWNER)
      .then((tasks) => setOpenTasks(tasks.sort((a, b) => a.taskName.localeCompare(b.taskName))))
      .catch((error) => {
        console.error('Error retrieving tasks:', error);
        setOpenTasks([]);
      });
  }, []);

  const save = async (parentOfTaskId) => {
    const task = { ...fields, parentOfTaskId };
    setFields(task);
    try {
      await addTask(OWNER, task);
      onDone();
    } catch (error) {
      console.error('Error adding task:', error);
      if (step !== 'saveFailed') goTo('saveFailed');
    }
  };

  const setDue = (dateRequired) => {
    setFields({ ...fields, dateRequired });
    goTo('priority');
  };

  let question;
  let body;

  if (step === 'name') {
    const name = fields.taskName.trim();
    question = 'What is the task?';
    body = (
      <>
        <TextInput
          style={styles.input}
          value={fields.taskName}
          onChangeText={(taskName) => setFields({ ...fields, taskName })}
          placeholder="e.g. Book the car in for a service"
          autoFocus
          onSubmitEditing={() => name && goTo('due')}
        />
        <View style={[styles.option, !name && styles.disabled]}>
          <ToggleButton label="Next" value={true} onToggle={() => name && goTo('due')} />
        </View>
      </>
    );
  } else if (step === 'due') {
    question = 'When is it due?';
    body = (
      <>
        <Option label={`Today (${formatDay(today())})`} onPress={() => setDue(today())} />
        <Option label={`Tomorrow (${formatDay(tomorrow())})`} onPress={() => setDue(tomorrow())} />
        <Option label={`In a week (${formatDay(daysFromNow(7))})`} onPress={() => setDue(daysFromNow(7))} />
        <Option label="Pick a date" onPress={() => goTo('pickDate')} />
        <Option label="No due date" onPress={() => setDue(undefined)} />
      </>
    );
  } else if (step === 'pickDate') {
    const submit = () => {
      const day = parseDate(dateText);
      setDateError(!day);
      if (day) setDue(day);
    };
    question = 'Which date is it due?';
    body = (
      <>
        <TextInput
          style={styles.input}
          value={dateText}
          onChangeText={(text) => {
            setDateText(text);
            setDateError(false);
          }}
          placeholder="DD/MM/YYYY"
          keyboardType="numbers-and-punctuation"
          autoFocus
          onSubmitEditing={submit}
        />
        {dateError && <Text style={styles.error}>Please enter a real date, like 25/12/2026.</Text>}
        <View style={styles.option}>
          <ToggleButton label="Next" value={true} onToggle={submit} />
        </View>
      </>
    );
  } else if (step === 'priority') {
    question = 'Is it high priority?';
    body = (
      <YesNo
        onAnswer={(priorityFlag) => {
          setFields({ ...fields, priorityFlag });
          goTo('toughness');
        }}
      />
    );
  } else if (step === 'toughness') {
    question = 'Is it a tough task?';
    body = (
      <YesNo
        onAnswer={(toughnessFlag) => {
          setFields({ ...fields, toughnessFlag });
          //only ask about a bigger task if there are tasks to pick from (or they're still loading)
          if (openTasks && !openTasks.length) save(undefined);
          else goTo('isSubtask');
        }}
      />
    );
  } else if (step === 'isSubtask') {
    question = 'Is it part of a bigger task?';
    body = <YesNo onAnswer={(isSubtask) => (isSubtask ? goTo('pickParent') : save(undefined))} />;
  } else if (step === 'pickParent') {
    question = 'Which task is it part of?';
    body = !openTasks ? (
      <Text style={styles.taskName}>Loading your tasks...</Text>
    ) : (
      <ScrollView style={styles.list}>
        {openTasks.map((task) => (
          <Pressable
            key={task.taskId}
            onPress={() => save(task.taskId)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <Text style={styles.rowName}>{task.taskName}</Text>
            {!!task.dateRequired && <Text style={styles.rowMeta}>Due {formatDay(task.dateRequired)}</Text>}
          </Pressable>
        ))}
      </ScrollView>
    );
  } else if (step === 'saveFailed') {
    question = "Couldn't save the task";
    body = (
      <>
        <Text style={styles.error}>Please try again.</Text>
        <View style={styles.option}>
          <ToggleButton label="Try again" value={true} onToggle={() => save(fields.parentOfTaskId)} />
        </View>
      </>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.label}>NEW TASK</Text>
      {step !== 'name' && !!fields.taskName.trim() && <Text style={styles.taskName}>{fields.taskName.trim()}</Text>}
      <Text style={styles.question}>{question}</Text>
      {body}
      <View style={styles.footer}>
        <Pressable onPress={back} accessibilityRole="button">
          <Text style={styles.link}>{steps.length > 1 ? 'Back' : 'Cancel'}</Text>
        </Pressable>
        {steps.length > 1 && (
          <Pressable onPress={onCancel} accessibilityRole="button">
            <Text style={styles.link}>Cancel</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const Option = ({ label, onPress }) => (
  <View style={styles.option}>
    <ToggleButton label={label} value={true} onToggle={onPress} />
  </View>
);

const YesNo = ({ onAnswer }) => (
  <View style={styles.yesNo}>
    <View style={styles.half}>
      <ToggleButton label="Yes" value={true} onToggle={onAnswer} />
    </View>
    <View style={styles.half}>
      <ToggleButton label="No" value={false} onToggle={onAnswer} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    width: 320,
    maxWidth: '100%',
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#888',
    textAlign: 'center',
  },
  taskName: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  option: {
    marginTop: 10,
  },
  disabled: {
    opacity: 0.4,
  },
  error: {
    fontSize: 13,
    color: '#b42318',
    textAlign: 'center',
    marginTop: 8,
  },
  yesNo: {
    flexDirection: 'row',
  },
  half: {
    flex: 1,
    marginHorizontal: 6,
  },
  list: {
    maxHeight: 360,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 12,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  rowPressed: {
    backgroundColor: '#f2f2f2',
  },
  rowName: {
    fontSize: 16,
    color: '#222',
  },
  rowMeta: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  link: {
    fontSize: 15,
    color: '#2196f3',
    padding: 4,
  },
});

export default AddTask;
