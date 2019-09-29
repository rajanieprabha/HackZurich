
//import * from '@tensorflow/tfjs';
//import {loadGraphModel} from '@tensorflow/tfjs-converter';


var passengerInitCoordinates = [47.36667, 8.55];
var passengerIcon = tomtom.L.icon({
  iconUrl: 'img/man-waving-arm_32.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});
var passengerMarker;


var map = tomtom.L.map('map', {
    key: 'ALMcxlgKPUm48bXEyVAWDKGORjoUcAtM',
    //center: [52.37187, 4.89218],
    center: passengerInitCoordinates,
    basePath: '/sdk',
    source: 'vector',
    styleUrlMapping: {
        main: {
            basic: '/sdk/styles/mono.json',
            labels: '/sdk/styles/labels_main.json'
        }
    },
    zoom: 12
});

passengerMarker = tomtom.L.marker(passengerInitCoordinates, {
      icon: passengerIcon
    }).addTo(map);

var MILLIS_IN_SECOND = 1000;
var DELIVERY_TIME_IN_MINUTES = 15;
var MIN_SLIDER_RANGE = 480;
var MAX_SLIDER_RANGE = 1320;
var reachableRangeBudgetTimeInSeconds = 60 * DELIVERY_TIME_IN_MINUTES;
var pizzaPrefixId = 'pizza-';
var polygonLayers = [];
var pizzaMarkers = [];
var clientMarker;
var deliveryTimeSlider;

function initControlMenu() {
    var searchBoxInstance = tomtom.searchBox({
        collapsible: false,
        searchOnDragEnd: 'never'
    }).addTo(map);
    document.getElementById('search-panel').appendChild(searchBoxInstance.getContainer());
    searchBoxInstance.on(searchBoxInstance.Events.ResultClicked, showClientMarkerOnTheMap);
}

var car_park_coordinates = [];
var carIcons = []; 
function setInitConfig() {
  config = [
    {
      name: 'CAR #1',
      color: '#00e2ff'
    },
    {
      name: 'CAR #2',
      color: '#0c95e8'
    },
    {
      name: 'CAR #3',
      color: '#0d64ff'
    },
    {
      name: 'CAR #4',
      color: '#0ce8c5'
    },
    {
      name: 'CAR #5',
      color: '#00e2ff'
    },
    {
      name: 'CAR #6',
      color: '#0c95e8'
    },
    {
      name: 'CAR #7',
      color: '#0d64ff'
    },
    {
      name: 'CAR #8',
      color: '#0ce8c5'
    }
  ];
}

initControlMenu();
displayPizzaMarkers();


function displayPizzaMarkers() {
    tomtom.L.geoJSON(geojson, {
        pointToLayer: createMarker
    }).addTo(map);
}

var details1 = "This is the most efficient Parking Spot. Follow the route to earn 10 park points";

function createMarker(geoJsonPoint) {
    var coordinates = geoJsonPoint.geometry.coordinates.reverse();
    console.log(coordinates);
    car_park_coordinates.push(coordinates);

    var car_icon = tomtom.L.icon({
            iconUrl: geoJsonPoint.properties.iconUrl,
            iconSize: [60, 60],
            iconAnchor: [30, 30],
            popupAnchor: [0, -30]
        })
    carIcons.push(car_icon);
    var marker = tomtom.L.marker(coordinates, {
        icon: car_icon,
        draggable: true
    });
    marker.on('dragend', function () {
        if (polygonLayers.length > 0) {
            displayReachableRangePolygons();
        }
    });
    pizzaMarkers.push(marker);
    return marker;
}

function showClientMarkerOnTheMap(result) {
    //document.getElementById('calculate-range').disabled = false;
    if (clientMarker) {
        map.removeLayer(clientMarker);
    }
    clientMarker = tomtom.L.marker(result.data.position, {
        icon: tomtom.L.icon({
            iconUrl: 'img/cab1.png',
            iconSize: [50, 50],
            iconAnchor: [25, 25]
        })
    }).addTo(map);
}

function toggleTrafficFlowLayer() {
    var flowLayer = tomtom.L.MapUtils.findLayersByName('vectorTrafficFlow', map)[0];
    if (!flowLayer) {
        map.addLayer(new L.TomTomVectorTrafficFlowLayer());
    } else {
        map.removeLayer(flowLayer);
    }
}


var routes = [];

function clear() {
  routes.forEach(function (child) {
    child[0].remove();
    child[1].remove();
  });
  routes = [];
  setInitConfig();
  passengerMarker.closePopup();
}

document.getElementById('submit-button').addEventListener('click', submitButtonHandler);

var routeBackgroundWeight = 12;
var routeWeight = 9;

function drawRoute(locations, color, index) {
  tomtom.routing().locations(locations).go().then(function (routeJson) {
    var route = [];
    route[0] = tomtom.L.geoJson(routeJson, {
      style: {
        color: 'black',
        weight: routeBackgroundWeight
      }
    }).addTo(map);
    route[1] = tomtom.L.geoJson(routeJson, {
      style: {
        color: color,
        weight: routeWeight
      }
    }).addTo(map);
    routes[index] = route;
  });
}

function drawAllRoutes() {
  car_park_coordinates.forEach(function (child, index) {
    drawRoute(child + ':' + passengerMarker.getLatLng().lat + ','
      + passengerMarker.getLatLng().lng, config[index].color, index);
  });
}

function processMatrixResponse(result) {
  var travelTimeInSecondsArray = [];
  var lengthInMetersArray = [];
  var trafficDelayInSecondsArray = [];
  result.forEach(function (child) {
    travelTimeInSecondsArray.push(child[0].routeSummary.travelTimeInSeconds);
    lengthInMetersArray.push(child[0].routeSummary.lengthInMeters);
    trafficDelayInSecondsArray.push(child[0].routeSummary.trafficDelayInSeconds);
  });
  drawAllRoutes();
}

function convertToPoint(lat, long) {
  return {
    point: {
      latitude: lat,
      longitude: long
    }
  };
}

function buildDestinationsParameter() {
  return [convertToPoint(passengerMarker.getLatLng().lat, passengerMarker.getLatLng().lng)];
}

function buildOriginsParameter() {
  var origins = [];
  car_park_coordinates.forEach(function (child) {
    origins.push(convertToPoint(child[0], child[1]));
  });
  return origins;
}

function callMatrix() {
  tomtom.matrixRouting().departAt('now')
    .origins(buildOriginsParameter())
    .destinations(buildDestinationsParameter())
    .go().then(processMatrixResponse);
}

var customPopup = '<p style="display:inline">' +
    '<div style="width:50%; height:100%; padding-top:10px">' +
    '<span style="font-size:18px">Park Spot 1</span></br>' +
    '<div><span style="color:grey">' +
    'In'+ 56 +'minutes at your place!</span></div><br/>' +
    '<span>100 Century Center Ct 210, San Jose, CA 95112</br>USA</span></br>' +
    '</p>'

function submitButtonHandler() {
  clear();
  callMatrix();
  getParkingData();
}


pizzaMarkers[0].bindPopup(details1).openPopup();

//toggleTrafficFlowLayer()

function get_mean(arr){
    var len = 0;
    var sum = 0;
    for(var i=0;i<arr.length;i++){
        len=len+1;
        sum=sum+arr[i];
    }
    return sum/len;
}

function StandardDeviation(numbersArr) {
    //--CALCULATE AVAREGE--
    var total = 0;
    for(var key in numbersArr) 
       total += numbersArr[key];
    var meanVal = total / numbersArr.length;
    //--CALCULATE AVAREGE--
  
    //--CALCULATE STANDARD DEVIATION--
    var SDprep = 0;
    for(var key in numbersArr) 
       SDprep += Math.pow((parseFloat(numbersArr[key]) - meanVal),2);
    var SDresult = Math.sqrt(SDprep/numbersArr.length-1);
    //--CALCULATE STANDARD DEVIATION--
    return (SDresult);
    
}

function getParkingData() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "https://api.parkendd.de/Zuerich/zuerichparkgarageamcentral/timespan?from=2019-09-22T23:15:02&to=2019-09-28T23:15:02&version=1.1", true);
    xhr.send();
    xhr.addEventListener("readystatechange", processRequest, false);
    function processRequest(e) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            //alert(response.data.length);
            needed_data = response.data.slice(1).slice(-84)
            feed_data = []
            for (i = 0; i < needed_data.length; i++) {
              feed_data.push(needed_data[i].free)  
            }

            for (i = 0; i < feed_data.length; i++){
                var sum = sum + feed_data[i]
            }

            const std=StandardDeviation(feed_data)
            const mean=get_mean(feed_data)

            for (i = 0; i < feed_data.length; i++){
                feed_data[i]=(feed_data[i]-mean)/std;
            }



            inferFromModel(feed_data);
            
            //console.log("HEYYO");
        }
    }
}

function generateGraph(preds){
    var epochs = [];
    for (let i=0; i<72; i++){
        epochs.push(i);

    } 
    var ctx = document.getElementById("myChart").getContext('2d');
    var myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: epochs,
        datasets: [{
            data: preds,
            label: "Predictions",
            borderColor: "#3e95cd",
            fill: false
          }
        ]
      },
      options: {
        scales:{
            yAxes: [{
                ticks:{
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }]
        }

      }
    });

}

function inferFromModel(feed_data) {
    const data_tensor = tf.tensor(feed_data, [1, 84, 1]);
    //data_tensor = data_tensor.reshape([1, 84, 1]);
    //alert(data_tensor.shape);
    const MODEL_URL = 'model.json';
    tf.loadLayersModel(MODEL_URL).then(model => {
      const out = model.predict(data_tensor).dataSync();
      
      for(var j=0; j<out.length;j++){
        out[j] = ~~(out[j]*15.33+23.76);


      }
      alert(out[0]);
      //generateGraph(feed_data);
      generateGraph(out);
    });
    // const out = model.predict(data_tensor);
    // alert(out.shape);
}

