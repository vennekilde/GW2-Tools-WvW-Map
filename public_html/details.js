/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


//Amount of images that has finished loading
var imagesLoaded = 0;
var TOTAL_IMAGES = 6; //const

var installDirectory = "/WvWMap";

var righteous_indignation_time = 1000 * 60 * 5;

var small = true;

var initBegan = false;
//Give map a fair chance to start up and fire event
//if not, just init the score and hope the map is ready at the next refresh
var initTimeout = setTimeout(function(){
    if(!initBegan){
        initBegan = true;
        preInit();
    }
}, 2000);
//Add map init event listener
document.addEventListener("wvw-map-initialized", function(e) {
    if(!initBegan){
        clearTimeout(initTimeout);
        initBegan = true;
        preInit();
    }
});
/*
 * Load all resources required
 * init() will be called when all resources
 * has been loaded
 */
function preInit(){
    window.wvwPPTCanvases = [];

    imageRed = new Image();
    imageRed.onload = function() {
        imageLoaded();
    };
    imageRed.src = installDirectory + "/images/redGlobe.png";
    imageBlue = new Image();
    imageBlue.onload = function() {
        imageLoaded();
    };
    imageBlue.src = installDirectory + "/images/blueGlobe.png";
    imageGreen = new Image();
    imageGreen.onload = function() {
        imageLoaded();
    };
    imageGreen.src = installDirectory + "/images/greenGlobe.png";



    imageRedSmall = new Image();
    imageRedSmall.onload = function() {
        imageLoaded();
    };
    imageRedSmall.src = installDirectory + "/images/redGlobe-small.png";
    imageBlueSmall = new Image();
    imageBlueSmall.onload = function() {
        imageLoaded();
    };
    imageBlueSmall.src = installDirectory + "/images/blueGlobe-small.png";
    imageGreenSmall = new Image();
    imageGreenSmall.onload = function() {
        imageLoaded();
    };
    imageGreenSmall.src = installDirectory + "/images/greenGlobe-small.png";
}

/*
 * Images are loaded asyncronized, which means it might start drawing before
 * it has even loaded all the necessary images required.
 * In order to fix this, the imagesLoaded will be increased by one each time
 * an image is loaded until everything has been loaded
 */
function imageLoaded(){
    imagesLoaded++;
    if(imagesLoaded >= TOTAL_IMAGES){
        init();
    }
}

function init(){
    initPPTChart();
    
    updateMatchup();
    updateLoop();
    updateCooldownCircles();
}


/*
 * Initialize a ChartJS instance of a pie chart that will represent
 * each servers current PPT (like in game)
 */
function initPPTChart(){
    console.log("initPPTChart");
    $(".wvw-ppt-canvas").each(function(){
        console.log("Found Score Module: ");
        console.log($(this));
        var contextCanvas = this.getContext("2d");

        //Load images
        var redPattern;
        var bluePattern;
        var greenPattern;
        if(small){
            redPattern = contextCanvas.createPattern(imageRedSmall, 'no-repeat');
            bluePattern = contextCanvas.createPattern(imageBlueSmall, 'no-repeat');
            greenPattern = contextCanvas.createPattern(imageGreenSmall, 'no-repeat');
        } else {
            redPattern = contextCanvas.createPattern(imageRed, 'no-repeat');
            bluePattern = contextCanvas.createPattern(imageBlue, 'no-repeat');
            greenPattern = contextCanvas.createPattern(imageGreen, 'no-repeat');
        }
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
                        greenPattern,
                    ],
                    borderColor : 'rgba(0,0,0,1)',
                }
            ]
        };

        //Chart config
        var chartConfig = {
            borderWidth: 3,
            type: "pie",
            animationSteps : 40,
            data: wvwData,
            options: {
                tooltips:{
                    enabled: !small,
                },
                legend: {
                    display: false,
                    responsive : true, 
                }
            },
        };
        //Create instance of chart
        var chart = new Chart(contextCanvas, chartConfig);
        chart["isSmall"] = small;
        window.wvwPPTCanvases.push(chart);
    });
}

/*
 * Keeps the widget up to date
 */
function updateLoop(){
    setTimeout(function(){ 
        updateMatchup(); //will call draw() at the end
        //loop
        updateLoop();
    }, REFRESH_TIME);
}

/*
 * Update matchup from the GW2 API
 */
