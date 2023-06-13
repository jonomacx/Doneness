import React, { useEffect, useState } from 'react';

const AWS = require('aws-sdk'),
      {
        DynamoDB
      } = require("@aws-sdk/client-dynamodb");

AWS.config.update({
  region: 'eu-west-2',
  accessKeyId: 'AKIA5GUIGRJ7MRUV4AWG',
  secretAccessKey: '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',
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

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
