'use strict';
const AWS = require('aws-sdk');
const { uuid } = require('uuidv4');
// Configure AWS Access - Make sure your IAM role has full SNS Access
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'AKIAT2BKFVF77JYBDYXB', /* Insert your IAM AWS Access Key Id */
  secretAccessKey: '5ZJRBEQfMFptvomWucyKdH7QwaT9c0KLDgqCvK+t', /* Insert your IAM AWS Secret Key */
});
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });

module.exports.publishMessage = async (event) => {
  const body = JSON.parse(event.body);
  const correlationId = uuid();
  const payload = {
    ...body,
    correlationId
  }
  // Note the request body is received as a serialized string under event.body
  const params = {
    Message: JSON.stringify(payload), /* required */
    TopicArn: 'arn:aws:sns:us-east-1:262081456511:team-2-orders', /* Insert your SNS Topic ARN */
  };

  // Publish message to SNS topic
  await sns.publish(params).promise();

  return {
    statusCode: 200,
    body: correlationId,
  };
};

