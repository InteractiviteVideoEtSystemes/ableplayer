
import { AblePlayerInstances } from "../../build/ableplayer.js";

let inter = setInterval(() => {
    if(AblePlayerInstances && AblePlayerInstances.length > 0) {
        clearInterval(inter);
        console.log( AblePlayerInstances[0] );
        setup();

    }

}, 300);
const setup = () => {
    let accessiblePlayer = AblePlayerInstances[0];
    console.log( AblePlayerInstances[0].captionsPopup.clone( true ) )

    addTemplate();
    let $ablePlayerControls = $(".able-player").first();
    $(".able-vidcap-container").after($ablePlayerControls[0]);

    //Fill Caption Menu
    let $videoAccessCaptionMenu = $("#video-access-captions-menu > ul").empty();
    AblePlayerInstances[0].captionsPopup
        .clone( true )
        .find("li")
        .each( (index, li) =>
            $videoAccessCaptionMenu.append(
                $(li).data("parent", "captions")
                    .html( `<input type="radio" value="${index}" name="video1-captions-choice" id="video1-captions-${index}"
                                       lang="${$(li).attr("lang")}">
                                <label for="video1-captions-${index}">${$(li).text()}</label>`) ) );
    $(".able-player").last().addClass("able-player-none");
    //End

    $(document).on('pointerenter', '.toolbar_button', function () {
        let ableTooltip = ".able-tooltip";
        $('.able-tooltip')
            .first()
            .text($(this).data('title'))
            .css({
                "left": $(this).first().position().left + $(".able-tooltip").first().width() < $(".able-player").first().width() ? $(this).first().position().left : $(this).first().position().left - $(".able-tooltip").first().width(),
                "display": "block"
        });
    });

    let hidePopup = null;
    $(document).on('pointerleave', '.toolbar_button', function () {
        $('.able-tooltip').first().text('').css({"display": "none"});
        hidePopup = setTimeout(() => {
            $(this).find(".able-" + $(this).data("element")).css({"display": "none"});
        }, 300);

    });

    $('.toolbar_button').on('click',  function (e) {
        $('.able-tooltip').first().toggle();
        $(this).find(".able-" + $(this).data("element")).toggle();
    });

    let video = $("#video_access");

    let startDragDirection = null;
    let direction = null;
    let step = null, vol = null, height = null;
    //add Volume from Slider
    $( "#volumeSlider" ).slider({
        orientation: "vertical",
        range: "min",
        min: 0,
        max: 80,
        value: video[0].volume * 80,
        slide: (e, {value} ) => {
            if ( ( $("#volumeSlider .ui-slider-range").height() - startDragDirection ) > 0 ) {
                direction = "up";
            } else if (($("#volumeSlider .ui-slider-range").height() - startDragDirection) < 0) {
                direction = "down";
            } else {
                direction = "undefined";
            };
            startDragDirection = $("#volumeSlider .ui-slider-range").height();
            if (direction === "down" || direction === "up") {
                height = Math.abs($("#volumeSlider .ui-slider-range").height() );
                vol = height * step;
            }
            video[0].volume = vol > 1 ? 1 : (vol < 0 ? 0 : vol);
            console.log( `slide  always ${video[0].volume} ${direction}` )
        },
        start: (e, {handle, value}) => {
            step = 1 / 80;
            startDragDirection = $("#volumeSlider .ui-slider-range").height();
            console.log(`start slide ${value} ${handle}`)
        }
    });

    //add Seekbar by Slider
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

    $('#play, #pause').on('click',  function (e) {
        $(this).hide();
        if (video[0].paused) {
            $('#pause').css("display", "grid");
            video[0].play();
        } else {
            $('#play').css("display", "grid");
            video[0].pause();
        }
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

    $(' li , li[data-parent=captions]').on('click',  function (e) {
        e.stopPropagation();
        const changeStateCaption = (openSelector, state, closeSelector) => {
            $(openSelector).show();
            $(closeSelector).hide();
        }
        switch (e.type) {
            case "click" :
                $(".able-popup-" + $(this).data("parent")).first().find("li").each((index, item) => {
                    $(item).removeClass("able-focus");
                    $(item).find("input")[0].checked = false;
                });
                $(this).addClass("able-focus");
                $(this).find("input")[0].checked = true;
                $(".able-captions-wrapper").removeClass("able-captions-wrapper-on, able-captions-wrapper-off").addClass( "able-captions-wrapper-"+ $(this).data("captions-wrapper") )
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

        $(".able-elapsedTime").text( `${minutes}:${seconds}`);
    });

    $('#video_access').on('seeking seeked', function (e) {
        //e.stopPropagation();
        $(".able-seekbar-played").first().width( $("#seekbarr").slider( "value") );
        $(".able-seekbar-head").first().css( "left", ($("#seekbarr").slider( "value") - 4)+"px" );
    });

    $("#video_access").on('playing pause ended', function (e) {

        const changePlayPauseState = ( playSelector, playState, pauseSelector) => {
            $(playSelector).css("display", playState);
            $(pauseSelector).hide();
        }
        switch ( e.type ) {
            case 'pause':
                changePlayPauseState( "#play", "grid", "#pause", )
                break;
            case 'playing':
                changePlayPauseState( "#pause", "grid", "#play", )
                break;
            case 'ended':
                changePlayPauseState( "#play", "grid", "#pause", )
                break;

        }
    });

    $('#video_access').on("progress", (e) => {
        //e.stopPropagation();
        bufferedWidth = !video[0].buffered.length ? 0 : video[0].buffered.end(.3)
        stepSeek = $(".able-seekbar").first().width() / video[0].duration;
        $(".able-seekbar-loaded").first().width( stepSeek * bufferedWidth );
    })

    $('#video_access').on("loadedmetadata", (e) => {
        //e.stopPropagation();
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


}

function addTemplate() {
    $('.container').prepend($('#accesisble_toolbar').html());
}

const convertToTime = ( size ) => {
    let [hours, minutes, seconds] = [null, null, null];
    hours = parseInt(size / 360);
    minutes = parseInt( ( size - ( hours * 360 ) ) / 60);
    seconds = parseInt( ( size - (hours * 360) ) - (minutes * 60) );


    return [ formatTime(hours), formatTime( minutes ), formatTime( seconds ) ];
}

const formatTime = (time) => time.toString().length > 1 ? time : `0${time}`;