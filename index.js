const Generador = require('@enmanuel_mag/mhwlib');
const { getResponse } = require('./utils');

exports.generate = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log('EVENT:', event);
  console.log('CONTEXT:', context);

  if (event.httpMethod.toUpperCase() === 'OPTIONS') {
    return getResponse({ statusCode: 204 }, callback);
  }

  const { header = {}, body = [] } = event;
  const xforwardedfor = header['x-forwarded-for'];
  console.log('BODY: ', body);

  if (!body.length) {
    return getResponse({
      statusCode: 400,
      body: { error: 'No body provided' }
    }, callback);
  }
  const paquetes = [];
  for (let index = 0; index < body.length; index++) {
    paquetes.push({ paquete: body[index] });
  }

  console.log('Generating schedule: ', xforwardedfor);
  const generator = new Generador(paquetes);
  
  const horarios = [];
  const { horariosGenerados = [] } = generator;
  for (let index = 0; index < horariosGenerados.length; index++) {
    horarios.push(horariosGenerados[index].materias);
  }

  return getResponse({ statusCode: 200, body: horarios }, callback);
};
