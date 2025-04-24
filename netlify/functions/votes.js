const faunadb = require('faunadb');
const client = new faunadb.Client({ secret: process.env.FAUNA_KEY });
const q = faunadb.query;

exports.handler = async (event) => {
  const { gameId, voterKey } = JSON.parse(event.body);
  // Verificar voto existente
  const exists = await client.query(
    q.Exists(q.Match(q.Index('votes_by_game_and_key'), [gameId, voterKey]))
  );
  if (exists) {
    return { statusCode: 409, body: 'Ya votaste por este juego.' };
  }
  // Registrar voto
  await client.query(
    q.Create(q.Collection('votes'), { data: { gameId, voterKey, date: new Date() } })
  );
  return { statusCode: 200, body: 'Voto registrado.' };
};
