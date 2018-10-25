const {
    parseResolveInfo,
    simplifyParsedResolveInfoFragmentWithType
} = require('graphql-parse-resolve-info');

module.exports = {
  async allBooks(parent, args, { dgraphClient }, info) {
    //const parsedResolveInfoFragment = parseResolveInfo(info)
    //simplifyParsedResolveInfoFragmentWithType(parsedResolveInfoFragment, graphQLType)

    const query = `
    {
      me(func: has(book)) {
        uid
        expand(_all_)
      }
    }
    `
    const res = await dgraphClient.newTxn().query(query);
    return res.getJson().me
  }
}
