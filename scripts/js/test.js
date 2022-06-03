
import { AblePlayerInstances } from "../../build/ableplayer.js";

let inter = setInterval(() => {
    if(AblePlayerInstances && AblePlayerInstances.length > 0) {
        clearInterval(inter);
        console.log( AblePlayerInstances );
        setup();

    }

}, 300);
const setup = () => {
    let accessiblePlayer = AblePlayerInstances[0];
    addTemplate();
    let $ablePlayerControls = $(".able-player").first();
    $(".able-vidcap-container").after($ablePlayerControls[0]);
    $(".able-player").last().addClass("able-player-none");


    $(document).on('pointerenter', '.toolbar_button', function () {
        $('.able-tooltip').first().text($(this).data('title'));
        console.log()
        $(".able-tooltip").first().css({
            "left": $(this).first().position().left + $(".able-tooltip").first().width() < $(".able-player").first().width() ? $(this).first().position().left : $(this).first().position().left - $(".able-tooltip").first().width(),
            "display": "block"
        });
    });

    let hidePopup = null;
    $(document).on('mouseleave', '.toolbar_button', function () {
        $('.able-tooltip').first().text('').css({"display": "none"});
        hidePopup = setTimeout(() => {
            $(this).find(".able-" + $(this).data("element")).css({"display": "none"});
        }, 300);

    });

    let video = $("#video_access");

    $( "#seekbarr" ).css( { "width": $(".able-seekbar").first().width(), "height" : $(".able-seekbar").first().height() } ).slider({
        orientation: "horizontal",
        range: "min",
        min: 0,
        max: $(".able-seekbar").first().width(),
        value: 0,
        slide: (e, ui ) => {
            video[0].currentTime = ui.value / stepSeek;
        }
    });

    $('#play, #pause').on('click',  function () {
        $(this).hide();
        if (video[0].paused) {
            $('#pause').css("display", "grid");
            video[0].play();
        } else {
            $('#play').css("display", "grid");
            video[0].pause();
        }
    });

    $('#fullscreen-open, #fullscreen-close').on('click',  function () {
        $(this).hide();
        if (document.fullscreen) {
            $('#fullscreen-open').css("display", "grid");
            document.exitFullscreen();
        } else {
            $(".able-wrapper")[0].requestFullscreen();
            $('#fullscreen-close').css("display", "grid");
        }
    });

    $('.toolbar_button').on('click',  function (e) {
        $('.able-tooltip').first().toggle();
        $(this).find(".able-" + $(this).data("element")).toggle();
    });

    $('.able-popup, .able-volume-slider').on('pointerenter click pointerleave',  function (e) {
        switch (e.type) {
            case "click" :
                e.stopPropagation();
                $(this).css("display", "block");
                clearTimeout(hidePopup);
                break;
            case "pointerenter" :
                e.stopPropagation();
                $(this).css("display", "block");
                clearTimeout(hidePopup);
                break;
            case "pointerleave":
                $(this).css("display", "none");
                break;
        }
    });

    $('.able-volume-head').on('mouseenter drag', function (e) {
        e.stopPropagation();
        switch (e.type) {
            case "mouseenter" :
                $(this).draggable({axis: "y", containment: ".able-volume-track", scroll: false})
                clearTimeout(hidePopup);
                break;
            case "drag" :
                $(".able-volume-slider").show();
                clearTimeout(hidePopup);
                break;


        }
    });

    $('li').on('click',  function (e) {
        e.stopPropagation();
        switch (e.type) {
            case "click" :
                $(".able-popup-" + $(this).data("parent")).first().find("li").each((index, item) => {
                    $(item).removeClass("able-focus");
                    $(item).find("input")[0].checked = false;
                });
                $(this).addClass("able-focus");
                $(this).find("input")[0].checked = true;
        }
    });

    let [hours, minutes, seconds, bufferedWidth, playedWidth, stepSeek] = [null, null, null, null, null, null];

    $('#video_access').on('timeupdate', function (e) {
        //e.stopPropagation();
        [hours, minutes, seconds] = convertToTime( video[0].currentTime );
        stepSeek = $(".able-seekbar").first().width() / video[0].duration;
        playedWidth = !video[0].played.length ? $("#seekbarr").slider( "value") / stepSeek : video[0].currentTime
        $(".able-seekbar-played").first().width( stepSeek * playedWidth );
        $(".able-seekbar-head").first().css( "left", (stepSeek * playedWidth - 4)+"px" );
        $("#seekbarr").slider( "value", stepSeek * playedWidth );
    });

    $('#video_access').on('seeking seeked', function (e) {
        //e.stopPropagation();
        $(".able-seekbar-played").first().width( $("#seekbarr").slider( "value") );
        $(".able-seekbar-head").first().css( "left", ($("#seekbarr").slider( "value") - 4)+"px" );
    });

    $('#video_access').on("progress", (e) => {
        e.stopPropagation();
        bufferedWidth = !video[0].buffered.length ? 0 : video[0].buffered.end(.3)
        stepSeek = $(".able-seekbar").first().width() / video[0].duration;
        $(".able-seekbar-loaded").first().width( stepSeek * bufferedWidth );
    })

    $('#video_access').on("loadedmetadata", (e) => {
        e.stopPropagation();
        bufferedWidth = !video[0].buffered.length ? 0 : video[0].buffered.end(.3)
        stepSeek = $(".able-seekbar").first().width() / video[0].duration;
        $(".able-seekbar-loaded").first().width( stepSeek * bufferedWidth );
    })

    $(".able-seekbar").first().on('pointerenter pointermove',(e) => {
        var parentOffset = $(".able-seekbar").offset();
        var relX = e.pageX - parentOffset.left;
        stepSeek = $(".able-seekbar").first().width() / video[0].duration;
        let [hours, minutes, seconds] = convertToTime( relX / stepSeek );
        $(".able-seekbar").first().find(".able-tooltip").css({ "display" : "block", "left": relX+"px", "top": "-40px"}).text( minutes + ':' + seconds )
    });

    $(".able-seekbar").first().on('pointerout',(e) => {
        $(".able-seekbar").first().find(".able-tooltip").css("display", "none");
    });

    let startDragDirection = null;
    let direction = null;
    let step = null, vol = null, height = null;
    $(document).on("dragstart", ".able-volume-head", (e) => {
        step = 1 / $(".able-volume-track").first().height();
        startDragDirection = $(e.target).position().top;
    })

    $(".able-volume-head").on("drag", (e) => {
        if (($(".able-volume-head").position().top - startDragDirection) > 0) {
            direction = "down";
        } else if (($(".able-volume-head").position().top - startDragDirection) < 0) {
            direction = "up";
        } else {
            direction = "undefined";
        }
        ;
        if (direction === "down" || direction === "up") {
            height = Math.abs($(".able-volume-head").position().top + $(".able-volume-head").height() - $(".able-volume-track").first().height());
            vol = height * step;
            $(".able-volume-track-on").css("height", height);
        }
        video[0].volume = vol > 1 ? 1 : (vol < 0 ? 0 : vol);
    })


}

function addTemplate() {
    $('.container').prepend($('#accesisble_toolbar').html());
}

const convertToTime = ( size ) => {
    let [hours, minutes, seconds] = [null, null, null];
    hours = parseInt(size / 360);
    minutes = parseInt( ( size - ( hours * 360 ) ) / 60);
    seconds = parseInt( ( size - (hours * 360) ) - (minutes * 60) );
    return [ hours, minutes, seconds ];
}