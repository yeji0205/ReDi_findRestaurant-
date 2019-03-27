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
getRestaurant();

// Reverse geocode the location, output the address
async function onClick(e) {
  let url = "https://reverse.geocoder.api.here.com/6.2/reversegeocode.json?prox=" + e.latlng.lat + "%2C" +  e.latlng.lng +"%2C250&mode=retrieveAddresses&maxresults=1&gen=9&app_id=" + appId + "&app_code=" + appCode;
  let response = await fetch(url);
  let reply = await response.json();
  let label = reply.Response.View[0].Result[0].Location.Address.Label;

  let popup = L.popup();
  popup.setLatLng(e.latlng).setContent(label).openOn(mymap);
}

mymap.on('click', onClick);