function updateMatchup() {
    var self = this;
    $.getJSON("https://api.guildwars2.com/v2/wvw/matches?world="+world,
        function(matchDetails){
            //Store retrived matchup details in global variable
            self.matchDetails = matchDetails;
            
            processMatchupData();
            
            draw();
        }
    );
}

function processMatchupData(){
    calculatePPT();
}


/*
 * Calculate PPT based on objectives held by each server
 */
function calculatePPT(){
    //Borderlands & EternalBattlegrounds details
    var maps = matchDetails["maps"];
    var tempPPT = [0,0,0];
    //Determine PPT from each map
    for(var i = 0; i < maps.length; i++){
        var map = maps[i];
        var objectives = map["objectives"];
        //Determine PPT for each objective
        for(var k = 0; k < objectives.length; k++){
            var objective = objectives[k];
            //Check if objective is owned by any server
            if(!(typeof colorToId[objective["owner"]] === "undefined")){
                //Attribute objective ppt to its owner
                tempPPT[colorToId[objective["owner"]]] += objective["points_tick"];
            } 
        }
    }
    //Store calculated ppt in global variable
    ppt = tempPPT;
}

function draw(){
    drawScoreDetails();
    drawMapMarkers();
}


function drawScoreDetails(){
    //Get score from matchup details
    var warScore = matchDetails["victory_points"];
    
    //Draw war score
    $(".wvw-score-label-red").html(warScore["red"]);
    $(".wvw-score-label-blue").html(warScore["blue"]);
    $(".wvw-score-label-green").html(warScore["green"]);
    
    //Draw war score bars
    var maxScore = Math.max(warScore["red"], warScore["blue"], warScore["green"]);
    $(".wvw-score-red").width(100 * (warScore["red"] / maxScore) + "%");
    $(".wvw-score-blue").width(100 * (warScore["blue"] / maxScore) + "%");
    $(".wvw-score-green").width(100 * (warScore["green"] / maxScore) + "%");
    $(".wvw-score-bar-text-red").html(world_names[matchDetails["worlds"]["red"]][1]);
    $(".wvw-score-bar-text-blue").html(world_names[matchDetails["worlds"]["blue"]][1]);
    $(".wvw-score-bar-text-green").html(world_names[matchDetails["worlds"]["green"]][1]);

    //Draw warscore difference
    $(".wvw-score-diff-number-red").html(warScore["red"] == maxScore ? "Lead" : "-" + (maxScore - warScore["red"]));
    $(".wvw-score-diff-number-blue").html(warScore["blue"] == maxScore ? "Lead" : "-" + (maxScore - warScore["blue"]));
    $(".wvw-score-diff-number-green").html(warScore["green"] == maxScore ? "Lead" : "-" + (maxScore - warScore["green"]));
        
    $(".wvw-ppt-number-red").html(ppt[0]);
    $(".wvw-ppt-number-blue").html(ppt[1]);
    $(".wvw-ppt-number-green").html(ppt[2]);
    
    //Draw skirmish score bars
    var skirmishScore = matchDetails["skirmishes"][matchDetails["skirmishes"].length - 1]["scores"];
    var maxSkirmishScore = Math.max(skirmishScore["red"], skirmishScore["blue"], skirmishScore["green"]);
    $(".wvw-skirmish-number-red").width(100 * (skirmishScore["red"] / maxSkirmishScore) + "%");
    $(".wvw-skirmish-number-blue").width(100 * (skirmishScore["blue"] / maxSkirmishScore) + "%");
    $(".wvw-skirmish-number-green").width(100 * (skirmishScore["green"] / maxSkirmishScore) + "%");
    
    //Get score from matchup details
    $(".wvw-skirmish-number-label-red").html(skirmishScore["red"]);
    $(".wvw-skirmish-number-label-blue").html(skirmishScore["blue"]);
    $(".wvw-skirmish-number-label-green").html(skirmishScore["green"]);

    $(".wvw-skirmish-diff-number-red").html(skirmishScore["red"] == maxSkirmishScore ? "Lead" : "-" + (maxSkirmishScore - skirmishScore["red"]));
    $(".wvw-skirmish-diff-number-blue").html(skirmishScore["blue"] == maxSkirmishScore ? "Lead" : "-" + (maxSkirmishScore - skirmishScore["blue"]));
    $(".wvw-skirmish-diff-number-green").html(skirmishScore["green"] == maxSkirmishScore ? "Lead" : "-" + (maxSkirmishScore - skirmishScore["green"]));
    
    //Draw ppt circle
    for(var i = 0; i < window.wvwPPTCanvases.length; i++){
        var canvas = window.wvwPPTCanvases[i];
        if(!canvas["isSmall"]){
            canvas.data.labels[0] = world_names[matchDetails["worlds"]["red"]][0];
            canvas.data.labels[1] = world_names[matchDetails["worlds"]["blue"]][0];
            canvas.data.labels[2] = world_names[matchDetails["worlds"]["green"]][0];
        }
        canvas.data.datasets[0].data[0] = ppt[0];
        canvas.data.datasets[0].data[1] = ppt[1];
        canvas.data.datasets[0].data[2] = ppt[2];
        canvas.update();
    }
}
    
