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


const { v4: uuidv4 } = require('uuid');

const task = {
    ownerId: "Jono",
    dateCreated: new Date().toISOString(),
    taskId: uuidv4(),
    parentTaskId: uuidv4(),
    taskName: 'Task To Do Today #2',
    priorityFlag: true,
    toughnessFlag: false,
    dateRequired: new Date('2023-06-15').toISOString(),
    //dateCompleted: new Date('2023-06-09').toISOString(),
};

const params = {
    TableName: 'tasks',
    Item: task,
};

const insertItem = async () => {

    dynamodb.put(params, (err, data) => {
    if (err) {
        console.error('Error inserting task:', err);
    } else {
        console.log('Task inserted successfully:', data);
    }
    });
};

insertItem();

//run on cmd line by typing node tableInsert.js
//https://eu-west-2.console.aws.amazon.com/dynamodbv2/home?region=eu-west-2#item-explorer?table=tasks