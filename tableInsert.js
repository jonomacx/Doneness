
const { docClient: dynamodb } = require('./db');



const { v4: uuidv4 } = require('uuid');

const task = {
    ownerId: "Jono",
    dateCreated: new Date().toISOString(),
    //dateCompleted: new Date('2023-06-09').toISOString(),
    dateRequired: new Date('2023-06-22').toISOString(),
    taskId: uuidv4(),
    taskName: 'Tough and Priority Task 2',
    //parentOfTaskId: '<taskId of the bigger task this is part of>',
    priorityFlag: true,
    toughnessFlag: true,
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

//run on cmd line by typing "node tableInsert.js"
//https://eu-west-2.console.aws.amazon.com/dynamodbv2/home?region=eu-west-2#item-explorer?table=tasks