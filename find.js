function highlightVenue(t){
    console.log(t.venue);
    console.log( $("#venue-"+ t.venue.v.venue_id))
    $(".venue").toggleClass("selected",false)
    $("#venue-"+ t.venue.v.venue_id).toggleClass("selected")

}