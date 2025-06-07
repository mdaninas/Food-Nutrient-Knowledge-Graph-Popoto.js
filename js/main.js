var main = new autoComplete({
  selector: "#search",
  minChars: 0,

  source: function (term, suggest) {
    const query = `
            MATCH (f:Food)-[r]->(t)
            WHERE toLower(t.name) CONTAINS $term
            RETURN DISTINCT t.name AS title, type(r) AS rel, labels(t)[0] AS label
            ORDER BY title
            LIMIT 20
        `;

    var statements = [
      {
        statement: query,
        parameters: {
          term: term.toLowerCase(),
        },
      },
    ];

    popoto.runner
      .run({ statements })
      .then(function (results) {
        var data = popoto.runner.toObject(results)[0].map(function (d) {
          return [d.title, d.rel, d.label];
        });
        suggest(data);
      })
      .catch(function (error) {
        console.error(error);
        suggest([]);
      });
  },

  renderItem: function (item, search) {
    const title = item[0];
    const rel = item[1];
    const label = item[2];

    search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    var re = new RegExp("(" + search.split(" ").join("|") + ")", "gi");

    const imagePath = popoto.provider.node.getImagePath({
      label: label,
      type: popoto.graph.node.NodeTypes.VALUE,
      attributes: { title: title },
    });

    return `
            <div class="autocomplete-suggestion"
                data-id="${title}"
                data-rel="${rel}"
                data-label="${label}"
                data-search="${search}">
                <img width="30px" height="30px" src="${imagePath}"> 
                ${rel} <span style="color: blue">${title.replace(
      re,
      "<b>$1</b>"
    )}</span>
            </div>
        `;
  },

  onSelect: function (e, term, item) {
    var id = item.getAttribute("data-id");
    var rel = item.getAttribute("data-rel");
    var label = item.getAttribute("data-label");

    document.getElementById("search").value = "";
    document.getElementById("search").blur();

    popoto.graph.node.addRelatedValues(popoto.graph.getRootNode(), [
      {
        id: id,
        rel: rel,
        label: label,
      },
    ]);

    popoto.query.execute(); 
  },
});
popoto.provider.node.getImagePath = function (node) {
  switch (node.label) {
    case "Category":
      return "image/node/category/category.svg";
    case "Cuisine":
      return "image/node/cuisine/cuisine.svg";
    case "HalalStatus":
      return "image/node/halalstatus/halal.svg";
    case "Ingredient":
      return "image/node/ingredient/ingredient.svg";
    case "Type":
      return "image/node/type/type.svg";
    case "Nutrient":
      return "image/node/nutrient/nutrient.svg";
    case "VeganStatus":
      return "image/node/veganstatus/vegan.svg";
  }
  
};
