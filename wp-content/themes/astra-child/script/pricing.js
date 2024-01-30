// @ts-nocheck

document.addEventListener('DOMContentLoaded', function() {

// Selectors
const planCards = document.querySelectorAll(".specmatic-user-type-card");
const pricingForm = document.getElementById("pricing-form");
const inputContainers = document.querySelectorAll(".input-container");
const pricingPlansContainer = document.querySelector("#pricing-plans-container");
const viewPlansButton = document.getElementById("view-plans");
const sliders = document.querySelectorAll(".spec-slider");
const emailInput = document.getElementById('email');
const checkboxes = document.querySelectorAll('input[name="spec"]');
const allInputs = document.querySelectorAll('input');
const organizationPlanPrice = document.getElementById('organization-plan-price');
const teamPlanPrice = document.getElementById('pro-plan-price');
const requiredTextInputs = document.querySelectorAll('input[required]');

// Variables
let emailFilled = emailInput.value !== '';
let checkboxChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

// Check if the button should be enabled
function checkConditions() {
    
    if (emailInput.value !== '' && Array.from(checkboxes).some(checkbox => checkbox.checked) &&  Array.from(requiredTextInputs).every(input => input.value.trim() !== '')){
        viewPlansButton.classList.remove('disabled-btn');
        viewPlansButton.classList.add('enabled-btn');
        emailFilled = true;
        checkboxChecked = true;
    } else {
        viewPlansButton.classList.add('disabled-btn');
        viewPlansButton.classList.remove('enabled-btn');
        emailFilled = false;
        checkboxChecked = false;
    }
}

// Listen for input events on the email field
emailInput.addEventListener('input', checkConditions);

// Listen for change events on the checkboxes
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', checkConditions);
});

// Listen for input events on the text inputs
requiredTextInputs.forEach(input => input.addEventListener('input', checkConditions));

function toggleActivePlan(card) {
    planCards.forEach((card) => card.classList.remove("active-plan"));
    card.classList.add("active-plan");
}

function toggleRecommendedPlan(planType) {
    const pricePlanCards = document.querySelectorAll(".price-plan-card");
    pricePlanCards.forEach((card) =>
        card.classList.remove("recommended-plan")
    );

    const selectedPlan = document.getElementById(planType + "-plan");
    selectedPlan.classList.add("recommended-plan");

    const recommendedHeader = selectedPlan.querySelector(".recommended-header");
    recommendedHeader.style.display = "block";

    const otherPlanCards = document.querySelectorAll(
        ".price-plan-card:not(#" + planType + "-plan)"
    );
    otherPlanCards.forEach((card) => {
        const otherRecommendedHeader = card.querySelector(".recommended-header");
        otherRecommendedHeader.style.display = "none";
    });
}

function handleSlider(slider) {
    const output = slider.parentNode.querySelector(".slider-value");

    slider.oninput = function () {
        output.innerHTML = this.value;

        const percent = ((this.value - this.min) / (this.max - this.min)) * 100;
        output.style.left = `calc(${percent}% - (${output.offsetWidth / 2}px))`;
        slider.style.background = `linear-gradient(to right, #580089 0%, #580089 ${percent}%, #ccc ${percent}%, #ccc 100%)`;

        output.classList[this.value > 1 ? "add" : "remove"]("show");
    };
}

// Event Listeners
planCards.forEach((planCard) => {
    planCard.addEventListener("click", function () {
        toggleActivePlan(this);

        pricingForm.classList.add("active-form");

        const selectedPlanType = this.getAttribute("data-plan");
        document.getElementById("selected-plan-type").value = selectedPlanType;

        inputContainers.forEach(
            (container) => (container.style.display = "none")
        );
        inputContainers.forEach((container) => {
            if (container.getAttribute("data-plan").includes(selectedPlanType)) {
                container.style.display = "block";
            }
        });

        if (selectedPlanType && pricingPlansContainer.classList.contains("pricing-plans-visible")
        ) {
            toggleRecommendedPlan(selectedPlanType);
        }

        const selfPlanClasses = document.getElementById("self-plan").classList;
        const selfPlanSignupClasses = document.getElementById("self-plan-signup").classList;
        if (selectedPlanType === "self") {
            document.getElementById("async-api-spec").disabled = true;
            selfPlanClasses.remove("plan-unavailable");
            selfPlanSignupClasses.remove("plan-unavailable-btn");
        } else {
            checkboxes.forEach((checkbox) => {
                checkbox.disabled = false;
            }
            );
            selfPlanClasses.add("plan-unavailable");
            selfPlanSignupClasses.add("plan-unavailable-btn");
        }
        document.getElementById("tell-us-more").style.display = "block";
    });
});

