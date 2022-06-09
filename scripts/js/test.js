import { AblePlayerInstances } from "../../build/ableplayer.js";

let inter = setInterval(() => {
    if(AblePlayerInstances && AblePlayerInstances.length > 0) {
        clearInterval(inter);
        rearrangeControls( AblePlayerInstances[0] );
    }
}, 800);

const rearrangeControls = ( ablePlayer ) => {

    //Hide Status Bar
    ablePlayer.$statusBarDiv.hide();

    //Hide left and right controls
    ablePlayer.$controllerDiv.find(".able-left-controls, .able-right-controls").hide();


    ablePlayer.$accessMenuDiv = $("#video_access-accmenu");
    ablePlayer.$accessMenuButton = $(".able-button-handler-accmenu");


    //append all controls
    ablePlayer.$controllerDiv
        .append( ablePlayer.$tooltipDiv )
        .append( ablePlayer.$playpauseButton )
        .append( ablePlayer.$volumeButton)
        .append( ablePlayer.$volumeSlider)
        //.append( ablePlayer.$signButton )
        .append( ablePlayer.$accessMenuButton )
        .append( ablePlayer.seekBar.wrapperDiv)
        .append( ablePlayer.$timer)
        .append( ablePlayer.$ccButton )
        .append( ablePlayer.$fullscreenButton )
        .append( ablePlayer.captionsPopup )
        .append( ablePlayer.$accessMenuDiv );

    ablePlayer.$signButton.find("svg").html( '<svg focusable="false" aria-hidden="true" viewBox="0 0 15 20"><circle cx="8" cy="10" r="9" stroke="white" stroke-width="1.5" fill="transparent"></circle><path d="m 6.4715267,4.8146068 c 0,-0.6982433 0.5444396,-1.2649335 1.2152669,-1.2649335 0.6708273,0 1.2152668,0.5666902 1.2152668,1.2649335 0,0.6982434 -0.5444395,1.2649336 -1.2152668,1.2649336 -0.6708273,0 -1.2152669,-0.5666902 -1.2152669,-1.2649336 z M 9.3071494,7.7661184 13.479566,5.8931735 13.17899,5.109758 8.0918825,6.9228294 H 7.2817046 L 2.1945976,5.109758 1.8940216,5.8931735 6.0664378,7.7661184 v 3.3731566 l -1.6616749,5.59438 0.7575163,0.299367 2.3511363,-5.472103 h 0.3475663 l 2.3511362,5.472103 0.757517,-0.299367 -1.6616754,-5.59438 z"></path></svg>')
    //Change the default position of the slider volume
    ablePlayer.$volumeSlider.css("left", ablePlayer.$volumeButton.position().left ).on( "click" , function (e) {
        

    })

    //Hide the clear both div
    $('div').each( (i, el) => $(el).css("clear") !== 'both' ? null : $(el).hide());

    //Insert Input in Each element of Caption Menu
    ablePlayer.captionsPopup
        .find("li")
        .each( (index, li) =>
            $(li).data("parent", "captions")
                .html( `<input type="radio" ${ $(li).attr("aria-checked") === 'true' ? "checked" : '' } value="${index}" name="video1-captions-choice" id="video1-captions-${index}"
                                       lang="${$(li).attr("lang")}">
                                <label for="video1-captions-${index}">${$(li).text()}</label>`) );
    //End


    /**
     * Insert pointerleave and pointerenter events to access menu Button
     */
    $(".able-button-handler-accmenu").on("pointerenter pointerleave click", function(e){
        switch (e.type) {
            case 'pointerenter':
                setTimeout( () => {
                    $("#video_access-accmenu").is(":visible")
                        ? $("#video_access-tooltip").hide()
                        : $("#video_access-tooltip")
                            .text( $(this)
                                .find(".able-clipped").text() )
                            .css("top", -52)
                            .show();;
                }, 20);
                break;
            case 'pointerleave':
                $("div[role=button]").on("pointerleave", function(){
                    $("#video_access-tooltip").hide();
                });
                break;
            case 'click':
                $("#video_access-tooltip")
                    .text( $(this)
                        .find(".able-clipped").text() )
                    .css("top", -52)
                    .toggle();
                ablePlayer.$accessMenuDiv
                    .css({
                        "left" : ablePlayer.$accessMenuButton.position().left,
                        "top" : -ablePlayer.$accessMenuDiv.height()
                    })
                    .toggle();
        }
    })

    /**
     * Add Click Event to any menu item
     */
    $(' li[role=menuitemradio]').on('click',  function (e) {
        e.stopPropagation();
        switch (e.type) {
            case "click" :
                $(".able-popup-" + $(this).data("parent")).find("li").each((index, item) => {
                    $(item).removeClass("able-focus");
                    $(item).find("input")[0].checked = false;
                });
                $(this).addClass("able-focus");
                $(this).find("input")[0].checked = true;
                //$(".able-captions-wrapper").removeClass("able-captions-wrapper-on, able-captions-wrapper-off").addClass( "able-captions-wrapper-"+ $(this).data("captions-wrapper") )

                let itemAccMenu = $(this).data("item");
                switch ( itemAccMenu ) {
                    case "lsfplus":
                        ablePlayer.$signWindow.show();
                        break;
                    case "standard":
                        ablePlayer.$signWindow.hide();
                        break;
                }
        }
    });
}


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