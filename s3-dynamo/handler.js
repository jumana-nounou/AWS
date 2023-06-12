"use strict";
const AWS = require("aws-sdk");
var count = 1;
module.exports.processObject = async (event) => {
  try {
    const sqsRecords = event.Records;
    const messageBody = JSON.parse(sqsRecords[0].body);
    const data = {
      sku: messageBody.sku,
      name: messageBody.name,
      quantity: messageBody.quantity,
      correlationId: messageBody.correlationId,
    };
    await storeDataInDynamoDB(data);
    await storeDataInS3(data);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

async function storeDataInDynamoDB(data) {
  const dynamodb = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: "team-2",
    Item: {
      id: count,
      sku: data.sku,
      name: data.name,
      quantity: data.quantity,
      correlationId: data.correlationId,
    },
  };

  try {
    await dynamodb.put(params).promise();
    count++;
    console.log("Data stored in DynamoDB successfully");
  } catch (error) {
    console.error(`Error storing data in DynamoDB: ${error}`);
    throw error;
  }
}

async function storeDataInS3(data) {
  const s3 = new AWS.S3();
  const params = {
    Bucket: "team-2-sqs-dev-serverlessdeploymentbucket-bp487tqncjk6",
    Key: `${data.correlationId}.json`,
    Body: JSON.stringify(data),
    ContentType: "application/json; charset=utf-8",
  };

  try {
    await s3.putObject(params).promise();
    console.log("Data stored in S3 successfully");
  } catch (error) {
    console.error(`Error storing data in S3: ${error}`);
    throw error;
  }
}
