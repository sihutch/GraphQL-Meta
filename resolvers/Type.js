const { GraphQLScalarType } = require('graphql')

module.exports = {

  Book: {
    async people (parent, args, { dgraphClient }, info) {
      const query =
      `query me($bookId: string) {
          me(func: uid($bookId)) {
            people {
            uid
            expand(_all_)
            }
          }
       }`
       const vars = {$bookId: parent.uid};
       const res = await dgraphClient.newTxn().queryWithVars(query, vars);
       return res.getJson().me[0].people
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
