'use strict';
const AWS = require("aws-sdk");
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
// const dynamo = new AWS.DynamoDB.DocumentClient();


// module.exports.updateItem = async (event) => {
//   console.log(event)
//   var parse = JSON.parse(event.body)
//   console.log(parse)

//   try {
//     let id = event.queryStringParameters ? event.queryStringParameters.id : 1
//     var sku = parse.sku;
//     var name = parse.name;
//     var quantity = parse.quantity;
//     var tableName = "team-2";

//     var item = {
//       "sku": sku,
//       "name": name,
//       "quantity": quantity
//     };

//     var params = {

//       TableName: tableName,
//       Key: {
//         id: Number(id)
//       },
//       Item: item
//     };
//     console.log(params);

//     const updatedItem =  dynamo.update(params, function (err, data) {
//       return {
//         statusCode: 200,
//         body: JSON.stringify(updatedItem.Attributes)
//       };

//     })
//   }
//   catch (error) {
//     console.error(error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: 'An error occurred while updating the item in DynamoDB.' })
//     };
//   }
// };


const dynamo = new AWS.DynamoDB.DocumentClient();
module.exports.updateItem = async (event) => {

  console.log(event)
  let id = event.queryStringParameters ? event.queryStringParameters.id : 1
  var parse = JSON.parse(event.body)
  var sku = parse.sku;
  var name = parse.name;
  var quantity = parse.quantity;


  //var tableName = "team-2";

  // var item = {
  //   "sku": sku,
  //   "name": name,
  //   "quantity": quantity
  // };

  const params = {
    TableName: 'team-2',
    Key: {
      id: Number(id)
    },
    UpdateExpression: 'SET #sku = :sku, #name = :name, #quantity = :quantity',
    ExpressionAttributeNames: {
      '#sku': 'sku',
      '#name': 'name',
      '#quantity': 'quantity'
    },
    ExpressionAttributeValues: {
      ':sku': sku,
      ':name': name,
      ':quantity': quantity
    },
    ReturnValues: 'ALL_NEW'
  };

  console.log(params)

  try {
    const result = await dynamo.update(params).promise();
    console.log(result);


    const params2 = {
      Subject: "Product Update",
      Message: JSON.stringify(result), /* required */
      TopicArn: 'arn:aws:sns:us-east-1:262081456511:team-2-orders', /* Insert your SNS Topic ARN */
    };


    if (result.Attributes) {
      await sns.publish(params2).promise();
      return {
        statusCode: 200,
        body: JSON.stringify(result.Item)
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Order not found' })
      };
    }
  } catch (error) {
    console.error('Error retrieving order:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }



}

