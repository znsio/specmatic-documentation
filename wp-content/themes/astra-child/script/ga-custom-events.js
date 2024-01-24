// @ts-nocheck

//specmatic-user-type-card
// Google Analytics Event Tracking For user type selection
document.querySelectorAll( ".specmatic-user-type-card" ).forEach( function ( userType ) {
    userType.addEventListener( "click", function () {
        gtag( "event", "click", {
            event_category: "userType",
            event_label: this.querySelector("h3").innerText,
        } );
    } );
} );

// Google Analytics Event Tracking For Button Clicks
document.querySelectorAll( "button" ).forEach( function ( link ) {
    link.addEventListener( "click", function () {
        gtag( "event", "click", {
            event_category: "button",
            event_label: this.innerText,
        } );
    } );
} );

// Google Analytics Event Tracking For Form Submissions
document.querySelectorAll( "form" ).forEach( function ( link ) {
    link.addEventListener( "submit", function () {
        gtag( "event", "submit", {
            event_category: "form",
            event_label: this.id,
        } );
    } );
} );
