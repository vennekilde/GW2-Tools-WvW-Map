/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global objMarkers, wvwMapConfig, wvwMap */

"use strict";

function MatchupFetcher() {
    var self = this;
    //Amount of images that has finished loading
    self.imagesLoaded = 0;
    self.TOTAL_IMAGES = 3; //6; //const

    self.righteous_indignation_time = 1000 * 60 * 5;
    self.matchDetails, self.ppt;
    
    self.REFRESH_TIME = 10000;
    
    self.guildDetails = {};

    self.updateCircles = {};

    /*
     * Load all resources required
     * init() will be called when all resources
     * has been loaded
     */
    var imageRed, imageBlue, imageGreen, imageRedSmall, imageBlueSmall, imageGreenSmall;
    self._preInit = function () {
        window.wvwPPTCanvases = [];

        /*self.imageRed = new Image();
        self.imageRed.onload = function () {
            self._imageLoaded();
        };
        self.imageRed.src = wvwMapConfig.installDirectory + "/images/redGlobe.png";

        self.imageBlue = new Image();
        self.imageBlue.onload = function () {
            self._imageLoaded();
        };
        self.imageBlue.src = wvwMapConfig.installDirectory + "/images/blueGlobe.png";

        self.imageGreen = new Image();
        self.imageGreen.onload = function () {
            self._imageLoaded();
        };
        self.imageGreen.src = wvwMapConfig.installDirectory + "/images/greenGlobe.png";*/


        self.imageRedSmall = new Image();
        self.imageRedSmall.onload = function () {
            self._imageLoaded();
        };
        self.imageRedSmall.src = wvwMapConfig.installDirectory + "/images/redGlobe-small.png";

        self.imageBlueSmall = new Image();
        self.imageBlueSmall.onload = function () {
            self._imageLoaded();
        };
        self.imageBlueSmall.src = wvwMapConfig.installDirectory + "/images/blueGlobe-small.png";

        self.imageGreenSmall = new Image();
        self.imageGreenSmall.onload = function () {
            self._imageLoaded();
        };
        self.imageGreenSmall.src = wvwMapConfig.installDirectory + "/images/greenGlobe-small.png";
    };

    self._init = function () {
        self._initPPTChart();

        self._updateMatchup();
        self._updateLoop();
        self._updateCooldownCircles();
    };

    /*
     * Images are loaded asyncronized, which means it might start drawing before
     * it has even loaded all the necessary images required.
     * In order to fix this, the imagesLoaded will be increased by one each time
     * an image is loaded until everything has been loaded
     */
    self._imageLoaded = function () {
        self.imagesLoaded++;
        if (self.imagesLoaded >= self.TOTAL_IMAGES) {
            self._init();
        }
    };

    /*
     * Initialize a ChartJS instance of a pie chart that will represent
     * each servers current PPT (like in game)
     */
    self._initPPTChart = function () {
        $(".wvw-ppt-canvas").each(function () {
            var contextCanvas = this.getContext("2d");

            //Load images
            var redPattern;
            var bluePattern;
            var greenPattern;
            
            redPattern = contextCanvas.createPattern(self.imageRedSmall, 'no-repeat');
            bluePattern = contextCanvas.createPattern(self.imageBlueSmall, 'no-repeat');
            greenPattern = contextCanvas.createPattern(self.imageGreenSmall, 'no-repeat');
            //Initialize data
            var wvwData = {
                labels: [
                    "Red",
                    "Blue",
                    "Green"
                ],
                datasets: [
                    {
                        data: [100, 100, 100],
                        backgroundColor: [
                            redPattern,
                            bluePattern,
                            greenPattern
                        ],
                        borderColor: 'rgba(0,0,0,1)'
                    }
                ]
            };

            //Chart config
            var chartConfig = {
                borderWidth: 3,
                type: "pie",
                animationSteps: 40,
                data: wvwData,
                options: {
                    tooltips: {
                        enabled: false
                    },
                    legend: {
                        display: false,
                        responsive: true
                    }
                }
            };
            //Create instance of chart
            var chart = new Chart(contextCanvas, chartConfig);
            window.wvwPPTCanvases.push(chart);
        });
    };

    /*
     * Keeps the widget up to date
     */
    self._updateLoop = function () {
        setTimeout(function () {
            self._updateMatchup(); //will call draw() at the end
            //loop
            self._updateLoop();
        }, self.REFRESH_TIME);
    };

    /*
     * Update matchup from the GW2 API
     */
    self._updateMatchup = function () {
        $.getJSON("https://api.guildwars2.com/v2/wvw/matches?world=" + wvwMapConfig.world,
                function (details) {
                    //Store retrived matchup details in global variable
                    self.matchDetails = details;

                    self._processMatchupData();

                    self._draw();
                }
        );
    };

    self._processMatchupData = function () {
        self._calculatePPT();
    };


    /*
     * Calculate PPT based on objectives held by each server
     */
    self._calculatePPT = function () {
        //Borderlands & EternalBattlegrounds details
        var maps = self.matchDetails["maps"];
        var tempPPT = [0, 0, 0];
        //Determine PPT from each map
        for (var i = 0; i < maps.length; i++) {
            var map = maps[i];
            var objectives = map["objectives"];
            //Determine PPT for each objective
            for (var k = 0; k < objectives.length; k++) {
                var objective = objectives[k];
                //Check if objective is owned by any server
                if (!(typeof self.colorToId[objective["owner"]] === "undefined")) {
                    //Attribute objective ppt to its owner
                    tempPPT[self.colorToId[objective["owner"]]] += objective["points_tick"];
                }
            }
        }
        //Store calculated ppt in global variable
        self.ppt = tempPPT;
    }

    self._draw = function () {
        self._drawScoreDetails();
        self._drawMapMarkers();
    }


    self._drawScoreDetails = function () {
        //Get score from matchup details
        var warScore = self.matchDetails["victory_points"];

        //Draw war score
        $(".wvw-score-label-red").html(warScore["red"]);
        $(".wvw-score-label-blue").html(warScore["blue"]);
        $(".wvw-score-label-green").html(warScore["green"]);

        //Draw war score bars
        var maxScore = Math.max(warScore["red"], warScore["blue"], warScore["green"]);
        $(".wvw-score-red").width(100 * (warScore["red"] / maxScore) + "%");
        $(".wvw-score-blue").width(100 * (warScore["blue"] / maxScore) + "%");
        $(".wvw-score-green").width(100 * (warScore["green"] / maxScore) + "%");
        $(".wvw-score-bar-text-red").html(self.world_names[self.matchDetails["worlds"]["red"]][1]);
        $(".wvw-score-bar-text-blue").html(self.world_names[self.matchDetails["worlds"]["blue"]][1]);
        $(".wvw-score-bar-text-green").html(self.world_names[self.matchDetails["worlds"]["green"]][1]);

        //Draw warscore difference
        $(".wvw-score-diff-number-red").html(warScore["red"] == maxScore ? "Lead" : "-" + (maxScore - warScore["red"]));
        $(".wvw-score-diff-number-blue").html(warScore["blue"] == maxScore ? "Lead" : "-" + (maxScore - warScore["blue"]));
        $(".wvw-score-diff-number-green").html(warScore["green"] == maxScore ? "Lead" : "-" + (maxScore - warScore["green"]));

        $(".wvw-ppt-number-red").html(self.ppt[0]);
        $(".wvw-ppt-number-blue").html(self.ppt[1]);
        $(".wvw-ppt-number-green").html(self.ppt[2]);

        //Draw skirmish score bars
        var skirmishScore = self.matchDetails["skirmishes"][self.matchDetails["skirmishes"].length - 1]["scores"];
        var maxSkirmishScore = Math.max(skirmishScore["red"], skirmishScore["blue"], skirmishScore["green"]);
        $(".wvw-skirmish-number-red").width(100 * (skirmishScore["red"] / maxSkirmishScore) + "%");
        $(".wvw-skirmish-number-blue").width(100 * (skirmishScore["blue"] / maxSkirmishScore) + "%");
        $(".wvw-skirmish-number-green").width(100 * (skirmishScore["green"] / maxSkirmishScore) + "%");

        //Get score from matchup details
        $(".wvw-skirmish-number-label-red").html(skirmishScore["red"]);
        $(".wvw-skirmish-number-label-blue").html(skirmishScore["blue"]);
        $(".wvw-skirmish-number-label-green").html(skirmishScore["green"]);

        $(".wvw-skirmish-diff-number-red").html(skirmishScore["red"] === maxSkirmishScore ? "Lead" : "-" + (maxSkirmishScore - skirmishScore["red"]));
        $(".wvw-skirmish-diff-number-blue").html(skirmishScore["blue"] === maxSkirmishScore ? "Lead" : "-" + (maxSkirmishScore - skirmishScore["blue"]));
        $(".wvw-skirmish-diff-number-green").html(skirmishScore["green"] === maxSkirmishScore ? "Lead" : "-" + (maxSkirmishScore - skirmishScore["green"]));

        var mapTypeToId = {
            "Center" : "eb",
            "RedHome" : "red",
            "BlueHome" : "blue",
            "GreenHome" : "green"
        }
        //Get combat statistics
        self._updateCombatWidget("#wvw-kd-widget", self.matchDetails["kills"], self.matchDetails["deaths"]);
        for (var i = 0; i < self.matchDetails["maps"].length; i++) {
            var map = self.matchDetails["maps"][i];
            self._updateCombatWidget("#wvw-kd-"+mapTypeToId[map.type]+"-widget", map["kills"], map["deaths"]);
        }
        
        //Draw ppt circle
        for (var i = 0; i < window.wvwPPTCanvases.length; i++) {
            var canvas = window.wvwPPTCanvases[i];
            
            canvas.data.datasets[0].data[0] = self.ppt[0];
            canvas.data.datasets[0].data[1] = self.ppt[1];
            canvas.data.datasets[0].data[2] = self.ppt[2];
            canvas.update();
        }
    };
    
    self._updateCombatWidget = function(widgetClass, kills, deaths){
        var widget = $(widgetClass);
        widget.find(".wvw-kills-red").html(kills["red"]);
        widget.find(".wvw-kills-blue").html(kills["blue"]);
        widget.find(".wvw-kills-green").html(kills["green"]);
        
        widget.find(".wvw-deaths-red").html(deaths["red"]);
        widget.find(".wvw-deaths-blue").html(deaths["blue"]);
        widget.find(".wvw-deaths-green").html(deaths["green"]);
        
        widget.find(".wvw-kd-red").html((kills["red"] / deaths["red"]).toFixed(2));
        widget.find(".wvw-kd-blue").html((kills["blue"] / deaths["blue"]).toFixed(2));
        widget.find(".wvw-kd-green").html((kills["green"] / deaths["green"]).toFixed(2));
    }

    self._drawMapMarkers = function () {
        if (wvwMap !== undefined && wvwMap.getMap() !== undefined && wvwMap.getObjectiveMarkers() !== undefined) {
            var objMarkers = wvwMap.getObjectiveMarkers();
            for (var mapIndex in self.matchDetails.maps) {
                var objectives = self.matchDetails.maps[mapIndex].objectives;
                for (var objIndex in objectives) {
                    var objective = objectives[objIndex];
                    var marker = objMarkers[objective.id];
                    if (marker !== undefined) {
                        var markerDiv = $(marker._icon);
                        
                        var popupHtml = '<div class="wvw-objective-popup">\n\
                                            <table style="width: 100%"><tr><td class="wvw-objective-name">'+marker.objectiveDetails.name+'</td>\n\
                                            <td class="objective-header-object" title="Point Per Tick"><div><div class="objective-ppt-label">'+objective.points_tick+' +</div>\n\
                                            <img class="objective-ppt" src="'+wvwMapConfig.installDirectory+'/images/ppt.png"></div></td>\n\
                                            <td class="objective-header-object" title="Yaks Delivered"><div><div class="yaks-delivered-label">'+objective.yaks_delivered+'</div>\n\
                                            <img class="yaks-delivered" src="'+wvwMapConfig.installDirectory+'/images/dolly.png"></div></td></tr></table>\n\
                                            <div class="wvw-objective-popup-container">';
                        
                        //Draw guild icon if claimed
                        var loadingGuildNameMessage = "Fetching guild name...";
                        if(objective.claimed_by !== null){
                            if(!(objective.claimed_by in self.guildDetails)){
                                self._fetchGuildDetails(objective.claimed_by, self._callbackGuildDetails(marker, loadingGuildNameMessage));
                            }
                            
                            markerDiv.find(".wvw-guild-icon-marker").show();
                            popupHtml += '<img class="claimed-by-img" src="http://guilds.gw2w2w.com/'+objective.claimed_by+'.svg">';
                        } else {
                            markerDiv.find(".wvw-guild-icon-marker").hide();
                        }
                        
                        popupHtml += '<div class="wvw-marker-popup-details">';
                        
                        
                        if(objective.claimed_by !== null){
                            popupHtml += '<div class="claimed-by popup-detail">'
                                    + (objective.claimed_by in self.guildDetails 
                                        ? "<b>[" + self.guildDetails[objective.claimed_by].tag + "]</b> " + self.guildDetails[objective.claimed_by].name 
                                        : loadingGuildNameMessage)
                                    +'</div>';
                        }
                        
                        var lastFlippedTime = new Date(objective["last_flipped"]).getTime();
                        var currentTimestamp = new Date().getTime();
                        var timeSinceFlipped = currentTimestamp - lastFlippedTime;
                        popupHtml += '<div class="captured-since popup-detail">Flipped ' +self._msToDHMSLossy(timeSinceFlipped)+' ago</div>';
                        
                        if (currentTimestamp - lastFlippedTime < self.righteous_indignation_time) {
                            markerDiv.find(".cooldown-container").show();
                            self.updateCircles[objective.id] = {"flipped": lastFlippedTime};
                        } else {
                            markerDiv.find(".cooldown-container").hide();
                            delete self.updateCircles[objective.id];
                        }

                        self._updateCooldownCircle(marker, lastFlippedTime, currentTimestamp, self.righteous_indignation_time);

                        markerDiv.find(".www-obj-badge").attr('class', "www-obj-badge wvw-obj-" + objective.owner);

                        //popupHtml += '<div class="wvw-ppt-ppc-label popup-detail">PPT/PPC: '+objective.points_tick+'</div>';
                        
                        //Yaks AKA upgrade status
                        var shieldDiv = '';
                        if (objective.yaks_delivered >= 20) {
                            shieldDiv += '<div class="wvw-shield-1"></div>';
                        }
                        if (objective.yaks_delivered >= 60) {
                            shieldDiv += '<div class="wvw-shield-2"></div>';
                        }
                        if (objective.yaks_delivered >= 140) {
                            shieldDiv += '<div class="wvw-shield-3"></div>';
                            if (objective.type === "Keep" || objective.type === "Castle") {
                                markerDiv.find(".wvw-waypoint").show();
                            } else {
                                markerDiv.find(".wvw-waypoint").hide();
                            }
                        } else {
                            markerDiv.find(".wvw-waypoint").hide();
                        }

                        markerDiv.find(".wvw-shield-container").html(shieldDiv);
                        
                        //popupHtml += "<div class='popup-detail'>Yaks delivered: "+objective.yaks_delivered+"</div>"
                        
                        /*popupHtml += '<div class="popup-detail" style="height: 36px;">\n\
                                        <div>\n\
                                            <div style="height: 16px;">\n\
                                                <img class="obj-tier-1" src="'+wvwMapConfig.installDirectory+'/images/tier1.png">\n\
                                                <img class="obj-tier-2" src="'+wvwMapConfig.installDirectory+'/images/tier2.png">\n\
                                                <img class="obj-tier-3" src="'+wvwMapConfig.installDirectory+'/images/tier3.png">\n\
                                            </div>\n\
                                            <div class="tier-bar-outer">\n\
                                                <div class="tier-bar-base tier-3-bar"></div>\n\
                                                <div class="tier-bar-base tier-2-bar"></div>\n\
                                                <div class="tier-bar-base tier-1-bar"></div>\n\
                                                <div class="tier-bar-base tier-bar-progress" style="width: '+((objective.yaks_delivered / 140) * 100) +'%"></div>\n\
                                                <div class="wvw-score-bar-text-blue wvw-score-bar-server-name">Yaks</div>\n\
                                            </div>\n\
                                        </div>\n\
                                    </div>';*/
                        
                        popupHtml += "</div></div></div>";
                        
                        //Edit marker popup
                        marker.bindPopup(popupHtml, {autoPan:false, closeButton: false, autoPanPadding: 100});
                    }
                }
            }
        }
    };
    
    self._callbackGuildDetails = function(marker, replace) {
        return function(details){
            self.guildDetails[details.id] = details;
            marker._popup.setContent(marker._popup.getContent().replace(replace, "<b>[" + details.tag + "]</b> " + details.name));
        };
    };

    /**
     * Update each marker that current has RI cooldown displayed
     * @returns {undefined}
     */
    self._updateCooldownCircles = function () {
        var currentTimestamp = new Date().getTime();

        for (var objectiveId in self.updateCircles) {
            var marker = wvwMap.getObjectiveMarkers()[objectiveId];

            //Update the objective markers RI timer
            self._updateCooldownCircle(marker, self.updateCircles[objectiveId].flipped, currentTimestamp, self.righteous_indignation_time);
        }

        //Loop
        setTimeout(function () {
            self._updateCooldownCircles();
        }, 1000);
    };

    /**
     * Update an objectives cooldown indicator
     * @param {type} marker
     * @param {type} lastFlipped
     * @param {type} currentTime
     * @param {type} cooldownTotal
     * @returns {undefined}
     */
    self._updateCooldownCircle = function (marker, lastFlipped, currentTime, cooldownTotal) {
        var timeSinceLastFlipped = currentTime - lastFlipped;

        if (timeSinceLastFlipped >= cooldownTotal) {
            //Remove cooldown indicator, as timer has run out
            $(marker._icon).find(".cooldown-container").hide();
            //Remove the marker from the list of markers being updated
            delete self.updateCircles[marker];
            //Stop and return here. Nothing more to do
            return;
        }

        //How many degrees the circle should show, depending on the time left before RI runs out
        var degrees = (360 / cooldownTotal) * timeSinceLastFlipped;

        var markerDiv = $(marker._icon);
        var borderDiv = markerDiv.find(".cooldown-border");
        var textDiv = markerDiv.find(".cooldown-text");
        //Apply time left label
        textDiv.text(self._msToMS(cooldownTotal - timeSinceLastFlipped));

        //Draw circle pie circle indicating the time remaining
        var timeLeftColor = "red";
        var timeSpentColor = "gray";
        if (degrees <= 180) {
            borderDiv.css('background-image', 'linear-gradient(' + (90 + degrees) + 'deg, transparent 50%, ' + timeLeftColor + ' 50%),linear-gradient(90deg, ' + timeLeftColor + ' 50%, transparent 50%)');
        } else {
            borderDiv.css('background-image', 'linear-gradient(' + (degrees - 90) + 'deg, transparent 50%, ' + timeSpentColor + ' 50%),linear-gradient(90deg, ' + timeLeftColor + ' 50%, transparent 50%)');
        }
    };

    /*
     * Convert milliseconds to minutes and seconds
     * @param {type} millis
     * @returns {String}
     */
    self._msToMS = function (millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    };
    
    self._msToDHMS = function (ms) {
        var t = self._convertMS(ms);
        var timeString = "";
        var first = true;
        
        if(t.d !== 0){
            first = false;
            timeString += t.d + " day";
            if(t.d !== 1) timeString += "s";
        }
        
        if(t.h !== 0){
            if(!first) timeString += ", ";
            first = false;
            timeString += t.h + " hour";
            if(t.h !== 1) timeString += "s";
        }
        
        if(t.m !== 0){
            if(!first) timeString += ", ";
            first = false;
            timeString += t.m + " min";
            if(t.m !== 1) timeString += "s";
        }
        
        if(t.s !== 0){
            if(!first) timeString += ", ";
            first = false;
            timeString += t.s + " sec";
            if(t.s !== 1) timeString += "s";
        }
        return timeString;
    };
    
    self._msToDHMSLossy = function (milliseconds) {
        function numberEnding (number) {
            return (number > 1) ? 's' : '';
        }

        var temp = Math.floor(milliseconds / 1000);
        var years = Math.floor(temp / 31536000);
        if (years) {
            return years + ' year' + numberEnding(years);
        }
        //TODO: Months! Maybe weeks? 
        var days = Math.floor((temp %= 31536000) / 86400);
        if (days) {
            return days + ' day' + numberEnding(days);
        }
        var hours = Math.floor((temp %= 86400) / 3600);
        if (hours) {
            return hours + ' hour' + numberEnding(hours);
        }
        var minutes = Math.floor((temp %= 3600) / 60);
        if (minutes) {
            return minutes + ' minute' + numberEnding(minutes);
        }
        var seconds = temp % 60;
        if (seconds) {
            return seconds + ' second' + numberEnding(seconds);
        }
        return 'less than a second'; //'just now' //or other string you like;
    }
    
    self._convertMS = function (ms) {
        var d, h, m, s;
        s = Math.floor(ms / 1000);
        m = Math.floor(s / 60);
        s = s % 60;
        h = Math.floor(m / 60);
        m = m % 60;
        d = Math.floor(h / 24);
        h = h % 24;
        return { d: d, h: h, m: m, s: s };
    };
    
    self._fetchGuildDetails = function(guildId, callback){
        $.getJSON("https://api.guildwars2.com/v2/guild/"+guildId, callback);
    };

    /*
     * ***************************
     * LOTS OF PRE SAVED VARIABLES 
     * *************************** 
     */

    //Easy conversion from string color name to an id
    self.colorToId = {
        Red: 0,
        RedHome: 0,
        Blue: 1,
        BlueHome: 1,
        Green: 2,
        GreenHome: 2
    };

    //Pre-saved list of server names to avoid contacting the GW2 api each time to fetch
    //the server names
    self.world_names = {
        1001: ["AR", "Anvil Rock"],
        1002: ["BP", "Borlis Pass"],
        1003: ["YB", "Yak's Bend"],
        1004: ["HoD", "Henge of Denravi"],
        1005: ["Maguuma", "Maguuma"],
        1006: ["SF", "Sorrow's Furnace"],
        1007: ["GoM", "Gate of Madness"],
        1008: ["JQ", "Jade Quarry"],
        1009: ["FA", "Fort Aspenwood"],
        1010: ["EB", "Ehmry Bay"],
        1011: ["SI", "Stormbluff Isle"],
        1012: ["DH", "Darkhaven"],
        1013: ["SoR", "Sanctum of Rall"],
        1014: ["CD", "Crystal Desert"],
        1015: ["IoJ", "Isle of Janthir"],
        1016: ["SoS", "Sea of Sorrows"],
        1017: ["TC", "Tarnished Coast"],
        1018: ["NSP", "Northern Shiverpeaks"],
        1019: ["BG", "Blackgate"],
        1020: ["FC", "Ferguson's Crossing"],
        1021: ["DB", "Dragonbrand"],
        1022: ["Kaineng", "Kaineng"],
        1023: ["DR", "Devona's Rest"],
        1024: ["ET", "Eredon Terrace"],
        2001: ["FoW", "Fissure of Woe"],
        2002: ["Deso", "Desolation"],
        2003: ["Gandara", "Gandara"],
        2004: ["Blacktide", "Blacktide"],
        2005: ["RoF", "Ring of Fire"],
        2006: ["UW", "Underworld"],
        2007: ["FSP", "Far Shiverpeaks"],
        2008: ["WR", "Whiteside Ridge"],
        2009: ["RoS", "Ruins of Surmia"],
        2010: ["SFR", "Seafarer's Rest"],
        2011: ["Vabbi", "Vabbi"],
        2012: ["PS", "Piken Square"],
        2013: ["AG", "Aurora Glade"],
        2014: ["GH", "Gunnar's Hold"],
        2101: ["JS [FR]", "Jade Sea [FR]"],
        2102: ["FR [FR]", "Fort Ranik [FR]"],
        2103: ["AR [FR]", "Augury Rock [FR]"],
        2104: ["VZ [FR]", "Vizunah Square [FR]"],
        2105: ["AS [FR]", "Arborstone [FR]"],
        2201: ["Kodash [DE]", "Kodash [DE]"],
        2202: ["RS [DE]", "Riverside [DE]"],
        2203: ["ER [DE]", "Elona Reach [DE]"],
        2204: ["AM [DE]", "Abaddon's Mouth [DE]"],
        2205: ["DL [DE]", "Drakkar Lake [DE]"],
        2206: ["MS [DE]", "Miller's Sound [DE]"],
        2207: ["DZ [DE]", "Dzagonur [DE]"],
        2301: ["BB [SP]", "Baruch Bay [SP]"]
    };

    self._preInit();
}