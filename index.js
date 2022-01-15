const { Generador, Reader } = require('@enmanuel_mag/mhwlib');
const { getResponse } = require('./utils');
const mongoose = require('mongoose');

exports.generate = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log('EVENT:', event);
  console.log('CONTEXT:', context);

  if (event.httpMethod.toUpperCase() === 'OPTIONS') {
    return getResponse({ statusCode: 204 }, callback);
  }

  const { header = {}, body: {
    payload = [],
    uuid,
  } } = event;
  const xforwardedfor = header['x-forwarded-for'];
  console.log('BODY: ', payload);

  if (!payload.length) {
    return getResponse(
      {
        statusCode: 400,
        body: { error: 'No body provided' },
      },
      callback
    );
  }
  const paquetes = [];
  for (let index = 0; index < payload.length; index++) {
    paquetes.push({ paquete: payload[index] });
  }

  console.log('Generating schedule: ', xforwardedfor);
  const generator = new Generador(uuid, paquetes);
  return generator.generarHorarios((err) => {
    if (err) {
      return getResponse(
        {
          statusCode: 500,
          body: { error: err },
        },
        callback
      );
    }
    return getResponse(
      {
        statusCode: 200,
        body: uuid,
      },
      callback
    );
  });
  /* const horarios = [];
  const { horariosGenerados = [] } = generator;
  for (let index = 0; index < horariosGenerados.length; index++) {
    horarios.push(horariosGenerados[index].materias);
  }

  return getResponse({ statusCode: 200, body: horarios }, callback); */
};

// exports.read = async (event, context, callback) => {
//   //context.callbackWaitsForEmptyEventLoop = false;
//   console.log('EVENT:', event);
//   console.log('CONTEXT:', context);

//   if (event.httpMethod.toUpperCase() === 'OPTIONS') {
//     return getResponse({ statusCode: 204 }, callback);
//   }

//   const {
//     body
//   } = event;
//   console.log('BODY: ', body);

//   if (!Object.keys(body).length) {
//     return getResponse(
//       {
//         statusCode: 400,
//         body: {
//           error: 'No body provided'
//         },
//       },
//       callback
//     );
//   }
//   return Reader.getResourceDataByCb(body, (err, response) => {
//     if (err){
//       console.log(err);
//       return getResponse(
//         {
//           statusCode: 500,
//           body: {
//             err
//           },
//         },
//         callback
//       );
//     };
//     console.log(response);
//     return getResponse(
//       {
//         statusCode: 200,
//         body: response,
//       },
//       callback
//     );
//   })
 
// };


let conn = null;

const uri = 'mongodb+srv://josue:lospajaroscantanmientraslospecesnadan@heroku-28zqn5s2.htt13.mongodb.net/heroku_28zqn5s2?retryWrites=true&w=majority';

exports.read = async function(event, context) {
  // Make sure to add this so you can re-use `conn` between function calls.
  // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
  context.callbackWaitsForEmptyEventLoop = false;

  // Because `conn` is in the global scope, Lambda may retain it between
  // function calls thanks to `callbackWaitsForEmptyEventLoop`.
  // This means your Lambda function doesn't have to go through the
  // potentially expensive process of connecting to MongoDB every time.
  if (conn == null) {
    conn = mongoose.createConnection(uri, {
      // and tell the MongoDB driver to not wait more than 5 seconds
      // before erroring out if it isn't connected
      serverSelectionTimeoutMS: 5000
    });
    
    // `await`ing connection after assigning to the `conn` variable
    // to avoid multiple function calls creating new connections
    await conn;
    conn.model('Carrera', new mongoose.Schema({nombre: {
      type: String,
    }}));
  }

  const M = conn.model('Carrera');

  const doc = await M.find();
  console.log(doc);

  return doc;
};