const getResponse = ({ statusCode, body }, callback) => callback(null, {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Accept'
    },
    body: JSON.stringify(body),
    isBase64Encoded: false
});


module.exports = {
  getResponse
}