//1. Require 'Apollo Server'
const {ApolloServer} = require('apollo-server')

const typeDefs = `
  type Query {
    totalBooks: Int!
  }

  type Mutation {
    postBook(book_guid: String!, book_doi: String!,book_title: String!): Boolean!
  }
`

//Store data in memory for now
var books = []

const resolvers = {
  Query: {
    totalBooks: () => books.length
  },

  Mutation: {
    postBook(parent, args) {
      books.push(args)
      return true
    }
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
