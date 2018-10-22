//1. Require 'Apollo Server'
const {ApolloServer} = require('apollo-server')

const typeDefs = `
  type Query {
      totalBooks: Int!
  }
`
const resolvers = {
  Query: {
    totalBooks: () => 42
  }
}

// 2. Create a new instance of the Server
// 3. send it an object with the type defs and resolvers
const server = new ApolloServer({
  typeDefs,
  resolvers
})

// 4. Launch the web server
server
  .listen()
  .then(({url}) => console.log('GraphQL Service running on ${url}'))
