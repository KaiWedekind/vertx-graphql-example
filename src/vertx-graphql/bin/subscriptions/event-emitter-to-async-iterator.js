/*
 * Copyright 2018 vertx-graphql
 *
 * Vertx-GraphQL licenses this file to you under the Apache License, version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License.  You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

import { $$asyncIterator } from 'iterall';

function eventEmitterAsyncIterator(eventEmitter, eventsNames) {
  const pullQueue = [];
  const pushQueue = [];
  const eventsArray = typeof eventsNames === 'string' ? [eventsNames] : eventsNames;
  let listening = true;
  let addedListeners = false;

  eventEmitter.consumer(eventsNames[0], (message) => {
    console.log('message', message.body())
  })

  const pushValue = event => {
    if (pullQueue.length !== 0) {
      pullQueue.shift()({ value: event, done: false });
    } else {
      pushQueue.push(event);
    }
  };

  const pullValue = () => {
    return new Promise(resolve => {
      if (pushQueue.length !== 0) {
        resolve({ value: pushQueue.shift(), done: false });
      } else {
        pullQueue.push(resolve);
      }
    });
  };

  const emptyQueue = () => {
    if (listening) {
      listening = false;
      if (addedListeners) { removeEventListeners(); }
      pullQueue.forEach(resolve => resolve({ value: undefined, done: true }));
      pullQueue.length = 0;
      pushQueue.length = 0;
    }
  };

  const addEventListeners = () => {
    for (const eventName of eventsArray) {
      eventEmitter.consumer(eventName, pushValue);
    }
  };

  const removeEventListeners = () => {
    for (const eventName of eventsArray) {
      // eventEmitter.removeListener(eventName, pushValue);

      eventEmitter.unregister(eventName, (res, err) => {
        if (!err) {
          console.log("The handler un-registration has reached all nodes");
        } else {
          console.log("Un-registration failed!");
        }
      });
    }
  };

  // console.log('eventEmitter', eventEmitter)
  // console.log('eventsNames', eventsNames)

  return {
    next() {
      console.log('NEXT')
      if (!listening) { return this.return(); }
      if (!addedListeners) {
        addEventListeners();
        addedListeners = true;
      }
      return pullValue();
    },
    return() {
      console.log('RETURN')
      emptyQueue();

      return Promise.resolve({ value: undefined, done: true });
    },
    throw(error) {
      console.log('throw', error)
      emptyQueue();

      return Promise.reject(error);
    },
    [$$asyncIterator]() {
      console.log('asyncIterator')
      return this;
    },
  };
}

module.exports = {
  eventEmitterAsyncIterator
}
