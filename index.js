const { Generador, Reader } = require('@enmanuel_mag/mhwlib');
const { getResponse } = require('./utils');
const { v4: uuidV4 } = require('uuid')
const AWS = require('aws-sdk');

//set config aws
AWS.config.update({
  region: 'sa-east-1',
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
});


exports.generate = (event, context, callback) => {
  console.log("RUNNING GENERATE HANDLER");
  console.log("INVOKING GENERATE ROUTINE");
  console.log({event, context});

  console.log('Keys', {
    env: process.env.SERVER_ENV,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  });

  if (event.httpMethod.toUpperCase() === 'OPTIONS') {
    return getResponse({ statusCode: 204 }, callback);
  }

  let {
    headers = {},
    body
  } = event;
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }

  console.log('Generating schedule: ', headers['X-Forwarded-For']);
  
  const uuid = uuidV4();
  console.log('UUID: ', uuid);

  const params = {
    FunctionName: 'arn:aws:lambda:sa-east-1:665407732775:function:lambda-fn-mhw-ref-prod-generateRoutine',
    InvocationType: 'Event',
    Payload: JSON.stringify({
      ...event,
      body: {
        ...event.body,
        uuid
      }
    })
  };
  
  new AWS.Lambda().invoke(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      return getResponse(
        {
          statusCode: 400,
          body: { 
            error: err.name || err.message || 'Unknown error'
          },
        },
        callback
      );
    }
    
    console.log('Data from invoke: ', data);
    return getResponse(
      {
        statusCode: 200,
        body: {
          uuid
        },
      },
      callback
    );
  });
  
};

exports.generateRoutine = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log({event, context});

  if (event?.httpMethod?.toUpperCase() === 'OPTIONS') {
    return getResponse({ statusCode: 204 }, callback);
  }

  let {
    body
  } = event;

  if (typeof body === 'string') {
    body = JSON.parse(body);
  }

  const { 
    payload, uuid 
  } = body;

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

  return new Generador(uuid, paquetes)
    .generarHorarios((err) => {
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
          error: error.name || error.message || 'Unknown error'
        },
      },
      callback
    );
  }
 
};