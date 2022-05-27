
setTimeout(() => {
    let $ablePlayerControls = $(".able-player").first();
    $(".able-vidcap-container").after( $ablePlayerControls[0]);
    $(".able-player").last().remove()
}, 100)