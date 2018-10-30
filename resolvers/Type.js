const { GraphQLScalarType } = require('graphql')

module.exports = {

  Book: {
    async people (parent, args, { dgraphClient,dataloader }, info) {
       return await dataloader.people.load(parent.uid)
     }
  },

  Person: {
    async affiliations (parent, args, { dgraphClient,dataloader }, info) {
       return await dataloader.affiliations.load(parent.uid)
     }
  },

  DateTime: new GraphQLScalarType({
      name: 'DateTime',
      description: 'A valid date time value.',
      parseValue: value => new Date(value),
      serialize: value => new Date(value).toISOString(),
      parseLiteral: ast => ast.value
    })
}
