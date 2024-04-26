// @ts-nocheck
document.addEventListener( "DOMContentLoaded", function () {
    function logRecommendedPlan() {
       let teamPlanPrice = document.getElementById('pro-plan-price');
        let organizationPlanPrice = document.getElementById('organization-plan-price');
        let currentRecommendedPlan = document.querySelector(".price-plan-card.recommended-plan");
        let planName = currentRecommendedPlan ? currentRecommendedPlan.querySelector(".plan-name").innerText : 'Self Plan';
        let planPrice = planName === 'Enterprise Plan' ? organizationPlanPrice.innerText : planName === 'Pro Plan' ? teamPlanPrice.innerText : '0';

        gtag("event", "Recommended Plan", {
            event_category: "Recommended Plan",
            action: "click",
            event_label: planName,
            event_plan_price: planPrice,
        });
    }

    // Google Analytics Event Tracking For user type selection
    document.querySelectorAll( ".specmatic-user-type-card" ).forEach( function ( userType ) {
        userType.addEventListener( "click", function () {
            gtag( "event", "User Selection", {
                event_category: "User Selection",
                action: "click",
                event_label: this.querySelector( "h3" ).innerText,
            } );
            logRecommendedPlan();         
        } );
    } );

    // Track all range and checkbox inputs from the pricing form
    document.querySelectorAll("input[type='range'], input[type='checkbox']").forEach(function (input) {
        input.addEventListener("change", function () {
            gtag("event", "Pricing Form " + this.type.charAt(0).toUpperCase() + this.type.slice(1) + " Input", {
                event_category: "Pricing Form Input",
                action: "input",
                event_label: this.id + ":" + this.value,
            });
        });
    });

    // Track all selects from the pricing form
    document.querySelectorAll( "select" ).forEach( function ( select ) {
        select.addEventListener( "change", function () {
            gtag( "event", "Pricing Form Select Country", {
                event_category: "Pricing Form Input",
                action: "select",
                event_label: this.id + ":" + this.value,
            } );
        } );
    } );

   // Google Analytics Event for Buttons with class pricing-cta-btn cta-btn and use the event label as the button's data attribute called data-pricing-plan
    document.querySelectorAll(".pricing-cta-btn").forEach(function (button) {
        button.addEventListener("click", function () {

            let teamPlanPrice = document.getElementById('pro-plan-price');
            let organizationPlanPrice = document.getElementById('organization-plan-price');
            let planName = this.getAttribute("data-plan-name");

            // Check if the required inputs are filled
            const requiredTextInputs = Array.from(document.querySelectorAll('input[required]'));
            const emailInput = document.getElementById('email');
            const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
            const checkboxes = document.querySelectorAll('input[name="spec"]');
            const checkboxChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

            if (emailIsValid && checkboxChecked && requiredTextInputs.every(input => input.value.trim() !== '')) {
                // If all required inputs are filled, fire the sign up event
                gtag("event", "Sign Up Button Click", {
                    event_category: "Sign Up",
                    action: "click",
                    event_label: planName,
                    event_status: 'success',
                    event_plan_price: planName === 'Enterprise Plan' ? organizationPlanPrice.innerText : planName === 'Pro Plan' ? teamPlanPrice.innerText : '0',
                });
            } else {
                // If not all required inputs are filled, fire a different event
                // Collect the names of the unfilled inputs
                const unfilledInputs = requiredTextInputs.filter(input => input.value.trim() === '').map(input => input.id);
                if (!emailIsValid) unfilledInputs.push(emailInput.id);
                if (!checkboxChecked) unfilledInputs.push('api-spec-checkboxes');

                gtag("event", "Sign Up Attempt Failed", {
                    event_category: "Sign Up",
                    action: "click",
                    event_label: "Required inputs not filled",
                    event_unfilled_inputs:  Array.from(new Set(unfilledInputs || [])).join(', '),
                    event_status: 'failed',
                });
            }
        });
    });

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