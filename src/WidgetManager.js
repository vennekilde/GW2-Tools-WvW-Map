/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function WidgetManager(){
    var self = this;
    
    self.init = function(){
        self.setupDraggables();
        self.setupDroppables();
    };
    
    self.setupDraggables = function(){
        $( ".ui-draggable" ).draggable({
            containment: "#map",
            connectToSortable: ".ui-droppable",
            appendTo: 'body',
            revert: 'invalid',
            refreshPositions: true,
            start: function(event, ui){
                $( ".ui-droppable" ).addClass("ui-droppable-active");
                $( "#ui-widget-layer" ).addClass("ui-active");
            },
            stop: function(event, ui){
                $( ".ui-droppable" ).removeClass("ui-droppable-active");
                $( "#ui-widget-layer" ).removeClass("ui-active");
                //setCookie(event.target.id, JSON.stringify(ui.position), 9999);
            }
        });
        $( ".ui-draggable" ).each(function(){
            $(this).width($(this).width());
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
            containment: "#map",
            tolerance: "pointer",
            scroll: false,
            start: function(e, ui){
                //ui.placeholder.height(ui.item.height());
            },
            over : function(){
                $(this).addClass('ui-widget-drop-hover');
            },
            out : function(){
                $(this).removeClass('ui-widget-drop-hover');
            },
            stop: function (event, ui) {
                $( ".ui-droppable" ).each(function(){
                    //Use replace []= to - due to - being somewhat wonky with sortable serialize
                    console.log(this);
                    var data = $(this).sortable('serialize').replace(/\[\]=/g,"-");
                    var id = "droppable-" + this.id;
                    console.log(data);
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
    };
    
    
    self.init();
}