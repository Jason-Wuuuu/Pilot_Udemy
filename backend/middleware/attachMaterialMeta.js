export const attachMaterialMeta = (req, res, next) => {
  const rawMaterialId = req.params.materialId;

  if (!rawMaterialId) {
    return next(new Error("materialId is required"));
  }

  const materialOrder = Number(rawMaterialId.trim());

  if (Number.isNaN(materialOrder)) {
    return next(new Error("materialId must be a number (materialOrder)"));
  }

  req.materialOrder = materialOrder;

  next();
};
