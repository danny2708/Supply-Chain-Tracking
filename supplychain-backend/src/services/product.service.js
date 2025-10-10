/* Placeholder service - in real app, use Prisma client to persist */
const db = {}; // in-memory demo

async function getProductById(id){
  return db[id] || null;
}

async function createProductService(body){
  const { productId, name, metaCID } = body;
  db[productId] = { productId, name, metaCID, stages: [] };
  return db[productId];
}

async function addStageService(id, body){
  const { actor, description, metaCID, txHash } = body;
  const item = db[id] || { productId: id, stages: [] };
  item.stages.push({ actor, description, metaCID, txHash, createdAt: new Date() });
  db[id] = item;
  return item;
}

module.exports = { getProductById, createProductService, addStageService };
