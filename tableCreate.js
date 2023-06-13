const AWS = require('aws-sdk'),
      {
        DynamoDB
      } = require("@aws-sdk/client-dynamodb");

AWS.config.update({
  region: 'eu-west-2',
  accessKeyId: 'AKIA5GUIGRJ7MRUV4AWG',
  secretAccessKey: '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',
});

const dynamodb = new DynamoDB();




const params = {
  TableName: 'tasks',
  KeySchema: [
    { AttributeName: 'ownerId', KeyType: 'HASH' }, //The partition key of an item is also known as its hash attribute, this derives from the use of an internal hash function in DynamoDB that evenly distributes data items across partitions, based on their partition key values.
    { AttributeName: 'dateCreated', KeyType: 'RANGE' }, //The sort key of an item is also known as its range attribute, this derives from the way DynamoDB stores items with the same partition key physically close together, in sorted order by the sort key value.
  ],

  AttributeDefinitions: [
    { AttributeName: 'ownerId', AttributeType: 'S' },
    { AttributeName: 'dateCreated', AttributeType: 'S' },
 /* 
    { AttributeName: 'taskId', AttributeType: 'S' },
    { AttributeName: 'parentTaskId', AttributeType: 'S' },
    { AttributeName: 'taskName', AttributeType: 'S' },
    { AttributeName: 'priorityFlag', AttributeType: 'B' },
    { AttributeName: 'toughnessFlag', AttributeType: 'B' },
    { AttributeName: 'dateRequired', AttributeType: 'S' },
    { AttributeName: 'dateCompleted', AttributeType: 'S' },
          // Additional attribute definitions if needed
*/
  ],


  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};




const createTable = async () => {

  dynamodb.createTable(params, (err, data) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Table created successfully:', data);
    }
  });

};

createTable();

//run on cmd line by typing node tableCreate.js
//https://eu-west-2.console.aws.amazon.com/dynamodbv2/home?region=eu-west-2#item-explorer?table=tasks



