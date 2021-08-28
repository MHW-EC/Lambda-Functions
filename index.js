const Generador = require('./serverModules/Generador');
const { getResponse } = require('./utils')

exports.generate = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log('EVENT:', event);
  console.log('CONTEXT:', context);

  if (event.httpMethod.toUpperCase() === 'OPTIONS') {
    return getResponse({ statusCode: 204 }, callback);
  }

  const { header = {}, body } = event;
  const xforwardedfor = header['x-forwarded-for'];
  console.log('BODY: ', body);

  if (!body) {
    return getResponse({
      statusCode: 400,
      body: { error: 'No body provided' }
    }, callback);
  }

  console.log('Generating schedule: ', xforwardedfor);
  const generator = new Generador(body.map((paquete) => ({ paquete })));

  return getResponse({
    statusCode: 200,
    body: generator.HorariosGenerados.map((horario) => horario.materias)
  }, callback);

};
