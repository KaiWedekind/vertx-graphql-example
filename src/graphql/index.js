const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    welcome: () => 'Welcome to Vert.x GraphQL!'
  },
  Mutation: {
    createMessage: ({ input }, context) => {
      return {
        id: 123,
        content: 'Content XYZ',
        author: 'Me'
      }
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
`;

const context = {}

module.exports = {
  resolvers,
  typeDefs,
  context
}
