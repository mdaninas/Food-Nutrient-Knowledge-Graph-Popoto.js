var driver = neo4j.driver(
  "bolt://localhost:7687", 
  neo4j.auth.basic("neo4j", "1234QWER@")
);

popoto.runner.DRIVER = driver;
popoto.result.onTotalResultCount(function (count) {
  document.getElementById("result-total-count").innerHTML = "(" + count + ")";
});

popoto.provider.node.Provider = {
  Food: {
    returnAttributes: [
      "name",
      "protein",
      "rating",
      "fat",
      "cook_time",
      "carb",
      "calories",
      "capital",
      "latitude",
      "longitude",
    ],
    constraintAttribute: "name",
    autoExpandRelations: true,
  },
  Category: {
    returnAttributes: ["name"],
    constraintAttribute: "name",
  },
  Cuisine: {
    returnAttributes: ["name"],
    constraintAttribute: "name",
  },
  HalalStatus: {
    returnAttributes: ["name"],
    constraintAttribute: "name",
  },
  Ingredient: {
    returnAttributes: ["name"],
    constraintAttribute: "name",
  },
  Nutrient: {
    returnAttributes: ["name"],
    constraintAttribute: "name",
  },
  Type: {
    returnAttributes: ["name"],
    constraintAttribute: "name",
  },
  VeganStatus: {
    returnAttributes: ["name"],
    constraintAttribute: "name",
  },
};

popoto.start("Food");
