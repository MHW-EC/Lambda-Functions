const { Generador } = require('@enmanuel_mag/mhwlib');
const { v4 } = require('uuid');
const { getResponse } = require('./utils');

exports.generate = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log('EVENT:', event);
  console.log('CONTEXT:', context);

  if (event.httpMethod.toUpperCase() === 'OPTIONS') {
    return getResponse({ statusCode: 204 }, callback);
  }

  const { header = {}, body:  {
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
