export const CATEGORY_ENTITY = "CATEGORY";
export const CATEGORY_METADATA_SK = "METADATA";

export const buildCategoryPK = (categoryId) =>
  `CATEGORY#${categoryId}`;

export const buildCategoryItem = ({
  categoryId,
  categoryName,
  description,
  isActive = true,
}) => {
  const now = new Date().toISOString();

  return {
    PK: buildCategoryPK(categoryId),
    SK: CATEGORY_METADATA_SK,

    entityType: CATEGORY_ENTITY,

    categoryId,
    categoryName,
    description,

    isActive,
    createdAt: now,
  };
};
