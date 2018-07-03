'use strict';

const querystring = require('querystring');
const Producer = require('sqs-producer');
const timestamp = new Date().getTime();
const stage = process.env.STAGE;
const origins = require('./../config/origins');

// Lambda function that logs a single view of a node.
const logView = (event, context, callback) => {

  // Check origin of the request and ensure it's coming from our Drupal site.
  // if (!origins[stage].includes(event.headers.origin)) {
  //   console.error('Validation Failed', event.body);
  //   callback(null, {
  //     statusCode: 401,
  //     headers: { 'Content-Type': 'application/json' },
  //     body: 'You are not authorized to access this endpoint.',
  //   });
  //   return;
  // }

  // Check to ensure that the body of the request is a string.
  if (typeof event.body !== 'string') {
    console.error('Validation Failed', event.body);
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: 'Couldn\'t log content view.',
    });
    return;
  }

  const viewData = querystring.parse(event.body);

  // Check structure of viewData to ensure it is correct.
  if (typeof viewData.drupalNid === 'undefined' || typeof viewData.userId === 'undefined' || typeof viewData.contactId === 'undefined' || typeof viewData.viewedAt === 'undefined') {
    console.error('Validation Failed, object structure is incorrect', viewData);
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: 'Couldn\'t log content view. Incorrect data format.',
    });
    return;
  }

  // Create the producer that we use to send messages to SQS Queue.
  const producer = Producer.create({
    queueUrl: process.env.sqs_url,
    region: process.env.REGION
  });

  // Send messages to the queue.
  producer.send([{
    id: timestamp.toString(),
    body: JSON.stringify(viewData)
  }], function(err) {
    if (err) {
      console.error(err);
    }
  });

  const response = {
    statusCode: 200,
    body: JSON.stringify(viewData),
  };
  callback(null, response);
};

module.exports = {
  logView
};
