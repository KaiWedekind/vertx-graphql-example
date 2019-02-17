import { PubSub } from '../vertx-graphql';

const pubsub = new PubSub();

const MESSAGE_CREATED = 'message_created';
const NEW_MESSAGE = 'new_message';

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    welcome: () => 'Welcome to Vert.x GraphQL!'
  },
  Mutation: {
    createMessage: ({ input }, context) => {
      const message = {
        id: 123,
        content: 'Content XYZ',
        author: 'Me'
      }

      pubsub.publish(MESSAGE_CREATED, { messageCreated: message })

      return message;
    }
  },
  Subscription: {
    messageCreated: {
      subscribe: pubsub.asyncIterator([MESSAGE_CREATED])
    },
    newMessage: {
      subscribe: pubsub.subscribe(MESSAGE_CREATED)
      
      //pubsub.asyncIterator([NEW_MESSAGE])
    }
  }
};

const typeDefs = `
  input MessageInput {
    content: String
    author: String
  }

  type Message {
    id: ID!
    content: String
    author: String
  }

  type Query {
    hello: String
    welcome: String
  }

  type Mutation {
    createMessage(input: MessageInput): Message
  }

  type Subscription {
    messageCreated: Message
    newMessage: Message
  }
`;

const context = {}

module.exports = {
  resolvers,
  typeDefs,
  context
}
