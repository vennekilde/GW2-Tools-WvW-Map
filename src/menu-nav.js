var toggle = getCookie("menu-toggle");
//Default
if (toggle === undefined || toggle === null) {
    toggle = true;
} else {
    if(toggle === "false"){
        toggle = false;
    }
}

$(function () {
    $(".sidebar-icon").click(function () {
        toggle = !toggle;
        toggleMenu(toggle);

        setCookie("menu-toggle", toggle, 9999);
    });
    
    
    $('.menu-toggle').click(function(){
        if(toggle){
            $(this).parent().removeClass("menu-toggle-collapsed").addClass("menu-toggle-collapsed-back");
            
            toggle = false;
            toggleMenu(toggle);
        } else {
            if($(this).parent().hasClass("menu-toggle-collapsed")){
                $(this).parent().removeClass("menu-toggle-collapsed").addClass("menu-toggle-collapsed-back");
            } else {
                $(this).parent().addClass("menu-toggle-collapsed").removeClass("menu-toggle-collapsed-back");
            }
        }
    });
})
function toggleMenu(toggle) {
    if (toggle)
    {
        $(".page-container").addClass("sidebar-collapsed").removeClass("sidebar-collapsed-back");
        $("#menu span").css({"position": "absolute"});
        $(".sidebar-menu").css({"overflow": "hidden"});
    } else
    {
        $(".page-container").removeClass("sidebar-collapsed").addClass("sidebar-collapsed-back");
        $("#menu span").css({"position": "relative"});
        setTimeout(function(){
            $(".sidebar-menu").css({"overflow": "auto"});
        }, 200);
    }
    
    // Create the event
    var event = document.createEvent("HTMLEvents");
    event.initEvent("menu-resized",true,false);

    // Dispatch/Trigger/Fire the event
    document.dispatchEvent(event);
}
toggleMenu(toggle);