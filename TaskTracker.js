import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import ToggleButton from './ToggleButton';
//import ToggleSwitch from './ToggleSwitch';

import { docClient as dynamodb } from './db';

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

        //filter by Owner ID
        const owner = "Jono"
        const filterExpression = `ownerId = :ownerId`;  
        const expressionAttributeValues = {
          ':ownerId':owner,
        };  


        //if filtering on todays completed date
/*        const filterExpression = 'attribute_not_exists(dateCompleted) OR dateCompleted = :completedDate';
        const expressionAttributeValues = {
          ':completedDate': new Date().toISOString().split('T')[0] 
        };


        //if filtering for a specific completed date
        const filterExpression = 'dateCompleted = :completedDate';
        const expressionAttributeValues = {
          ':completedDate': "2023-06-09T00:00:00.000Z"
        };


        //filter for a specific task name, uncomment to test
        const filterExpression = 'attribute_not_exists(taskName) OR taskName = :taskName';
        const expressionAttributeValues = {
          ':taskName': "Task To Do Today #2",
        };

*/

        //if filtering only for items that have not been completed
        const filterExpressionWithCompleted = `${filterExpression} AND attribute_not_exists(dateCompleted)`; 
        const expressionAttributeValuesWithCompleted = {
        ...expressionAttributeValues
      };


//xxx to update: check if any tasks have daterequired = today and load, if not then load all others

        // Filter for today's date or all tasks
        //const requiredDate = "2023-06-15T00:00:00.000Z"
        const requiredDate = new Date().toISOString().split('T')[0] + "T00:00:00.000Z";
        console.log("Required Date = " + requiredDate)
        const filterExpressionWithRequiredDate = `${filterExpressionWithCompleted} AND dateRequired = :dateRequired`;
        //const filterExpressionWithRequiredDate = `${filterExpressionWithCompleted} AND attribute_not_exists(dateRequired) OR dateRequired = :dateRequired`;
        const expressionAttributeValuesWithRequiredDate = {
          ...expressionAttributeValuesWithCompleted,
          ':dateRequired': requiredDate,
        };


//xxx to update: where any tasks = high priorty then load, if empty then load all others   

        // Filter for high priority tasks or all tasks
        const flagPriority = true
        const filterExpressionWithPriority = `${filterExpressionWithRequiredDate} AND priorityFlag = :priorityFlag `;
        const expressionAttributeValuesWithPriority = {
          ...expressionAttributeValuesWithRequiredDate,
          ':priorityFlag': flagPriority,
        };


//xxx to update: where any tasks = high toughness then load, if empty then load all others  

        // Filter for high toughness tasks or all tasks
        const flagToughness = true
        const filterExpressionWithToughness = `${filterExpressionWithPriority} AND toughnessFlag = :toughnessFlag`;
        const expressionAttributeValuesWithToughness = {
          ...expressionAttributeValuesWithPriority,
          ':toughnessFlag': flagToughness,
        };


        const params = {
          TableName: 'tasks',
          FilterExpression: filterExpressionWithToughness,//filterExpressionWithToughness, //filterExpressionWithPriority,//filterExpression, // filterExpressionWithDate,
          ExpressionAttributeValues: expressionAttributeValuesWithToughness,//expressionAttributeValuesWithToughness, //expressionAttributeValuesWithPriority,//expressionAttributeValues, //expressionAttributeValuesWithDate,
        };

console.log('Filter = ' + filterExpressionWithToughness)
console.log(expressionAttributeValuesWithToughness)

        const result = await dynamodb.scan(params).promise();

        //use this code to return all tasks that match the criteria
        setTasks(result.Items);
       // console.log(result.Items)

        //use this code to only return the first created task in the returned list
//        const firstTask = result.Items[0];
 //       setTasks([firstTask]);
   //     console.log(firstTask);

      } catch (error) {
        console.error('Error retrieving tasks:', error);
      }
    }

    fetchTasks();
    //setTasks(fetchTasks);
  }, []);




  const handleTakeTaskToggle = (value) => {
    setTakeTask(value);
    setClearDistractions(false);
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

  const handleClearDistractionsToggle = (value) => {
    setClearDistractions(value);
  };

  if (!clearDistractions) {
    return (
      <ToggleButton //ToggleButton - will be updated to ToggleSwitch later
        label="Have you cleared all distractions and ready to start?"
        value={true}
        onToggle={handleClearDistractionsToggle}
      />
    );
  }

  return (
    <View>
      {tasks.map((task) => (
        <Text key={task.TaskID}>
          {task.taskName}{"\n"}
          Created: {task.dateCreated}{"\n"}
          Required: {task.dateRequired}{"\n"}
          Completed: {task.dateCompleted}{"\n"}
          Priority: {task.priorityFlag ? 'High' : 'Normal'}{"\n"} 
          Toughness: {task.toughnessFlag ? 'High' : 'Normal'}{"\n"}
          Parent Task: {task.parentTaskId}{"\n"}
        </Text>
      ))}
    </View>
  );

  
/*return (
  <View>
    {tasks.map((task) => (
      <Text key={task.taskId}>Task: {task.taskName}</Text>
    ))}
  </View>
*/

/*return (
  <View>
    {tasks.map((task) => (
      <Text key={task.id}>Here's your task: {task.name}{'\n'}</Text>
      //<Button title="Is your task complete?" onPress={() => console.log('Task completed')} />
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
  
  );
*/  
};
export default TaskTracker;




