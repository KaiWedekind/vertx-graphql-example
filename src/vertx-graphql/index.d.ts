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

import { Router } from '@vertx/web';
import { EventBus, WebSocket } from '@vertx/core';
import { HttpServerOptions } from '@vertx/core/options';

interface Tab {
  endpoint?: string,
  query?: string
}

interface GraphQLServerOptions {
  typeDefs: string,
  resolvers: object,
  context?: object,
  playground?: {
    settings?: {
      'editor.theme'?: string,
    },
    tabs?: Array<Tab>
  },
  introspection?: boolean,
  graphiql?: {
    settings?: {
      'editor.theme'?: string,
    },
    defaultQuery?: string,
  },
  onConnect?: (websocket: WebSocket, context: ConnectionContext) => void
  onDisconnect?: (websocket: WebSocket, context: ConnectionContext) => void
}

interface GraphQLMiddlewareOptions {
  app: Router,
  path?: string
}

export class GraphQLServer {
  constructor(options: GraphQLServerOptions): void;

  public graphqlPath: string;
  public subscriptionsPath: string;

  applyMiddleware(options: GraphQLMiddlewareOptions): void
  setSubscriptionOptions(options: HttpServerOptions): HttpServerOptions
  installSubscriptionHandlers(app: Router): Router
}

interface PubSubEngine {
  publish(triggerName: string, payload: any): Promise<void>;
  subscribe(triggerName: string, onMessage: Function, options: Object): Promise<number>;
  unsubscribe(subId: number);
  asyncIterator<T>(triggers: string | string[]): AsyncIterator<T>;
}

interface EventEmitter extends EventBus {}

interface PubSubOptions {
  eventEmitter?: EventEmitter;
}

export class PubSub implements PubSubEngine {
  protected ee: EventEmitter;
  private subscriptions: { [key: string]: [string, (...args: any[]) => void] };
  private subIdCounter: number;

  constructor(options: PubSubOptions = {}): void;

  public publish(triggerName: string, payload: any): Promise<void>;
  public subscribe(triggerName: string, onMessage: (...args: any[]) => void): Promise<number>;
  public unsubscribe(subId: number): void;
  public asyncIterator<T>(triggers: string | string[]): AsyncIterator<T>;
}
