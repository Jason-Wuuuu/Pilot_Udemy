import { randomUUID } from "crypto";

export const attachMaterialMeta = (req, res, next) => {

  if (req.params.materialId) {
    // UPDATE / DELETE
    // Identity already exists, DO NOT infer order here
    req.materialId = req.params.materialId;
    return next();
  }

  // CREATE path
  req.materialId = randomUUID();

  next();
};