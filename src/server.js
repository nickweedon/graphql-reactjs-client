/* eslint import/no-unresolved: [2, { ignore: ['./assets'] }] */
/* eslint import/extensions: 0 */

import 'babel-polyfill';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressJwt from 'express-jwt';
import expressGraphQL from 'express-graphql';
import jwt from 'jsonwebtoken';
import PrettyError from 'pretty-error';
import amqp from 'amqplib';
import passport from './core/passport';
import schema from './data/schema';
import { port, auth, analytics } from './config';

// noinspection JSFileReferences
import assets from './assets';

const server = global.server = express();

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
server.use(express.static(path.join(__dirname, 'public')));
server.use(cookieParser());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

//
// Authentication
// -----------------------------------------------------------------------------
// noinspection JSUnusedGlobalSymbols
server.use(expressJwt({
  secret: auth.jwt.secret,
  credentialsRequired: false,
  /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
  getToken: req => req.cookies.id_token,
  /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
}));
server.use(passport.initialize());

server.get('/login/facebook',
  passport.authenticate('facebook', {
    scope: ['email', 'user_location'],
    session: false,
  }));

server.get('/login/facebook/return',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const expiresIn = 60 * 60 * 24 * 180; // 180 days
    const token = jwt.sign(req.user, auth.jwt.secret, { expiresIn });
    res.cookie('id_token', token, { maxAge: 1000 * expiresIn, httpOnly: true });
    res.redirect('/');
  });

//
// Register API middleware
// -----------------------------------------------------------------------------
// noinspection ES6ModulesDependencies
server.use('/graphql', expressGraphQL(req => ({
  schema,
  graphiql: true,
  rootValue: { request: req },
  pretty: process.env.NODE_ENV !== 'production',
})));

const ACTION_QUEUE = 'strength-tailor-action';
const RESPONSE_QUEUE = 'strength-tailor-action-response';
const ACTION_EXCHANGE = 'strength-tailor-exchange';

function getResponseQueueName(uuid) {
  if (uuid === undefined) {
    return RESPONSE_QUEUE;
  }
  return `${RESPONSE_QUEUE}_${uuid}`;
}

function assertActionExchange(channel) {
  channel.assertExchange(ACTION_EXCHANGE, 'direct', { durable: false, autoDelete: true });
}

async function assertActionQueue(channel) {
  return await channel.assertQueue(ACTION_QUEUE, { exclusive: false, durable: false, autoDelete: true });
}

async function assertResponseQueue(channel, uuid) {
  return await channel.assertQueue(getResponseQueueName(uuid), { exclusive: false, durable: false, autoDelete: true });
}

async function getActionChannel() {
  const connection = await amqp.connect('amqp://wyvern');
  const channel = await connection.createChannel();
  assertActionExchange(channel);
  return channel;
}

async function getActionQueue() {
  const channel = await getActionChannel();
  return { channel, queue: await assertActionQueue(channel) };
}

async function getResponseQueue(uuid) {
  const channel = await getActionChannel();
  return { channel, queue: await assertResponseQueue(channel, uuid) };
}

server.post('/action', async (req, res) => {
  const { channel, queue } = await getActionQueue();

  channel.sendToQueue(
    queue.queue,
    new Buffer(JSON.stringify({
      type: req.body.type,
      request: req.body.request,
    })),
    { replyTo: getResponseQueueName(req.body.uuid) });
  res.status(200);
  res.send('OK');
});


async function getQueueMessage(req, res, clientState, queueInfo, retryCount, waitInterval) {

  if (clientState.isRunning === false) {
    return;
  }

  if (retryCount === 0) {
    res.status(204).send('[]');
    return;
  }

  const msg = await queueInfo.channel.get(queueInfo.queue.queue, { noAck: true });
  if (msg === false) {
    setTimeout(() => {
      getQueueMessage(req, res, clientState, queueInfo, retryCount - 1, waitInterval);
    }, waitInterval);
    return;
  }
  console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());

  res.status(200).send(`[${msg.content}]`);
}

server.get('/response', async (req, res) => {

  const clientState = { isRunning: true };

  req.on('close', () => {
    console.log('Client closed the connection');
    clientState.isRunning = false;
  });

  const queueInfo = await getResponseQueue(req.query.uuid);
  getQueueMessage(req, res, clientState, queueInfo, 50, 100);
});

/*
server.get('/response', async (req, res) => {
  //const CONSUMER_TAG = 'sta';

  const conn = await amqp.connect('amqp://wyvern');

  const ch = await conn.createChannel();

  ch.assertExchange(ACTION_EXCHANGE, 'direct', { durable: true });

  const q = await ch.assertQueue(RESPONSE_QUEUE, { exclusive: false });
  console.log('Retrieving response...');

  // Cancel any previous call
  console.log('Cancelling: ' + lastTag);

  await ch.cancel(lastTag);

  try {
    let serverResponse;

    serverResponse = await ch.consume(q.queue, async (msg) => {
      console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());

      res.status(200).send(msg.content);
      console.log('Cancelling: ' + serverResponse.consumerTag);
      await ch.cancel(serverResponse.consumerTag);
    }, { noAck: true });
    //}, { noAck: true, consumerTag: CONSUMER_TAG });
    lastTag = serverResponse.consumerTag;
  } catch (e) {
    console.log("Got cancelled...");
    res.status(200).send('');
  }
  console.log("Got tag: " + lastTag);

  req.on('close', async () => {
    console.log('Cancelling: ' + lastTag);
    await ch.cancel(lastTag);
    console.log('Client closed the connection');
  });
});
*/

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
server.get('*', async (req, res, next) => {
  try {
    const statusCode = 200;
    const template = require('./views/index.jade');
    const data = { title: '', description: '', css: '', body: '', entry: assets.main.js };

    if (process.env.NODE_ENV === 'production') {
      data.trackingId = analytics.google.trackingId;
    }

    res.status(statusCode);
    res.send(template(data));
  } catch (err) {
    next(err);
  }
});

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

// noinspection JSUnusedLocalSymbols
server.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.log(pe.render(err)); // eslint-disable-line no-console
  const template = require('./views/error.jade');
  const statusCode = err.status || 500;
  res.status(statusCode);
  res.send(template({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '' : err.stack,
  }));
});

//
// Launch the server
// -----------------------------------------------------------------------------
server.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`The server is running at http://localhost:${port}/`);
});
