if (!("remove" in Element.prototype)) {
  Element.prototype.remove = function () {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}

function flyToStore(currentFeature) {
  map.flyTo({
    center: currentFeature.geometry.coordinates,
    zoom: 15.5,
  });
}

function flyToResult(result) {
  map.flyTo({
    center: [result.attributes.longitude, result.attributes.latitude],
    zoom: 20,
  });
}

function createPopUp(currentFeature) {
  var popUps = document.getElementsByClassName("mapboxgl-popup");
  if (popUps[0]) popUps[0].remove();

  var popup = new mapboxgl.Popup({ closeOnClick: false })
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML(
      "<h3>Sweetgreen</h3>" +
        "<h4>" +
        currentFeature.properties.address +
        "</h4>"
    )
    .addTo(map);
}

function computeBounds(geojson) {
  var coordinates = geojson.features.map(function (feature) {
    return feature.geometry.coordinates;
  });
  return coordinates.reduce(function (bounds, coord) {
    return bounds.extend(coord);
  }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
  
}

