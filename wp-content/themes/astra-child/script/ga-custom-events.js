// @ts-nocheck

document.addEventListener( "DOMContentLoaded", function () {
    // Google Analytics Event Tracking For user type selection
    document.querySelectorAll( ".specmatic-user-type-card" ).forEach( function ( userType ) {
        userType.addEventListener( "click", function () {
            gtag( "event", "User Selection", {
                event_category: "user selection",
                action: "click",
                event_label: this.querySelector( "h3" ).innerText,
            } );
            
        } );
    } );

    // Track all range and checkbox inputs from the pricing form
    document.querySelectorAll("input[type='range'], input[type='checkbox']").forEach(function (input) {
        input.addEventListener("change", function () {
            gtag("event", "Pricing Form Input", {
                event_category: "Pricing Form Input",
                action: "input",
                event_label: this.id + ":" + this.value,
            });
        });
    });

    // Track all selects from the pricing form
    document.querySelectorAll( "select" ).forEach( function ( select ) {
        select.addEventListener( "change", function () {
            gtag( "event", "Pricing Form Input", {
                event_category: "Select Input",
                action: "select",
                event_label: this.id + ":" + this.value,
            } );
        } );
    } );

    // Google Analytics Event Tracking For View Plans Button Click
    document.getElementById("view-plans").addEventListener("click", function () {

        gtag("event", "View Plans Button Click", {
            event_category: "View Plans",
            action: "click",
            event_label: this.innerText,
            event_status: this.classList.contains('enabled-btn') ? 'success' : 'failed',
        });
    });

    // Google Analytics Event for Buttons with class pricing-cta-btn cta-btn and use the event label as the button's data attribute called data-pricing-plan
    document.querySelectorAll( ".pricing-cta-btn" ).forEach( function ( button ) {
        button.addEventListener( "click", function () {
            gtag( "event", "Sign Up Button Click", {
                event_category: "Sign Up",
                action: "click",
                event_label: this.getAttribute( "data-plan-name" ),
            } );
        } );
    } );

    // Google Analytics Event For Feature Links Clicks
    document.getElementById( "pricing-plans-container" ).querySelectorAll( "a" ).forEach( function ( link ) {
        link.addEventListener( "click", function () {
            gtag( "event", "Feature Link Clicks", {
                event_category: "Feature Link",
                action: "click",
                event_label: this.innerText,
                event_link: this.href,
            } );
        } );
    } );

    // Google Analytics Event Tracking For pricing form submission
    document.getElementById( "pricing-form" ).addEventListener( "submit", function () {
        gtag( "event", "Pricing Form Submission", {
            event_category: "Pricing Form Submission",
            action: "submit",
            event_label: this.id,
        } );
    } );

} );