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

const params = {
    TableName: 'tasks', // Replace with your table name
    Key: {
      ownerId: 'Jono', // Replace with the partition key value of the item to fetch
      dateCreated: '2023-06-13T11:30:42.167Z', // Replace with the sort key value of the item to fetch
    },
  };

dynamodb.get(params, function (error, data) {
    if (error) {
      console.error('Error fetching item:', error);
    } else {
      console.log('Fetched item:', data.Item);
    }
  });


//run on cmd line by typing node tableGet.js
//https://eu-west-2.console.aws.amazon.com/dynamodbv2/home?region=eu-west-2#item-explorer?table=tasks



//difference between getitem scan or query:
//https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SQLtoNoSQL.ReadData.html

