const AWS = require('aws-sdk'),
      {
        DynamoDB
      } = require("@aws-sdk/client-dynamodb");

AWS.config.update({
  region: 'eu-west-2',
  accessKeyId: 'AKIA5GUIGRJ7MRUV4AWG',
  secretAccessKey: 'wdDh1lDM7XgBnsAm4yNOAFnBau19E062KCnA27q7',
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

//const taskNameConst = "Sample Task2";
//const filterExpression = `attribute_not_exists(taskName) OR taskName = :`;
//const filterExpression = `taskName = :${taskNameConst}`;
//const expressionAttributeValues = {
//    ':taskName': taskNameConst,
//};

/*
// Filter and do not show completed tasks
const filterExpression = 'attribute_not_exists(dateCompleted)';
const expressionAttributeValues = {
    ':dateCompleted': null,
};

// Filter for today's date or all tasks
const requiredCompletionDate = new Date().toISOString().split('T')[0];
const filterExpressionWithDate = `dateRequired = '${requiredCompletionDate}' OR ${filterExpression}`;
const expressionAttributeValuesWithDate = {
    ':dateRequired': requiredCompletionDate,
    ...expressionAttributeValues,
};

// Filter for high priority tasks or all tasks
const highPriority = "true"
const filterExpressionWithPriority = `priorityFlag = ${highPriority} OR ${filterExpressionWithDate}`;
const expressionAttributeValuesWithPriority = {
    ':priorityFlag': highPriority,
    ...expressionAttributeValuesWithDate,
};

const params = {
    TableName: 'tasks',
    FilterExpression: filterExpression,//filterExpressionWithPriority,
    ExpressionAttributeValues: expressionAttributeValues,//expressionAttributeValuesWithPriority,
};
*/

const requiredCompletionDate = new Date().toISOString().split('T')[0]+ 'T00:00:00.000Z';
const params = {
    TableName: 'tasks',
    FilterExpression: "dateRequired = :requireDt AND ownerId = :owner",
    ExpressionAttributeValues: {
        ":requireDt": `${requiredCompletionDate}`,
        ":owner": `Jono`,
    }
};

console.log(params)
//console.log(ExpressionAttributeValues)

dynamodb.scan(params, function (error, data) {
    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      console.log('Fetched item:', data.Items[0]);

      //console.log('Fetched item:', data.Item);
    }
  });


/*
const fetchTasks = async () => {
    const result = await dynamodb.scan(params).promise();
    setTasks(result.Items);
    console.log(result.Items);
}; try { } catch (error) {
    console.error('Error retrieving tasks:', error);
}
*/

//fetchTasks();

//run on cmd line by typing node tableGet.js
//https://eu-west-2.console.aws.amazon.com/dynamodbv2/home?region=eu-west-2#item-explorer?table=tasks

