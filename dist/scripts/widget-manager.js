function WidgetManager(){var e=this;e.init=function(){e.setupDraggables(),e.setupDroppables()},e.setupDraggables=function(){$(".ui-draggable").draggable({containment:"body",connectToSortable:".ui-droppable",appendTo:"body",refreshPositions:!1,start:function(o,i){$(".ui-droppable").addClass("ui-droppable-active"),$("#ui-widget-layer").addClass("ui-active"),$(".ui-lock-on-drag").addClass("ui-lock"),e.draggedParent=$(this).parent()[0],console.log("start")},stop:function(o,i){$(".ui-droppable").removeClass("ui-droppable-active"),$("#ui-widget-layer").removeClass("ui-active"),$(".ui-lock-on-drag").removeClass("ui-lock"),e.draggedParent=null,$(this).css("top",""),$(this).css("left",""),$(this).css("position",""),console.log("stop")}}),$(".ui-draggable").each(function(){})},e.setupDroppables=function(){$(".ui-droppable").sortable({hoverClass:"ui-widget-drop-hover",accept:".ui-draggable",containment:"body",tolerance:"pointer",appendTo:"body",start:function(o,i){var a=$(i.item[0]),t=$(this)[0];console.log(t.id+" --- "+e.draggedParent.id),i.placeholder.height(i.item.height()),e.draggedParent&&t.id!==e.draggedParent.id&&(a.appendTo(e.draggedParent),console.log("fixed"))},over:function(e,o){$(this).addClass("ui-widget-drop-hover")},out:function(e,o){$(this).removeClass("ui-widget-drop-hover")},stop:function(e,o){$(".ui-droppable").each(function(){var e=$(this).sortable("serialize").replace(/\[\]=/g,"-"),o="droppable-"+this.id;setCookie(o,e,9999)})}}),$(".ui-droppable").disableSelection(),$(".ui-droppable").each(function(){var e=getCookie("droppable-"+this.id);if(console.log(e),e)for(var o=e.split("&"),i=0;i<o.length;i++)console.log("#"+o[i]),$("#"+o[i]).appendTo(this)}),$("#widget-hidden-contianer").children().appendTo("#inactive-widgets")},e.init()}