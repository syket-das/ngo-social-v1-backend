const { db } = require('../../utils/db');

const allCategories = () => {
  return db.category.findMany();
};

const createCategory = (category) => {
  return db.category.create({
    data: {
      ...category,
    },
  });
};

module.exports = {
  allCategories,
  createCategory,
};