var updateCircles = {
    
}

function drawMapMarkers(){
    if(map !== undefined && objMarkers !== undefined){
        for(var mapIndex in matchDetails.maps){
            var objectives = matchDetails.maps[mapIndex].objectives;
            for(var objIndex in objectives){
                var objective = objectives[objIndex];
                var marker = objMarkers[objective.id];
                if(marker !== undefined){
                    var lastFlippedUnixTime = new Date(objective["last_flipped"]).getTime();
                    var currentTimestamp = new Date().getTime();
                    
                    var markerDiv = $(marker._icon);
                    if(currentTimestamp - lastFlippedUnixTime < righteous_indignation_time){
                        markerDiv.find(".cooldown-container").show();
                        updateCircles[objective.id] = {"flipped" : new Date(objective["last_flipped"]).getTime()};
                    } else {
                        markerDiv.find(".cooldown-container").hide();
                        delete updateCircles[objective.id];
                    }
                    
                    updateCooldownCircle(marker, lastFlippedUnixTime, currentTimestamp, righteous_indignation_time);
                    
                    markerDiv.find(".www-obj-badge").attr('class',"www-obj-badge wvw-obj-"+objective.owner);
                    
                    //Yaks AKA upgrade status
                    var shieldDiv = '';
                    if(objective.yaks_delivered >= 20){
                        shieldDiv += '<div class="wvw-shield-1"></div>';
                    }
                    if(objective.yaks_delivered >= 40){
                        shieldDiv += '<div class="wvw-shield-2"></div>';
                    }
                    if(objective.yaks_delivered >= 80){
                        shieldDiv += '<div class="wvw-shield-3"></div>';
                        if(objective.type == "Keep" || objective.type == "Castle"){
                            shieldDiv += '<div class="wvw-waypoint"></div>';
                        }
                    }
                    
                    markerDiv.find(".wvw-shield-container").html(shieldDiv);
                }
            }
        }
    }
}

function updateCooldownCircles(){
    var currentTimestamp = new Date().getTime();
    for(var objectiveId in updateCircles){
        var marker = objMarkers[objectiveId];
        
        updateCooldownCircle(marker, updateCircles[objectiveId].flipped, currentTimestamp, righteous_indignation_time);
    }
    
    setTimeout(function(){
        updateCooldownCircles();
    },1000);
}

function updateCooldownCircle(marker, lastFlipped, currentTime, cooldownTotal){
    var timeDifference = currentTime - lastFlipped;

    if(timeDifference >= cooldownTotal){
        $(marker._icon).find(".cooldown-container").hide();
        delete updateCircles[marker];
        return;
    }

    var i = (360 / cooldownTotal) * timeDifference;
    
    var markerDiv = $(marker._icon);
    var borderDiv = markerDiv.find(".cooldown-border");
    var textDiv = markerDiv.find(".cooldown-text");
    textDiv.text(millisToMinutesAndSeconds(cooldownTotal - timeDifference));

    if (i<=180){
        borderDiv.css('background-image','linear-gradient(' + (90+i) + 'deg, transparent 50%, red 50%),linear-gradient(90deg, red 50%, transparent 50%)');
    } else {
        borderDiv.css('background-image','linear-gradient(' + (i-90) + 'deg, transparent 50%, gray 50%),linear-gradient(90deg, red 50%, transparent 50%)');
    }
}


function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

/*
 * ***************************
 * LOTS OF PRE SAVED VARIABLES 
 * *************************** 
 */

//Easy conversion from string color name to an id
var colorToId = {
    Red: 0,
    RedHome: 0,
    Blue: 1,
    BlueHome: 1,
    Green: 2,
    GreenHome: 2
};

//Pre-saved list of server names to avoid contacting the GW2 api each time to fetch
//the server names
var world_names = {
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