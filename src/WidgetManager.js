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
                setCookie(event.target.id, JSON.stringify(ui.position), 999999999);
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
            }
        }); 
        $(".ui-droppable").disableSelection();
    };
    
    
    self.init();
}