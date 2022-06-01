
import { AblePlayerInstances } from "../../build/ableplayer.js";

let inter = setInterval(() => {
    if(AblePlayerInstances && AblePlayerInstances.length > 0) {
        clearInterval(inter);
        console.log( AblePlayerInstances );
        setup();

    }

}, 500);
const setup = () => {
    let accessiblePlayer = AblePlayerInstances[0];
    addTemplate();
    let $ablePlayerControls = $(".able-player").first();
    $(".able-vidcap-container").after( $ablePlayerControls[0]);
    $(".able-player").last().addClass("able-player-none");
}

$(document).on('pointerenter', '.toolbar_button', function() {
    $('.able-tooltip').first().text($(this).data('title'));
    console.log(  )
    $(".able-tooltip").first().css({ "left" : $(this).first().position().left + $(".able-tooltip").first().width() < $(".able-player").first().width() ? $(this).first().position().left : $(this).first().position().left - $(".able-tooltip").first().width() , "display" : "block"} );
});

let hidePopup = null;
$(document).on('mouseleave', '.toolbar_button', function() {
    $('.able-tooltip').first().text('').css({"display":"none"});
    hidePopup = setTimeout(() => {
        $(this).find(".able-" + $(this).data("element") ).css({"display":"none"});
    }, 300);

});

let video = $("#video_access");
$(document).on('click', '#play, #pause', function() {
    $(this).hide();
    if(video[0].paused) {
        $('#pause').css("display", "grid");
        video[0].play();
    }
    else {
        $('#play').css("display", "grid");
        video[0].pause();
    }
});

$(document).on('click', '#fullscreen-open, #fullscreen-close', function() {
    $(this).hide();
    if(document.fullscreen) {
        $('#fullscreen-open').css("display", "grid");
        document.exitFullscreen();
    }
    else {
        $(".able-wrapper")[0].requestFullscreen();
        $('#fullscreen-close').css("display", "grid");
    }
});

$(document).on('click', '.toolbar_button', function(e) {
    $('.able-tooltip').first().toggle();
    $(this).find(".able-" + $(this).data("element") ).toggle();
});

$(document).on('pointerenter click pointerleave', '.able-popup, .able-volume-slider', function(e) {
    switch( e.type ){
        case "click" :
            e.stopPropagation();
            $(this).css("display", "block");
            clearTimeout( hidePopup );
            break;
        case "pointerenter" :
            e.stopPropagation();
            $(this).css("display", "block");
            clearTimeout( hidePopup );
            break;
        case "pointerleave":
            $(this).css("display", "none");
            break;
    }
});

$(document).on('mouseenter drag', '.able-volume-head', function(e) {
    e.stopPropagation();
    switch ( e.type ){
        case "mouseenter" :
            $(this).draggable( { axis : "y", containment : ".able-volume-track", scroll: false })
            clearTimeout( hidePopup );
            break;
        case "drag" :
            $( ".able-volume-slider").show();
            clearTimeout( hidePopup );
            break;


    }
});

$(document).on('click', 'li', function(e) {
    e.stopPropagation();
    switch ( e.type ){
        case "click" :
            $(".able-popup-"+ $(this).data("parent")).first().find("li").each( (index, item) => {
                $(item).removeClass("able-focus");
                $(item).find("input")[0].checked = false;
            });
            $(this).addClass("able-focus");
            $(this).find("input")[0].checked = true;
    }
});

let hours = null, minutes = null, seconds = null;

$('#video_access').on('timeupdate',function(e) {
    //e.stopPropagation();
    hours = parseInt( video[0].currentTime / 360 );
    minutes = parseInt( ( video[0].currentTime - hours * 360 ) / 60 );
    seconds = parseInt((  video[0].currentTime - hours * 360 ) - minutes * 60 );
    $('.able-elapsedTime').text( minutes + ':' + seconds );
});

let startDragDirection = null;
let direction = null;
let step = null, vol = null, height = null;
$(document).on("dragstart", ".able-volume-head", (e) => {
    console.log( $(e.target).position() )
    step = 1 / $(".able-volume-track").first().height();
    startDragDirection = $(e.target).position().top;
})

$(document).on("drag", ".able-volume-head", (e) => {
    if( ( $(".able-volume-head").position().top - startDragDirection ) > 0 ){
        direction = "down";
    }else if( ( $(".able-volume-head").position().top - startDragDirection ) < 0 ) {
        direction = "up";
    }else{
        direction = "undefined";
    };
    if( direction === "down" || direction  === "up"){
        height = Math.abs( $(".able-volume-head").position().top + $(".able-volume-head").height() - $(".able-volume-track").first().height() );
        vol =  height* step;
        $(".able-volume-track-on").css("height", height );
    }
    video[0].volume = vol > 1 ? 1 : ( vol < 0 ? 0 : vol ) ;
})

function addTemplate() {
    $('.container').prepend($('#accesisble_toolbar').html());
}