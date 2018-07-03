'use strict';

const Consumer = require('sqs-consumer');

// Example Lambda function that consumes SQS queue of Learning Center views.
const logConsume = (event, context, callback) => {
  let message = '';
  let responseData = [];
  const setResponseData = (data) => {
    responseData.push(data);
  };
  const consumer = Consumer.create({
    queueUrl: process.env.sqs_url,
    batchSize: 5,
    waitTimeSeconds: 20,
    handleMessage: (message, done) => {
      setResponseData(message);
      done();
    }
  });
  consumer.on('error', (err) => {
    console.error('err.message', err.message);
  });
  consumer.on('processing_error', (err) => {
    console.error('processing_error err.message', err.message);
  });
  const stopped = function stopped() {
    message = 'Processed ' + responseData.length + ' messages.';
    if (responseData.length < 1) {
      message = 'Queue was empty.';
    }
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        message: message,
        data: responseData
      })
    });

    consumer.stop();
  };
  const empty = function empty() {
    consumer.stop();
  };
  consumer.start();
  consumer.on('empty', empty);
  consumer.on('stopped', stopped);
};

module.exports = {
  logConsume
};
