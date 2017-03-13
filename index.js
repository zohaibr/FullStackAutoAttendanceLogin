let axios = require('axios');
let Promise = require('bluebird');


//Below is a promisified function to get the current location
function getLocation() {
    return new Promise(function (resolve, reject) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            });
        } else {
            reject('could not find geolocation')
        }
    });
}

//Gets the current Latitude and Longitude
const getLat1  = getLocation().then(loc => loc.lat);
const getLong1 = getLocation().then(loc => loc.lng);

//API calls to map GEOCODE API to return Latitude and Longitude for 5 Hanover Square.
const getLat2 =  axios.get("https://maps.googleapis.com/maps/api/geocode/json?address=5+Hanover+Square,+New+York,+NY&key=AIzaSyAuj3vB4T1Rs0I9je3onFDOEBp_qstJ_ys")
    .then(response => response.data.results[0].geometry.location.lat);
const getLong2 = axios.get("https://maps.googleapis.com/maps/api/geocode/json?address=5+Hanover+Square,+New+York,+NY&key=AIzaSyAuj3vB4T1Rs0I9je3onFDOEBp_qstJ_ys")
    .then(response => response.data.results[0].geometry.location.lng);

//Function to calculate the distance between two locations.
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    let R = 6371; // Radius of the earth in km
    let dLat = deg2rad(lat2-lat1);  // deg2rad below
    let dLon = deg2rad(lon2-lon1);
    let a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let d = R * c; // Distance in km
    return d*1000; //Distance in meters
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

//Pomisified version to check if the site was visited in the last 8 hours.
function checkVisitedLog() {
    let currentDate = new Date().getTime();
    return new Promise(function (resolve, reject) {
        chrome.history.search({text: 'learn.fullstackacademy.com', maxResults:1, "startTime": 0}, function(result) {
            resolve((currentDate - result[0].lastVisitTime) < 28800000);
        });
    });
}

const hasBeenVisitedInEightHours = checkVisitedLog().then(boolVisited => boolVisited);


//Runs the function callTab. It checks if the distance if the current location is less than 100 meters from 5 Hanover Square
//and if you have visited the LearnDot in the last 8 hours.

function callTab() {
    Promise.all([getLat1, getLong1, getLat2, getLong2, hasBeenVisitedInEightHours])
        .spread(function (lat1, long1, lat2, long2, visited) {
            if ((getDistanceFromLatLonInKm(lat1, long1, lat2, long2).toFixed(1)) < 100 && !visited) {
                let newURL = "http://learn.fullstackacademy.com";
                chrome.tabs.create({url: newURL});
            }
        });
}

callTab();
