mapboxgl.accessToken =
  "pk.eyJ1IjoicG90YXRvdGFydSIsImEiOiJjamU3NXM1bTUwOGRqMnBvNWkzdjByNWV0In0.2NMoyG2zRd8X8BMQht_gAg";

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/satellite-streets-v12",
  center: [-74.0066, 40.7135],
  zoom: 2,
  pitch: 45,
  bearing: -17.6,
  hash: true,
});

map.on("style.load", () => {
  map.setProjection("globe"); 
  map.setFog({}); 
  map.addLayer({
    id: "3d-buildings",
    source: "composite",
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    minzoom: 15,
    paint: {
      "fill-extrusion-color": "#aaa",
      "fill-extrusion-height": [
        "interpolate",
        ["linear"],
        ["zoom"],
        15,
        0,
        15.05,
        ["get", "height"],
      ],
      "fill-extrusion-base": [
        "interpolate",
        ["linear"],
        ["zoom"],
        15,
        0,
        15.05,
        ["get", "min_height"],
      ],
      "fill-extrusion-opacity": 1,
    },
  });
});

function cleanCoordinate(value) {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length >= 3) {
    return Number(parts[0] + "." + parts[1] + parts[2]); 
  } else {
    return Number(value);
  }
}
function activateResultClicks() {
  document.querySelectorAll("#popoto-results .ppt-result").forEach((el) => {
    const latText = el.querySelector(
      ".ppt-result-attribute-div:nth-last-child(2) span:last-child"
    )?.textContent;
    const lngText = el.querySelector(
      ".ppt-result-attribute-div:nth-last-child(1) span:last-child"
    )?.textContent;

    const lat = parseFloat(latText);
    const lng = parseFloat(lngText);

    if (!isNaN(lat) && !isNaN(lng)) {
      el.style.cursor = "pointer";
      el.addEventListener("click", () => {
        map.flyTo({
          center: [lng, lat],
          zoom: 16,
          pitch: 60,
          bearing: -30,
          duration: 3000,
          essential: true,
        });

      });
    }
  });
}

function createGeojson(resultObjects) {
  var features = [];

  for (var i = 0; i < resultObjects.length; i++) {
    var longitude = cleanCoordinate(resultObjects[i].attributes.longitude);
    var latitude = cleanCoordinate(resultObjects[i].attributes.latitude);

    if (longitude && latitude) {
      features.push({
        resultObject: resultObjects[i],
        type: "Feature",
        properties: {
          name: resultObjects[i].attributes.Objectname,
          address: resultObjects[i].attributes.address,
          postcode: resultObjects[i].attributes.postcode,
          locality: resultObjects[i].attributes.locality,
          tel: resultObjects[i].attributes.tel,
        },
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      });
    }
  }

  return {
    type: "FeatureCollection",
    features: features,
  };
}

popoto.result.onResultReceived(function (resultObjects) {
  const geojson = createGeojson(resultObjects);

  if (map.getSource("food-locations")) {
    map.removeLayer("food-layer");
    map.removeSource("food-locations");
  }

  map.addSource("food-locations", {
    type: "geojson",
    data: geojson,
  });

  map.loadImage("image/node/food/food-pin-64x96.png", function (error, image) {
    if (error) {
      console.error("Gagal load gambar:", error);
      return;
    }

    console.log("Gambar berhasil dimuat");

    if (!map.hasImage("food-icon")) {
      map.addImage("food-icon", image);
    }

    if (map.getLayer("food-layer")) {
      map.removeLayer("food-layer");
    }

    map.addLayer({
      id: "food-layer",
      type: "symbol",
      source: "food-locations",
      layout: {
        "icon-image": "food-icon",
        "icon-size": 1,
        "icon-allow-overlap": true,
      },
    });
  });

  if (geojson.features.length > 0) {
    const bounds = new mapboxgl.LngLatBounds();
    geojson.features.forEach((feature) =>
      bounds.extend(feature.geometry.coordinates)
    );
    map.fitBounds(bounds, { padding: 40, maxZoom: 14, duration: 10000 });
  }
  setTimeout(activateResultClicks, 300);
});
function resetView() {
  map.flyTo({
    center: [33.075656, 64.810302],
    zoom: 2,
    pitch: 0,
    bearing: 0,
  });
}
let activePopup = null;

map.on("click", "food-layer", function (e) {
  const props = e.features[0].properties; 
  console.log("🔍 PROPS:", props); 
  const coordinates = e.features[0].geometry.coordinates;

  map.flyTo({
    center: coordinates,
    zoom: 16,
    pitch: 60,
    bearing: -30,
    duration: 3000,
    essential: true,
  });
});

map.on("mouseenter", "food-layer", () => {
  map.getCanvas().style.cursor = "pointer";
});
map.on("mouseleave", "food-layer", () => {
  map.getCanvas().style.cursor = "";
});
