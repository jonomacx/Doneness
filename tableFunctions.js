const AWS = require('aws-sdk');

AWS.config.update({
  region: 'eu-west-2',
  accessKeyId: 'AKIA5GUIGRJ7MRUV4AWG',
  secretAccessKey: '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',
});

const dynamodb = new AWS.DynamoDB();

const createTable = async () => {
  const params = {
    TableName: 'tasksList',
    KeySchema: [
      { AttributeName: 'PartitionKey', KeyType: 'HASH' }, // Partition key
      { AttributeName: 'SortKey', KeyType: 'RANGE' }, // Sort key (range key)
    ],
    AttributeDefinitions: [
      { AttributeName: 'PartitionKey', AttributeType: 'S' },
      { AttributeName: 'SortKey', AttributeType: 'S' },
      // Additional attribute definitions if needed
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  try {
    await dynamodb.createTable(params).promise();
    console.log('Table created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
  }
};

createTable();
