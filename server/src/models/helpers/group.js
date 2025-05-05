function groupAndNest(resRows, primaryKey, nestKey, keysToNest) {
  return Object.values(resRows.reduce((acc, current) => {
    const groupKey = current[primaryKey];

    // initialize top-level data
    if (!acc[groupKey]) {
      // copy only non-nested fields
      const baseData = { ...current };
      keysToNest.forEach(key => delete baseData[key]);

      acc[groupKey] = {
        ...baseData,
        [nestKey]: []
      };
    }

    // skip nesting if all values to nest are null
    const allNull = keysToNest.every(key => current[key] === null);
    if (!allNull) {
      const nestedItem = {};
      keysToNest.forEach(key => {
        nestedItem[key] = current[key];
      });
      acc[groupKey][nestKey].push(nestedItem);
    }

    return acc;
  }, {}));
}

module.exports = { groupAndNest };
