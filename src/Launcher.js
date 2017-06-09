/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

"use strict";
//Attempt to identify installed web path
var scripts = document.getElementsByTagName('script');
var path = this.scripts[this.scripts.length-1].src.split('?')[0];      // remove any ?query
var installDirectory = this.path.split('/').slice(0, -1).join('/')+'/';  // remove last filename part of path

var wvwMapConfig = {
    world: 2007,
    debug: true,
    installDirectory: installDirectory
};

console.log(wvwMapConfig);

var wvwMap, matchupFetcher;

$(function() {
    wvwMap = new WvWMap();
    
    var initBegan = false;
    //Give map a fair chance to start up and fire event
    //if not, just init the score and hope the map is ready at the next refresh
    var initTimeout = setTimeout(function(){
        if(!initBegan){
            initBegan = true;
            matchupFetcher = new MatchupFetcher();
        }
    }, 2000);
    //Add map init event listener
    document.addEventListener("wvw-map-initialized", function(e) {
        if(!initBegan){
            clearTimeout(initTimeout);
            initBegan = true;
            matchupFetcher = new MatchupFetcher();
        }
    });
});

//var matchupFetcher = new MatchupFetcher();