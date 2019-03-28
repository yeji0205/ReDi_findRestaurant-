let pageUrl = new URL(window.location.href);

// Get the HERE appId / appCode:
let appId = pageUrl.searchParams.get("appId");
let appCode = pageUrl.searchParams.get("appCode");

// Get the Mapbox access token:
let accessToken = pageUrl.searchParams.get("accessToken");

// Initialize Leaflet
let mymap = L.map("map").setView([52.51, 13.37], 13);
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: accessToken
  }
).addTo(mymap);

// find Pizza restaurant nearby me
async function getRestaurant() {
  let searchCountry = document.getElementById("restaurant").value;
  let response = await fetch("https://api.foursquare.com/v2/venues/search?ll=52.510730,13.372075&query=pizza&client_id=KOYNMGVHRBZ0GDNZ0D2I5ANLLQYZGII31KW2PXMMQHOYOK2H&client_secret=YZYAVGB3ZM4WRUIJG3KXBIFBOG0KYZ3CODSU1PB3DGSFZCXP&v=20190326");
  let reply = await response.json();
  for(let venue of reply.response.venues){
    let marker = L.marker([venue.location.lat, venue.location.lng]).addTo(mymap);
    let popUp = marker.bindPopup(venue.name).openPopup();
  }
}

// Reverse geocode the location, output the address
async function onClick(e) {
  let url = "https://reverse.geocoder.api.here.com/6.2/reversegeocode.json?prox=" + e.latlng.lat + "%2C" +  e.latlng.lng +"%2C250&mode=retrieveAddresses&maxresults=1&gen=9&app_id=" + appId + "&app_code=" + appCode;
  let response = await fetch(url);
  let reply = await response.json();
  let label = reply.Response.View[0].Result[0].Location.Address.Label;

  let popup = L.popup();
  popup.setLatLng(e.latlng).setContent(label).openOn(mymap);
}

async function getIsoLine() {
    let url =
        "https://isoline.route.api.here.com/routing/7.2/calculateisoline.json?mode=fastest%3Bpedestrian&start=52.510730%2C13.372075&rangetype=time&range=900&app_id=fQbm3OvKtn44q7f7wqu0&app_code=wBdfzzXp6j6sEYkp-pqP4g";
    let response = await fetch(url);
    let reply = await response.json();
    console.log(reply);

    let isoline = reply.response.isoline[0].component[0].shape;
    return isoline;
}

// render Polygon
async function renderPolygon(){
    let isoline = await getIsoLine();

    let coordinates = [];   
    for(let coordinate of isoline){
        coordinates.push(coordinate.split(","));
    }

    let polygon = L.polygon(coordinates);
    polygon.addTo(mymap);
}
renderPolygon()

mymap.on('click', onClick);
