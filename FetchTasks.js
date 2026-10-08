import React, { useEffect, useState } from 'react';


const { docClient: dynamodb } = require('./db');


const TaskTracker = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    async function fetchTasks() {
      try {
        // Filter and do not show completed tasks
        const filterExpression = 'attribute_not_exists(dateCompleted)';  // OR dateCompleted = :dateCompletedNull';
        const expressionAttributeValues = {
          ':completedTaskFalse': false,
        };

        // Filter for today's date or all tasks
        const dateRequired = new Date().toISOString().split('T')[0];
        const filterExpressionWithDate = `dateRequired = :dateRequired OR ${filterExpression}`;
        const expressionAttributeValuesWithDate = {
          ':dateRequired': dateRequired,
          ...expressionAttributeValues,
        };

        // Filter for high priority tasks or all tasks
        const filterExpressionWithPriority = `priorityFlag = :priorityFlag OR ${filterExpressionWithDate}`;
        const expressionAttributeValuesWithPriority = {
          ':priorityFlag': true,
          ...expressionAttributeValuesWithDate,
        };

        const params = {
          TableName: 'tasks',
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

  return (
    <div>
      {tasks.map((task) => (
        <div key={task.taskID}>
          {task.taskName} - Priority: {task.priorityFlag ? 'High' : 'Normal'}
        </div>
      ))}
    </div>
  );
};

export default TaskTracker;
