const { Generador, Reader } = require('@enmanuel_mag/mhwlib');
const { getResponse } = require('./utils');
const AWS = require('aws-sdk');

exports.generate = (event, context, callback) => {
  console.log("RUNNING GENERATE HANDLER");
  console.log("INVOKING GENERATE ROUTINE");
  console.log({event, context});

  if (event.httpMethod.toUpperCase() === 'OPTIONS') {
    return getResponse({ statusCode: 204 }, callback);
  }

  var params = {
    FunctionName: 'generateRoutine',
    InvokeArgs: event
  };

  new AWS.Lambda().invokeAsync(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      return getResponse(
        {
          statusCode: 400,
          body: { 
            error: err.name
          },
        },
        callback
      );
    } else {
      console.log(data);
      return getResponse(
        {
          statusCode: 200,
          message: "OK",
        },
        callback
      );
    }
  });
  
};

exports.generateRoutine = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log({event, context});

  if (event.httpMethod.toUpperCase() === 'OPTIONS') {
    return getResponse({ statusCode: 204 }, callback);
  }

  let {
    header = {},
    body
  } = event;

  if (typeof body === 'string') {
    body = JSON.parse(body);
  }

  const { 
    payload, uuid 
  } = body;

  const xforwardedfor = header['x-forwarded-for'];
  console.log({body});

  if (!payload.length) {
    return getResponse(
      {
        statusCode: 400,
        body: { 
          error: 'No body provided' 
        },
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
}

exports.read = async function(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log('EVENT:', event);
  console.log('CONTEXT:', context);

  if (event.httpMethod.toUpperCase() === 'OPTIONS') {
    return getResponse({ statusCode: 204 }, callback);
  }

  let {
    body
  } = event;

  if (typeof body === 'string') {
    body = JSON.parse(body);
  }

  console.log('BODY: ', body);

  if (!Object.keys(body).length) {
    return getResponse(
      {
        statusCode: 400,
        body: {
          error: 'No body provided'
        },
      },
      callback
    );
  }
  console.log("Valid body");

  try{
    const resource = await Reader.getResourceData(body);
    console.log({resource});
    return getResponse(
      {
        statusCode: 200,
        body: resource,
      },
      callback
    );
  }catch(error){
    console.log(error);
    return getResponse(
      {
        statusCode: 500,
        body: {
          error
        },
      },
      callback
    );
  }
 
};