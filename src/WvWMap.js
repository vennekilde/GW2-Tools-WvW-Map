/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global wvwMapConfig */

"use strict";

function WvWMap() {
    var self = this;
    var mapDiv = $("#map");
    
    //Leaflet map obj
    self.map = undefined;
    //map objective markers
    self.objMarkers = {};

    self.objectiveTypeToIcon = {};
    self.objectiveTypes = {
        "camp": "Camp",
        "tower": "Tower",
        "keep": "Keep",
        "castle": "Castle"
    };
    self.markerLength = 26;
    self.markerSize = [self.markerLength, self.markerLength];
    self.markerAnchor = [self.markerLength / 2, self.markerLength / 2];
    
    self._init = function () {
        //Create Leaflet map
        self._initiateMap();
        //Setup objective marker templates
        self._initMarkerObjectiveTypes();
        //Setup markers
        self._initObjectiveMarkers();
        
        //Change min zoom when window is resized to fit the new resolution
        $( window ).resize(function() {
            self._handleMapSizeChanged();
        });
    };
    self.getMap = function () {
        return self.map;
    };
    self.getObjectiveMarkers = function () {
        return self.objMarkers;
    };

    /**
     * Initiate the leaflet map
     * @private
     */
    self._initiateMap = function () {
        self._removeMapGridLines();

        var minZoom = self._getMinZoomBasedOnMapSize(mapDiv);

        self.map = L.map("map", {
            minZoom: minZoom,
            maxZoom: 6,
            zoomSnap: 0,
            zoomDelta: 0.3,
            wheelPxPerZoomLevel: 140,
            maxBoundsViscosity: 1.0,
            bounceAtZoomLimits: false,
            zoomControl: false,
            attributionControl: false,
        }).setView([1351, 1602], minZoom);

        // Define renderable area of the map
        var renderBounds = new L.LatLngBounds(self._unproject([16384, 0]), self._unproject([0, 16384]));

        //Setup tile layer
        L.tileLayer("https://{s}.guildwars2.com/2/1/{z}/{x}/{y}.jpg", {
            subdomains: ["tiles1", "tiles2", "tiles3", "tiles4"],
            bounds: renderBounds,
            minNativeZoom: 4,
            noWrap: true
        }).addTo(self.map);


        // Define viewable area
        var borderNE = self._unproject([17380, 8900]);
        var borderSW = self._unproject([3500, 15900]);
        var bounds = new L.LatLngBounds(borderNE, borderSW);

        //Set bounds
        self.map.setMaxBounds(bounds);

        //map.fitBounds(bounds);

        //Prevent drag when map is outside the bounds
        self.map.on('drag', function () {
            self.map.panInsideBounds(bounds, {animate: false});
        });

        //Debug render
        if (wvwMapConfig !== undefined && wvwMapConfig.debug) {
            L.marker(borderSW, {title: "sw"}).addTo(self.map);
            L.marker(borderNE, {title: "ne"}).addTo(self.map);

            self.map.on("click", (self._onMapClick).bind(this));
        }

        // Create the event
        var event = new CustomEvent("wvw-map-initialized", {});

        // Dispatch/Trigger/Fire the event
        document.dispatchEvent(event);
    };

    /**
     * There is currently a bug in Leaflet where grid lines will appear
     * This is a temp fix to solve that problem by expanding each tile by 1 px
     * @private
     */
    self._removeMapGridLines = function () {
        var originalInitTile = L.GridLayer.prototype._initTile
        L.GridLayer.include({
            _initTile: function (tile) {
                originalInitTile.call(this, tile);

                var tileSize = this.getTileSize();
                tile.style.width = tileSize.x + 1 + 'px';
                tile.style.height = tileSize.y + 1 + 'px';
            }
        });
    };

    /**
     * Unproject the given coordinates using the map unproject method with max zoom
     * @param coord
     * @returns {*}
     * @private
     */
    self._unproject = function (coord) {
        return self.map.unproject(coord, self.map.getMaxZoom());
    };

    /**
     * Get the min zoom based on the size of the div containing the map
     * @param mapDiv
     * @returns {number}
     * @private
     */
    self._getMinZoomBasedOnMapSize = function (mapDiv) {
        var mapWidth = mapDiv.width();
        var mapHeight = mapDiv.height();

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

        return minZoom;
    };
    
    /**
     * Change the min zoom on the map to match the new resolution
     * @returns {undefined}
     */
    self._handleMapSizeChanged = function(){
        var minZoom = self._getMinZoomBasedOnMapSize(mapDiv);
        self.map.setMinZoom(minZoom);
    }

    self._onMapClick = function (e) {
        console.log("You clicked the map at " + self.map.project(e.latlng));
    };

    self._initObjectiveMarkers = function () {
        $.getJSON("https://api.guildwars2.com/v2/wvw/objectives?ids=all", function (objectives) {
            self.objMarkers = {};
            for (var k in objectives) {
                if (objectives.hasOwnProperty(k)) {
                    var objective = objectives[k];

                    if (objective.hasOwnProperty("coord") && objective["map_type"] !== "EdgeOfTheMists") {

                        if (objective.type in self.objectiveTypeToIcon) {
                            var icon = self.objectiveTypeToIcon[objective.type];

                            var marker = L.marker(self._unproject(objective.coord), {
                                title: objective.name,
                                icon: icon,
                            }).addTo(self.map);

                            marker.bindPopup("Popup content");
                            marker.on('mouseover', function (e) {
                                this.openPopup();
                            });
                            marker.on('mouseout', function (e) {
                                //this.closePopup();
                            });
                            
                            //Save marker for later user
                            self.objMarkers[objective.id] = marker;
                        }
                    }
                }
            }
        });
    };

    /**
     * Create template div's to use when adding an objective marker based on the objective type
     * @private
     */
    self._initMarkerObjectiveTypes = function () {
        for (var objectiveType in self.objectiveTypes) {
            var objectiveName = self._capitalizeFirstLetter(objectiveType);
            self.objectiveTypeToIcon[objectiveName] = L.divIcon({
                html: '<div class="wvw-obj-marker">\n\
                        <div class="cooldown-container" style="display: none;"><div class="cooldown-text"></div><div class="cooldown-border"></div></div>\n\
                        <div class="www-obj-badge" style="background-image: url(images/wvw_' + objectiveType + '.png)"></div>\n\
                        <div class="wvw-shield-container"></div>\n\
                        <div class="wvw-guild-icom-marker" style="display: none"><img src="'+wvwMapConfig.installDirectory+'/images/guild_shield.png"></div>\n\
                    </div>',
                //shadowUrl: 'images/waypoint.png',

                iconSize: self.markerSize, // size of the icon
                //shadowSize:   [50, 64], // size of the shadow
                iconAnchor: self.markerAnchor, // point of the icon which will correspond to marker's location
                //shadowAnchor: [4, 62],  // the same for the shadow
                //popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
            });
        }
    };

    self._capitalizeFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    
    self._init();
}