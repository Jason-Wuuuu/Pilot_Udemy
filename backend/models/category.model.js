export const buildCategoryPK = (categoryId) =>
  `CATEGORY#${categoryId}`;

export const buildCategoryItem = ({
  categoryId,
  categoryName,
  description
}) => ({
  PK: buildCategoryPK(categoryId),
  SK: "METADATA",
  categoryId,
  categoryName,
  description,
  isActive: true,
  createdAt: new Date().toISOString(),
  entityType: "CATEGORY"
});
