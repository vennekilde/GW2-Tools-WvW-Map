/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//Leaflet map obj
var map;

//map objective markers
var objMarkers;

//World to show matchup details from
var world = 2007; //2007 == Far Shiverpeaks

//How often the widget should refresh its data in milliseconds
var REFRESH_TIME = 10000; //const

//Retrieved matchup details
var matchDetails;

function unproject(coord) {
    return map.unproject(coord, map.getMaxZoom());
}

function onMapClick(e) {
    console.log("You clicked the map at " + map.project(e.latlng));
}

$(function () {
    "use strict";
    
    var mapDiv = $("#map");
    var mapWidth = mapDiv.width();
    var mapHeight = mapDiv.height();
    
    var originalInitTile = L.GridLayer.prototype._initTile
    L.GridLayer.include({
        _initTile: function (tile) {
            originalInitTile.call(this, tile);

            var tileSize = this.getTileSize();
            tile.style.width = tileSize.x + 1 + 'px';
            tile.style.height = tileSize.y + 1 + 'px';
        }
    });
    
    // Get the largest screen dimension 
    // reason for doing this is a phone may start in portrait then move to landscape
    var maxScreenDimension = mapHeight < mapWidth ? mapHeight : mapWidth;

    // assuming tiles are 256 x 256
    var tileSize = 256;

    // How many tiles needed to for the largest screen dimension
    // I take the floor because I don't want to see more then 1 world
    // Use Math.ceil if you don't mind seeing the world repeat
    var maxTiles = maxScreenDimension / tileSize;

    /* MATH MAGIC !!!!!
        number of tiles needed for one side = 2 ^ zoomlevel
        or
        maxTiles = 2 ^ zoomlevel
        Time to show my steps! assuming log base 2 for all steps

        log(2 ^ zoomlevel) = log(maxTiles)
        properties of logs
        zoomlevel * log(2) = log(maxTiles)
        log base 2 of 2 is just 1
        zoomlevel * 1 = log(maxTiles)
        JS Math.log is ln (natural log) not base 2
        So we need to use another log property
        Math.log(maxTiles) / Math.log(2) = Log base 2 of maxTiles
    */

    // I am taking the ceiling so I don't see more then 1 world
    // Use Math.floor if you don't mind seeing the world repeat
    var minZoom = Math.log(maxTiles) / Math.log(2);
    
    //For what ever reason, this static amount added works on all screen sizes that i have tested
    minZoom += 1.23;

    map = L.map("map", {
        minZoom: minZoom,
        maxZoom: 6,
        zoomSnap: 0,
        zoomDelta: 0.3,
        wheelPxPerZoomLevel: 120,
        maxBoundsViscosity: 1.0,
        bounceAtZoomLimits: false,
        zoomControl: false,
        attributionControl: false,
        //dragging: false,
    }).setView([1351, 1602], minZoom);

    var neX = 17380;
    var neY = 8900;
    var swX = 3100;
    var swY = 15900;

    var borderNE = unproject([neX, neY]);
    var borderSW = unproject([swX, swY]);
    L.marker(borderSW, {
        title: "sw",
    }).addTo(map);
    L.marker(borderNE, {
        title: "ne",
    }).addTo(map);
    var bounds = new L.LatLngBounds(borderNE, borderSW);
    
    var renderBounds = new L.LatLngBounds(unproject([16384, 0]), unproject([0, 16384]));
    
    L.tileLayer("https://{s}.guildwars2.com/2/1/{z}/{x}/{y}.jpg", {
        subdomains: ["tiles1","tiles2","tiles3","tiles4"],
        minNativeZoom: 4,
        bounds: renderBounds,
        noWrap: true
    }).addTo(map);
    
    map.setMaxBounds(bounds);

    //map.fitBounds(bounds);
    
    map.on('drag', function() {
        map.panInsideBounds(bounds, { animate: false });
    });
    
    map.on("click", onMapClick);
    
    initObjectiveMarkers();
    
    // Create the event
    var event = new CustomEvent("wvw-map-initialized", {});

    // Dispatch/Trigger/Fire the event
    document.dispatchEvent(event);
});

function initObjectiveMarkers(){
    $.getJSON("https://api.guildwars2.com/v2/wvw/objectives?ids=all", function (objectives) {
        objMarkers = {};
        for (var k in objectives) {
            if (objectives.hasOwnProperty(k)) {
                var objective = objectives[k];
                
                if(objective.hasOwnProperty("coord") && objective["map_type"] != "EdgeOfTheMists"){
                    
                    if(objective.type in objectiveTypeToIcon){
                        var icon = objectiveTypeToIcon[objective.type];
                        
                        var marker = L.marker(unproject(objective.coord), {
                            title: objective.name,
                            icon: icon,
                        }).addTo(map);
                        
                        objMarkers[objective.id] = marker;
                    }
                }
            }
        }
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var objectiveTypeToIcon = {}
var objectiveTypes = {
    "camp": "Camp",
    "tower": "Tower",
    "keep": "Keep",
    "castle": "Castle",
}

markerLength = 26;
var markerSize = [markerLength, markerLength];
var markerAnchor = [markerLength / 2, markerLength / 2];

for (var objectiveType in objectiveTypes) {
    objectiveName = capitalizeFirstLetter(objectiveType);
    objectiveTypeToIcon[objectiveName] = L.divIcon({
        html:   '<div class="wvw-obj-marker">\n\
                    <div class="cooldown-container" style="display: none;"><div class="cooldown-text"></div><div class="cooldown-border"></div></div>\n\
                    <div class="www-obj-badge" style="background-image: url(images/wvw_'+objectiveType+'.png)"></div>\n\
                    <div class="wvw-shield-container"></div>\n\
                </div>',
        //shadowUrl: 'images/waypoint.png',

        iconSize:     markerSize, // size of the icon
        //shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   markerAnchor, // point of the icon which will correspond to marker's location
        //shadowAnchor: [4, 62],  // the same for the shadow 
        //popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
}