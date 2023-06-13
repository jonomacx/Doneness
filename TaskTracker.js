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

dynamodb.scan(params, (err, data) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Data:', data);
  }
});

const TaskTracker = () => {

  const [takeTask, setTakeTask] = useState(false);
  const [clearDistractions, setClearDistractions] = useState(false);


  const handleClearDistractionsToggle = (value) => {
    setClearDistractions(value);
  };


  const handleTakeTaskToggle = (value) => {
    setTakeTask(value);
    //setClearDistractions(false);
  };

  if (!clearDistractions) {
    return (
      <ToggleButton //ToggleButton - will be updated to ToggleSwitch later
        label="Have you cleared any distractions and ready to start?"
        value={true}
        onToggle={handleClearDistractionsToggle}
      />
    );
  }


  if (!takeTask) {
    return (
      <ToggleButton
        label="Take a task"
        value={true}
        onToggle={handleTakeTaskToggle}
      />
    );
  }

  /*
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    async function fetchTasks() {
      try {
        // Filter and do not show completed tasks
        const filterExpression = 'attribute_not_exists(CompletedTask) OR CompletedTask = :completedTaskFalse';
        const expressionAttributeValues = {
          ':completedTaskFalse': false,
        };

        // Filter for today's date or all tasks
        const requiredCompletionDate = new Date().toISOString().split('T')[0];
        const filterExpressionWithDate = `RequiredCompletionDate = :requiredCompletionDate OR ${filterExpression}`;
        const expressionAttributeValuesWithDate = {
          ':requiredCompletionDate': requiredCompletionDate,
          ...expressionAttributeValues,
        };

        // Filter for high priority tasks or all tasks
        const filterExpressionWithPriority = `HighPriority = :highPriority OR ${filterExpressionWithDate}`;
        const expressionAttributeValuesWithPriority = {
          ':highPriority': true,
          ...expressionAttributeValuesWithDate,
        };

        const params = {
          TableName: 'Tasks',
          FilterExpression: filterExpressionWithPriority,
          ExpressionAttributeValues: expressionAttributeValuesWithPriority,
        };

        const result = await dynamodb.scan(params).promise();
        setTasks(result.Items);
      } catch (error) {
        console.error('Error retrieving tasks:', error);
      }
    }

    fetchTasks();
  }, []);
*/

  const renderContent = () => {
    return <Text>Here's your task:[task details]</Text>;
  };

  return (
    <View>
      <Text>{renderContent()}{'\n'}</Text>
      <Button title="Is your task complete?" onPress={() => console.log('Task completed')} />
    </View>
  );
};
export default TaskTracker;




