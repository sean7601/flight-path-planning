
# flight-path-planning
Generates minimum time flight paths given starting position/heading, ending position/heading, aircraft speed and aircraft angle of bank. Can output results in X/Y grid and in Lat/Longs. Also reports route distance and time. Can be used to display flyable flight paths on Leaflet.js
## Installation
To install, include:
<script src="flight-path-planner.js"></script> 
You must also include arc.js
<script src="arc.js"></script>
https://github.com/springmeyer/arc.js
## Usage
To calculate flight path with lat longs:
flightPlanner.latLongTurnCalculator(initLat,initLng,inithead,finLat,finLng,finhead,speed,AngleOfBank)

Latitudes and Longitudes should include degrees only (eg 30.2)
Headings should be in degrees
Speed should be in knots
Angle of Bank should be in degrees

This will return the total flight time, flight distance, and an array with lat/long pairs [lat,lng] encompassing the flight path


To calculate flight path in X,Y coordinate plane:
flightPlanner.TurnCalculator(initx,inity,inithead,finx,finy,finhead,speed,AngleOfBank)


To use with leaflet:
let flightPath = flightPlanner.latLongTurnCalculator(initLat,initLng,inithead,finLat,finLng,finhead,speed,AngleOfBank)
var polyline = L.polyline(flightPath.latpath, {color: 'black'}).addTo(map);

