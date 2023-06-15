import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import ToggleButton from './ToggleButton';
import AWS from 'aws-sdk';
//import ToggleSwitch from './ToggleSwitch';

AWS.config.update({
  region: 'eu-west-2',
  accessKeyId: 'AKIA5GUIGRJ7MRUV4AWG',
  secretAccessKey: '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',
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: 'tasks',
};

/*
//test connection to db
dynamodb.scan(params, (err, data) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Data:', data);
  }
});
*/
const TaskTracker = () => {

  const [takeTask, setTakeTask] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [clearDistractions, setClearDistractions] = useState(false);

  useEffect(() => {
    async function fetchTasks() {
      try {
        // Filter and do not show completed tasks
/*
        const filterExpression = 'attribute_not_exists(CompletedTask) OR CompletedTask = :completedTaskFalse';
        const expressionAttributeValues = {
          ':completedTaskFalse': false,
        };

        // Filter for today's date or all tasks
        const requiredCompletionDate = new Date().toISOString().split('T')[0];
        const filterExpressionWithDate = `RequiredCompletionDate = :dateRequired OR ${filterExpression}`;
        const expressionAttributeValuesWithDate = {
          ':dateRequired': requiredCompletionDate,
         // ...expressionAttributeValues,
        };

        // Filter for high priority tasks or all tasks
        const filterExpressionWithPriority = `HighPriority = :highPriority OR ${filterExpressionWithDate}`;
        const expressionAttributeValuesWithPriority = {
          ':highPriority': true,
          ...expressionAttributeValuesWithDate,
        };
*/

        const filterExpression = 'attribute_not_exists(taskName) OR taskName = :"Sample Task2"';
        const expressionAttributeValues = {
          ':taskName': "Sample Task2",
        };

        const params = {
          TableName: 'tasks',
          FilterExpression: filterExpression, //filterExpressionWithPriority,
          ExpressionAttributeValues: expressionAttributeValues, //expressionAttributeValuesWithPriority,
        };

        const result = await dynamodb.scan(params).promise();
        setTasks(result.Items);
        console.log(result.Items)
      } catch (error) {
        console.error('Error retrieving tasks:', error);
      }
    }

    //fetchTasks();
    //setTasks(fetchTasks);
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
        label="Have you cleared any distractions and ready to start?"
        value={true}
        onToggle={handleClearDistractionsToggle}
      />
    );
  }

 
  
return (
  <View>
    {tasks.map((task) => (
      <Text key={task.taskId}>Task: {task.taskName}</Text>
    ))}
  </View>

/*return (
  <View>
    {tasks.map((task) => (
      <Text key={task.id}>Here's your task: {task.name}{'\n'}</Text>
      <Button title="Is your task complete?" onPress={() => console.log('Task completed')} />
    ))}
  </View>
*/
/*
  const renderContent = () => {
    return <Text>Here's your task:[task details]</Text>;
  };

  return (
    <View>
      <Text>{renderContent()}{'\n'}</Text>
      <Button title="Is your task complete?" onPress={() => console.log('Task completed')} />
    </View>
*/    
  );
};
export default TaskTracker;




