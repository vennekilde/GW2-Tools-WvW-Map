/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function WidgetManager(){
    var self = this;
    var draggedParent;
    
    self.init = function(){
        self.setupDraggables();
        self.setupDroppables();
    };
    
    self.setupDraggables = function(){
        $( ".ui-draggable" ).draggable({
            containment: "body",
            connectToSortable: ".ui-droppable",
            appendTo: 'body',
            refreshPositions: false,
            start: function(event, ui){
                $( ".ui-droppable" ).addClass("ui-droppable-active");
                $( "#ui-widget-layer" ).addClass("ui-active");
                $( ".ui-lock-on-drag" ).addClass("ui-lock");
                self.draggedParent = $(this).parent()[0];
                console.log("start")
            },
            stop: function(event, ui){
                $( ".ui-droppable" ).removeClass("ui-droppable-active");
                $( "#ui-widget-layer" ).removeClass("ui-active");
                $( ".ui-lock-on-drag" ).removeClass("ui-lock");
                self.draggedParent = null;
                $(this).css("top","");
                $(this).css("left","");
                $(this).css("position","");
                console.log("stop")
                //setCookie(event.target.id, JSON.stringify(ui.position), 9999);
            }
        });
        $( ".ui-draggable" ).each(function(){
            //$(this).width($(this).width());
            /*var positionStr = getCookie((this.id));
            if(positionStr !== undefined && positionStr !== null){
                var position = JSON.parse(positionStr);
                $(this).css({top: position.top, left: position.left, visibility: 'visible'});
            } else {
                $(this).css({visibility: 'visible'});
            }*/
        });
    };
    self.setupDroppables =  function(){
        $(".ui-droppable").sortable({
            hoverClass: "ui-widget-drop-hover",
            accept: ".ui-draggable",
            containment: "body",
            tolerance: "pointer",
            appendTo: 'body',
            start: function(event, ui){
                var draggable = $(ui.item[0]);
                var sortable = $(this)[0];
                console.log(sortable.id + " --- " + self.draggedParent.id);
                ui.placeholder.height(ui.item.height());
                if(self.draggedParent && sortable.id !== self.draggedParent.id){
                    draggable.appendTo(self.draggedParent);
                    console.log("fixed");
                }
            },
            over : function(event, ui){
                $(this).addClass('ui-widget-drop-hover');
            },
            out : function(event, ui){
                $(this).removeClass('ui-widget-drop-hover');
            },
            stop: function (event, ui) {
                $( ".ui-droppable" ).each(function(){
                    //Use replace []= to - due to - being somewhat wonky with sortable serialize
                    var data = $(this).sortable('serialize').replace(/\[\]=/g,"-");
                    var id = "droppable-" + this.id;
                    setCookie(id, data, 9999);
                });
            }
        }); 
        $(".ui-droppable").disableSelection();
        
        $( ".ui-droppable" ).each(function(){
            var positionStr = getCookie("droppable-"+this.id);
            console.log(positionStr);
            if(positionStr){
                var widgetIds = positionStr.split("&");
                for (var i=0; i < widgetIds.length; i++) {
                    console.log("#"+widgetIds[i])
                     $("#"+widgetIds[i]).appendTo(this);
                }
            }
        });
        
        $("#widget-hidden-contianer").children().appendTo("#inactive-widgets");
    };
    
    
    self.init();
}