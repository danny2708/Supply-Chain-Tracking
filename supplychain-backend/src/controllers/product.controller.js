const { getProductById, createProductService, addStageService } = require('../services/product.service');

exports.getProduct = async (req, res) => {
  const id = req.params.id;
  const p = await getProductById(id);
  res.json(p || { productId: id, history: [] });
};

exports.createProduct = async (req, res) => {
  const body = req.body;
  const r = await createProductService(body);
  res.json(r);
};

exports.addStage = async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const r = await addStageService(id, body);
  res.json(r);
};
