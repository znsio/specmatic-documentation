// @ts-nocheck

document.addEventListener( "DOMContentLoaded", function () {
    // Google Analytics Event Tracking For user type selection
    document.querySelectorAll( ".specmatic-user-type-card" ).forEach( function ( userType ) {
        userType.addEventListener( "click", function () {
            gtag( "event", "click", {
                event_category: "userType",
                event_label: this.querySelector( "h3" ).innerText,
            } );
        } );
    } );

    // Google Analytics Event Tracking For Button Clicks
    document.querySelectorAll( "button" ).forEach( function ( button ) {
        button.addEventListener( "click", function () {
            gtag( "event", "click", {
                event_category: "button",
                event_label: this.innerText,
            } );
        } );
    } );

    // Google Analytics Event Tracking For pricing plan selection
    document.querySelectorAll( ".price-plan-card" ).forEach( function ( plan ) {
        plan.addEventListener( "click", function () {
            gtag( "event", "click", {
                event_category: "plan",
                event_label: this.querySelector( "h3" ).innerText,
            } );
        } );
    }
    );

    // Google Analytics Event Tracking For Link Clicks
    document.querySelectorAll( "a" ).forEach( function ( link ) {
        link.addEventListener( "click", function () {
            gtag( "event", "click", {
                event_category: "link",
                event_label: this.innerText,
            } );
        } );
    }
    );


    // Google Analytics Event Tracking For pricing form submission
    document.getElementById( "pricing-form" ).addEventListener( "submit", function () {
        gtag( "event", "submit", {
            event_category: "form",
            event_label: this.id,
        } );
    } );
} );