viewPlansButton.addEventListener("click", function () {
    const unfilledTextInputs = Array.from(requiredTextInputs)
        .filter(input => input.value.trim() === '')
        .map(input => document.querySelector(`label[for="${input.id}"]`).innerText.replace('*', ''));

    const emailInput = document.querySelector('input[name="email"]');
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
    const unfilledEmail = emailFilled ? [] : [document.querySelector('label[for="email"]').innerText.replace('*', '')];

    const uncheckedCheckboxes = Array.from(document.querySelectorAll('input[name="spec"]'))
        .some(checkbox => checkbox.checked) ? [] : ["API specifications"];

    const messages = [...unfilledTextInputs, ...unfilledEmail, ...uncheckedCheckboxes];

    if (!emailIsValid && emailFilled) {
        alert("The email address is not valid.");
        return;
    }

    if (messages.length > 0) {
        viewPlansButton.classList.add("disabled-btn");
        alert("Please fill in these fields: " + messages.join(", ") + ".");
        return;
    }

    viewPlansButton.classList.remove("disabled-btn");
    viewPlansButton.classList.add("enabled-btn");
    pricingPlansContainer.classList.remove("pricing-plans-hidden");
    pricingPlansContainer.classList.add("pricing-plans-visible");
    const selectedPlanType = document.getElementById("selected-plan-type").value;
    toggleRecommendedPlan(selectedPlanType);
    pricingPlansContainer.scrollIntoView();
});

function intValue(el) {
    let val = parseInt(el.value || 1);
    if(val === 0) return 1
    return val
}

function calculatePrice() {
    let teamSize = intValue(document.getElementById('team-size'));
    let teamCount = intValue(document.getElementById('team-count'));
    let apiCount = intValue(document.getElementById('api-count'));
    let buildCount = intValue(document.getElementById('build-count'));

    const asyncAPIFactor = document.getElementById("async-api-spec").checked ? 2 : 1;
    
    let teamPlanPrice = document.getElementById('pro-plan-price');
    let organizationPlanPrice = document.getElementById('organization-plan-price');
    
    let additionalPrice = parseInt((teamSize * apiCount * buildCount * asyncAPIFactor) * 0.005);

    // Update team plan price
    teamPlanPrice.innerText = formatPrice(5000 + additionalPrice);

    // Update organization plan price
    organizationPlanPrice.innerText = formatPrice(25000 + (additionalPrice * teamCount));
}

function formatPrice(price) {
    return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
}

// Add event listeners to all inputs so that the price is updated when the user changes the input
allInputs.forEach(input => {
    input.addEventListener('input', calculatePrice);
});

sliders.forEach(handleSlider);

// Making sure that the "None" checkbox disables the other checkboxes and vice versa for API Spec checkboxes
const noneCheckbox = document.getElementById('no-spec');
const otherCheckboxes = document.querySelectorAll('input[name="spec"]:not(#no-spec)');

noneCheckbox.addEventListener('change', function() {
    otherCheckboxes.forEach(checkbox => {
        checkbox.disabled = noneCheckbox.checked;
        if (noneCheckbox.checked) {
            checkbox.checked = false;
        }
    });
});

otherCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
            noneCheckbox.checked = false;
            noneCheckbox.disabled = false;
        }
        else if (!Array.from(otherCheckboxes).some(checkbox => checkbox.checked)) {
            noneCheckbox.disabled = false;
        }
    });
});

});