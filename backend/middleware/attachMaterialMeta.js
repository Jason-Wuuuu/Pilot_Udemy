
export const attachMaterialMeta = (req, res, next) => {

  if (req.params.materialId) {
    // UPDATE / DELETE
    // Identity already exists, DO NOT infer order here
    req.materialId = req.params.materialId;
    return next();
  }

  // CREATE path
  const materialOrder = Date.now(); // server-generated, monotonic
  const materialId = String(materialOrder);

  req.materialOrder = materialOrder;
  req.materialId = materialId;

  next();
};