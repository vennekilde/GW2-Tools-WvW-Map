"use strict";function WvWMap(){var e=this,i=$("#map");e.map=void 0,e.objMarkers={},e.objectiveTypeToIcon={},e.objectiveTypes={camp:"Camp",tower:"Tower",keep:"Keep",castle:"Castle"},e.markerLength=26,e.markerSize=[e.markerLength,e.markerLength],e.markerAnchor=[e.markerLength/2,e.markerLength/2],e._init=function(){e._initiateMap(),e._initMarkerObjectiveTypes(),e._initObjectiveMarkers(),$(window).resize(function(){e._handleMapSizeChanged()})},e.getMap=function(){return e.map},e.getObjectiveMarkers=function(){return e.objMarkers},e._initiateMap=function(){e._removeMapGridLines();var n=e._getMinZoomBasedOnMapSize(i);e.map=L.map("map",{minZoom:n,maxZoom:6,zoomSnap:0,zoomDelta:.3,wheelPxPerZoomLevel:140,maxBoundsViscosity:1,bounceAtZoomLimits:!1,zoomControl:!1,attributionControl:!1});var t=new L.LatLngBounds(e._unproject([16384,0]),e._unproject([0,16384]));L.tileLayer("https://{s}.guildwars2.com/2/1/{z}/{x}/{y}.jpg",{subdomains:["tiles1","tiles2","tiles3","tiles4"],bounds:t,minNativeZoom:4,noWrap:!0}).addTo(e.map);var o=e._unproject([15700,8900]),a=e._unproject([5100,15900]),r=new L.LatLngBounds(o,a);if(e.map.setMaxBounds(r),e.map.setView(new L.LatLng((o.lat-a.lat)/2,(o.lng-a.lng)/2),n),e.map.on("drag",function(){e.map.panInsideBounds(r,{animate:!1})}),void 0!==wvwMapConfig&&wvwMapConfig.debug){L.marker(a,{title:"sw"}).addTo(e.map),L.marker(o,{title:"ne"}).addTo(e.map),L.marker(e.map.getCenter(),{title:"center"}).addTo(e.map);var p=new L.LatLng(a.lat,o.lng);L.marker(p,{title:"se"}).addTo(e.map),e.map.on("click",e._onMapClick.bind(this))}var s=document.createEvent("HTMLEvents");s.initEvent("wvw-map-initialized",!0,!1),document.dispatchEvent(s)},e._removeMapGridLines=function(){var e=L.GridLayer.prototype._initTile;L.GridLayer.include({_initTile:function(i){e.call(this,i);var n=this.getTileSize();i.style.width=n.x+1+"px",i.style.height=n.y+1+"px"}})},e._unproject=function(i){return e.map.unproject(i,e.map.getMaxZoom())},e._getMinZoomBasedOnMapSize=function(e){var i=e.width(),n=e.height(),t=(n<i?n:i)/256,o=Math.log(t)/Math.log(2);return o+=1.23},e._handleMapSizeChanged=function(n){var t=e._getMinZoomBasedOnMapSize(i);setTimeout(function(){e.map.setMinZoom(t),e.map.invalidateSize({animate:!0,duration:1})},n)},e._onMapClick=function(i){console.log("You clicked the map at "+e.map.project(i.latlng))},e._initObjectiveMarkers=function(){$.getJSON("https://api.guildwars2.com/v2/wvw/objectives?ids=all",function(i){e.objMarkers={};for(var n in i)if(i.hasOwnProperty(n)){var t=i[n];if(t.hasOwnProperty("coord")&&"EdgeOfTheMists"!==t.map_type&&t.type in e.objectiveTypeToIcon){var o=e.objectiveTypeToIcon[t.type],a=L.marker(e._unproject(t.coord),{icon:o}).addTo(e.map);a.objectiveDetails=t,a.on("mouseover",function(e){this.openPopup()}),a.on("mouseout",function(e){this.closePopup()}),a.on("popupopen",function(i){var n=e.map.project(i.popup._latlng),t=e.map.project(e.map.getBounds()._northEast),o=$("#map").find(".leaflet-popup-content").height();n.y-o-20<t.y?$(i.popup._container).addClass("popup-open-dowm"):$(i.popup._container).removeClass("popup-open-dowm")}),e.objMarkers[t.id]=a}}})},e._initMarkerObjectiveTypes=function(){for(var i in e.objectiveTypes){var n=e._capitalizeFirstLetter(i);e.objectiveTypeToIcon[n]=L.divIcon({html:'<div class="wvw-obj-marker">\n                        <div class="cooldown-container" style="display: none;"><div class="cooldown-text"></div><div class="cooldown-border"></div></div>\n                        <div class="www-obj-badge" style="background-image: url(images/wvw_'+i+'.png)"></div>\n                        <div class="wvw-shield-container"></div>\n                        <div class="wvw-waypoint" style="display: none"></div>\n                        <div class="wvw-guild-icon-marker" style="display: none"><img src="'+wvwMapConfig.installDirectory+'/images/guild_shield.png"></div>\n                    </div>',iconSize:e.markerSize,iconAnchor:e.markerAnchor})}},e._capitalizeFirstLetter=function(e){return e.charAt(0).toUpperCase()+e.slice(1)},e._init()}