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

/// <reference types="@vertx/core" />

import { eventEmitterAsyncIterator } from './event-emitter-to-async-iterator';
const EventEmitter = vertx.eventBus;

class PubSub {
  constructor(options = {}) {
    this.ee = options.eventEmitter || EventEmitter();
    this.subscriptions = {};
    this.subIdCounter = 0;
  }

  publish(triggerName, payload) {
    console.log('publish triggerName', triggerName)
    this.ee.publish(triggerName, {
      type: "data",
      id: "1",
      payload: {
        data: payload
      }
    });
    return Promise.resolve();
  }

  subscribe(triggerName) {
    return (onMessage) => {
      console.log('subscribe', triggerName)
      this.ee.consumer(triggerName, (message) => {
        console.log('body', message.body());
        onMessage(JSON.stringify(message.body()))
      });
      this.subIdCounter = this.subIdCounter + 1;
      this.subscriptions[this.subIdCounter] = [triggerName, onMessage];

      return Promise.resolve(this.subIdCounter);
    }
  }

  unsubscribe(subId) {
    const [triggerName, onMessage] = this.subscriptions[subId];
    delete this.subscriptions[subId];
    this.ee.unregister(triggerName, (res, err) => {
      if (!err) {
        console.log("The handler un-registration has reached all nodes");
      } else {
        console.log("Un-registration failed!");
      }
    });
    // this.ee.removeListener(triggerName, onMessage);
  }

  asyncIterator(triggers) {
    return eventEmitterAsyncIterator(this.ee, triggers);
  }
}

module.exports = {
  PubSub
}


/*
        console.log('localAddress', this.websocket.localAddress())
        console.log('path', this.websocket.path())
        console.log('remoteAddress', this.websocket.remoteAddress())

        this.websocket.handler((socket) => {
          console.log('new socket', socket)
        });
        */

        /*
        const text = JSON.stringify({
          type: "data",
          id: "1",
          payload: {
            data: {
              messageCreated: "Test"
            }
          }
        })

        const text2 = JSON.stringify({
          type: "data",
          id: "1",
          payload: {
            data: {
              newMessage: "Test new Message"
            }
          }
        })

        setInterval(() => {
          websocket.writeFinalTextFrame(text);
        }, 1000)

        setInterval(() => {
          websocket.writeFinalTextFrame(text2);
        }, 2000)
        */