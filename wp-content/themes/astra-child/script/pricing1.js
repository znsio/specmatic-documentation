// @ts-nocheck
document.addEventListener("DOMContentLoaded", function () {
  // Selectors
  const planCards = document.querySelectorAll(".specmatic-user-type-card")
  const selfPlan = document.getElementById("self-plan")
  const proPlan = document.getElementById("team-plan")
  const orgPlan = document.getElementById("organization-plan")
  const pricingForm = document.getElementById("pricing-form")
  const inputContainers = document.querySelectorAll(".input-container")
  const pricingPlansContainer = document.querySelector(
    "#pricing-plans-container"
  )
  const sliders = document.querySelectorAll(".spec-slider")
  const checkboxes = document.querySelectorAll('input[name="spec"]')
  const allInputs = document.querySelectorAll("input")
  const pricingSignUpButtons = document.querySelectorAll(
    ".price-plan-card .pricing-cta-btn"
  )
  const selectButtons = document.querySelectorAll(".select-btn")
  const licenseCountSlider = document.getElementById("license-count")
  const proTeamSpecsCheckboxes = document.querySelectorAll(
    "input[type=checkbox].pro-org-specs"
  )

  const proPlanSliders = Array.from(
    document.querySelectorAll("input[type=range].spec-slider")
  ).filter((slider) => slider.id !== "license-count")

  const defaultSpecs = document.querySelectorAll(".default-specs")

  const proPlanBasePrice = 250
  const orgPlanBasePrice = 1250
  const proLicenseSeatThreshold = 50
  const maxUsers = 2500
  const maxUserPrice = 3

  const apiSpecs = {
    "no-spec": 0,
    "open-api-spec": 0,
    "wdsl-spec": 0,
    "async-api-spec": 3,
    "grpc-spec": 3,
    "graphql-spec": 3,
    "resp-spec": 1,
    "jdbc-spec": 1,
  }

  const pricingTiers = [
    { maxUsers: 50, price: 35 },
    { maxUsers: 100, price: 20 },
    { maxUsers: 500, price: 5 },
    { maxUsers: maxUsers, price: maxUserPrice }
  ]

  function toggleActivePlan(card) {
    planCards.forEach((card) => card.classList.remove("active-plan"))
    card.classList.add("active-plan")
    calculatePrice()
  }

  function toggleRecommendedPlan(planType) {
    const pricePlanCards = document.querySelectorAll(".price-plan-card")
    pricePlanCards.forEach((card) => card.classList.remove("recommended-plan"))

    const selectedPlan = document.getElementById(planType + "-plan")
    selectedPlan.classList.add("recommended-plan")

    const recommendedHeader = selectedPlan.querySelector(".recommended-header")
    recommendedHeader.style.display = "block"

    const otherPlanCards = document.querySelectorAll(
      ".price-plan-card:not(#" + planType + "-plan)"
    )
    otherPlanCards.forEach((card) => {
      const otherRecommendedHeader = card.querySelector(".recommended-header")
      otherRecommendedHeader.style.display = "none"
    })
  }

  function handleSlider(slider) {
    const output = slider.parentNode.querySelector(".slider-value")

    // Set the initial value of the tooltip to the default value of the slider
    output.innerHTML = slider.value

    // Calculate the initial position of the tooltip
    const initialPercent =
      ((slider.value - slider.min) / (slider.max - slider.min)) * 100
    output.style.left = `calc(${initialPercent}% - (${output.offsetWidth / 2
      }px))`
    slider.style.background = `linear-gradient(to right, #580089 0%, #580089 ${initialPercent}%, #ccc ${initialPercent}%, #ccc 100%)`

    // Show the tooltip from the start
    output.classList.add("show")

    slider.oninput = function () {
      output.innerHTML = this.value
      const percent = ((this.value - this.min) / (this.max - this.min)) * 100
      output.style.left = `calc(${percent}% - (${output.offsetWidth / 2}px))`
      slider.style.background = `linear-gradient(to right, #580089 0%, #580089 ${percent}%, #ccc ${percent}%, #ccc 100%)`
    }
  }

  // Event Listeners
  planCards.forEach((planCard) => {
    planCard.addEventListener("click", function () {
      toggleActivePlan(this)

      pricingForm.classList.add("active-form")

      const selectedPlanType = this.getAttribute("data-plan")
      document.getElementById("selected-plan-type").value = selectedPlanType

      // If the data-plan attribute of the clicked card is not "self" then disable button with data-plan-name "Basic Plan" and enable the rest
      if (selectedPlanType !== "self") {
        selectButtons.forEach((button, index) => {
          button.disabled = index === 0
        })
      } else {
        selectButtons.forEach((button) => {
          button.disabled = false
        })
      }

      inputContainers.forEach(
        (container) => (container.style.display = "none")
      )
      inputContainers.forEach((container) => {
        if (container.getAttribute("data-plan").includes(selectedPlanType)) {
          container.style.display = "block"
        }
      })

      if (
        selectedPlanType &&
        pricingPlansContainer.classList.contains("pricing-plans-visible")
      ) {
        toggleRecommendedPlan(selectedPlanType)
      }

      const selfPlanClasses = document.getElementById("self-plan").classList
      const selfPlanSignupClasses =
        document.getElementById("self-plan-signup").classList
      if (selectedPlanType === "self") {
        const selfPlanDisabledSpecs = document.querySelectorAll(
          ".self-plan-disabled-spec"
        )
        selfPlanDisabledSpecs.forEach((spec) => {
          spec.disabled = true
        })
        selfPlanClasses.remove("plan-unavailable")
        selfPlanSignupClasses.remove("plan-unavailable-btn")
      } else {
        checkboxes.forEach((checkbox) => {
          checkbox.disabled = false
        })
        selfPlanClasses.add("plan-unavailable")
        selfPlanSignupClasses.add("plan-unavailable-btn")
      }
      document.getElementById("tell-us-more").style.display = "block"
      pricingPlansContainer.classList.remove("pricing-plans-hidden")
      pricingPlansContainer.classList.add("pricing-plans-visible")
      toggleRecommendedPlan(selectedPlanType)
      document
        .getElementById("spec-checkbox-grp")
        .scrollIntoView({ behavior: "smooth" })
    })
  })

  function intValue(el) {
    const val = parseInt(el.value || 1)
    return Math.max(val, 1)
  }

  function getPricePerLicense(numberOfLicenses) {
    var price = 0
    var remainingUsers = numberOfLicenses
    for (const tier of pricingTiers) {
      if (remainingUsers <= 0) break
      price += tier.price * Math.min(tier.maxUsers, remainingUsers)
      remainingUsers = remainingUsers - tier.maxUsers
    }
    return price
  }

  function calculateUsageBill(apiSpecsSum, minLicenseCount, minAPICount, minBuildCount) {
    let licenseCount = intValue(document.getElementById("license-count"))
    let apiCount = intValue(document.getElementById("api-count"))
    let buildCount = intValue(document.getElementById("build-count"))

    const billableLicenseCount = Math.max(licenseCount, minLicenseCount)
    const billableAPICount = Math.max(apiCount, minAPICount)
    const billableBuildCount = Math.max(buildCount, minBuildCount)

    let apiAndBuildUsage = billableAPICount + billableBuildCount

    let apiSpecPrice = billableLicenseCount > 500 ? 0 : (apiSpecsSum * billableLicenseCount)
    let licensePrice = getPricePerLicense(billableLicenseCount) + apiSpecPrice

    return licensePrice + apiAndBuildUsage
  }

  function calculatePrice() {
    let apiSpecsSum = 0

    otherCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        let id = checkbox.id
        if (id in apiSpecs) {
          let value = apiSpecs[id]
          apiSpecsSum += value
        }
      }
    })

    let teamPlanPrice = document.getElementById("pro-plan-price")
    let organizationPlanPrice = document.getElementById("organization-plan-price")

    // Update team plan price
    teamPlanPrice.innerText = formatPrice(
      Math.ceil(proPlanBasePrice + calculateUsageBill(apiSpecsSum, 5, 10, 10))
    )

    // Update organization plan price
    organizationPlanPrice.innerText = formatPrice(
      Math.ceil(orgPlanBasePrice + calculateUsageBill(apiSpecsSum, proLicenseSeatThreshold, proLicenseSeatThreshold, proLicenseSeatThreshold))
    )
  }

  function formatPrice(price) {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    })
  }

  // Add event listeners to all inputs so that the price is updated when the user changes the input
  allInputs.forEach((input) => {
    input.addEventListener("input", calculatePrice)
  })

  sliders.forEach(handleSlider)

  const otherCheckboxes = document.querySelectorAll(
    'input[name="spec"]:not(#no-spec)'
  )

  pricingSignUpButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const checkedOne = Array.prototype.slice
        .call(checkboxes)
        .some((x) => x.checked)
      if (!checkedOne) {
        document
          .getElementById("spec-checkbox-grp")
          .scrollIntoView({ behavior: "smooth" })
        alert("Please select at least one specification")
        return
      }

      const personalInfoInputs = document.getElementById(
        "personal-info-inputs"
      )
      personalInfoInputs.classList.remove("hide-inputs")

      const signUpBtn = document.getElementById("sign-up-btn")
      const planName = button.getAttribute("data-plan-name")
      signUpBtn.setAttribute("data-plan-name", planName)
      personalInfoInputs.scrollIntoView({ behavior: "smooth" })
    })
  })

  selectButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      // Change the text of all buttons back to "Select"
      selectButtons.forEach((btn) => {
        btn.innerText = "Select"
      })

      // Change the text of the clicked button to a tick mark symbol and "Selected"
      button.innerText = "✓ Selected"
    })
  })

  defaultSpecs.forEach((checkbox) => {
    checkbox.addEventListener("click", function () {
      this.checked = true
    })
  })

  // Set the default plan to pro plan and set the sliders to the default values for the pro plan
  toggleRecommendedPlan("team")
  sliders.forEach((slider) => setSlider(slider, "team"))

  function setSlider(slider, plan = "self") {
    if (plan === "self") {
      slider.value = 0
    } else if (plan === "team") {
      slider.value = 5
    } else if (plan === "organization") {
      slider.value = proLicenseSeatThreshold
    }
    const output = slider.parentNode.querySelector(".slider-value")

    // Set the initial value of the tooltip to the default value of the slider
    output.innerHTML = slider.value

    // Calculate the initial position of the tooltip
    const initialPercent =
      ((slider.value - slider.min) / (slider.max - slider.min)) * 100
    output.style.left = `calc(${initialPercent}% - (${output.offsetWidth / 2
      }px))`
    slider.style.background = `linear-gradient(to right, #580089 0%, #580089 ${initialPercent}%, #ccc ${initialPercent}%, #ccc 100%)`
  }

  function toggleSelfPlanAndResetInputs() {
    toggleRecommendedPlan("self")
    sliders.forEach((slider) => setSlider(slider, "self"))
    proTeamSpecsCheckboxes.forEach((checkbox) => {
      checkbox.checked = false
    })
  }

  selfPlan.addEventListener("click", toggleSelfPlanAndResetInputs)

  proPlan.addEventListener("click", function () {
    toggleRecommendedPlan("team")
    sliders.forEach((slider) => setSlider(slider, "team"))
  })

  orgPlan.addEventListener("click", function () {
    toggleRecommendedPlan("organization")
    sliders.forEach((slider) => setSlider(slider, "organization"))
  })

  licenseCountSlider.addEventListener("change", function () {
    if (Number(this.value) >= proLicenseSeatThreshold) {
      toggleRecommendedPlan("organization")
    } else if (Number(this.value) > 0) {
      toggleRecommendedPlan("team")
    } else {
      toggleSelfPlanAndResetInputs()
    }
  })

  proTeamSpecsCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      let licenseCount = Number(licenseCountSlider.value)
      if (licenseCount >= proLicenseSeatThreshold) {
        toggleRecommendedPlan("organization")
      } else if (licenseCount > 0 || this.checked) {
        toggleRecommendedPlan("team")
      } else {
        toggleSelfPlanAndResetInputs()
      }
    })
  })

  proPlanSliders.forEach((slider) => {
    slider.addEventListener("input", function () {
      let licenseCount = Number(licenseCountSlider.value)
      let isEverySliderZero = Array.from(sliders).every(
        (slider) => Number(slider.value) === 0
      )

      let isAnyCheckboxChecked = Array.from(proTeamSpecsCheckboxes).some(
        (checkbox) => checkbox.checked
      )

      if (licenseCount >= proLicenseSeatThreshold) {
        toggleRecommendedPlan("organization")
      } else if (!isEverySliderZero || isAnyCheckboxChecked) {
        toggleRecommendedPlan("team")
      } else {
        toggleRecommendedPlan("self")
        proTeamSpecsCheckboxes.forEach((checkbox) => {
          checkbox.checked = false
        })
      }
    })
  })

  // toggle sign up
  const signUpToggleBtn = document.getElementById("toggle-sign-up-btn")

  signUpToggleBtn.addEventListener("click", function () {
    const personalInfoInputs = document.getElementById("personal-info-inputs")
    personalInfoInputs.classList.remove("hide-inputs")
    personalInfoInputs.scrollIntoView({ behavior: "smooth" })
    signUpToggleBtn.classList.add("hide-inputs")
  })
})
