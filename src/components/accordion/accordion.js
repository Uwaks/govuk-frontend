
/*
  Accordion

  This allows a collection of sections to be collapsed by default,
  showing only their headers. Sections can be exanded or collapsed
  individually by clicking their headers. An "Open all" button is
  also added to the top of the accordion, which switches to "Close all"
  when all the sections are expanded.

  The state of each section is saved to the DOM via the `aria-expanded`
  attribute, which also provides accessibility.

*/

import { nodeListForEach } from '../../common'
import '../../vendor/polyfills/Function/prototype/bind'
import '../../vendor/polyfills/Element/prototype/classList'

function Accordion ($module) {
  this.$module = $module
  this.$sections = $module.querySelectorAll('.govuk-accordion__section')
  this.$openAllButton = ''
}

Accordion.prototype.init = function () {
  // Check module exists
  var $module = this.$module
  if (!$module) {
    return
  }

  this.moduleId = $module.getAttribute('id')

  nodeListForEach(this.$sections, function ($section, i) {
    // Set header attributes
    var header = $section.querySelector('.govuk-accordion__section-header')
    this.setHeaderAttributes(header, i)

    this.setExpanded(this.isExpanded($section), $section)

    // Handle events
    header.addEventListener('click', this.onToggleExpanded.bind(this, $section))
  }.bind(this))

  // Create "Open all" button and set attributes
  this.$openAllButton = document.createElement('button')
  this.$openAllButton.setAttribute('type', 'button')
  this.setOpenAllButtonAttributes(this.$openAllButton)

  // Create controls and set attributes
  var accordionControls = document.createElement('div')
  accordionControls.setAttribute('class', 'govuk-accordion__controls')
  accordionControls.appendChild(this.$openAllButton)
  this.$module.insertBefore(accordionControls, this.$module.firstChild)

  // Handle events
  this.$openAllButton.addEventListener('click', this.openOrCloseAllSections.bind(this))

  // See if there is any state stored in sessionStorage and set the sections to
  // open or closed.
  this.readState()

  // See if OpenAll button text should be updated
  var areAllSectionsOpen = this.checkIfAllSectionsOpen()
  this.updateOpenAllButton(areAllSectionsOpen)
}

// Open/close section
Accordion.prototype.onToggleExpanded = function ($section) {
  var expanded = this.isExpanded($section)
  this.setExpanded(!expanded, $section)

  // Store the state in sessionStorage when a change is triggered
  this.storeState()

  // See if OpenAll button text should be updated
  var areAllSectionsOpen = this.checkIfAllSectionsOpen()
  this.updateOpenAllButton(areAllSectionsOpen)
}

// Toggle aria-expanded when section opened/closed
Accordion.prototype.setExpanded = function (expanded, $section) {
  var $button = $section.querySelector('.govuk-accordion__section-button')
  $button.setAttribute('aria-expanded', expanded)

  if (expanded) {
    $section.classList.add('govuk-accordion__section--expanded')
  } else {
    $section.classList.remove('govuk-accordion__section--expanded')
  }

  // This is set to trigger reflow for IE8, which doesn't
  // always reflow after a setAttribute call.
  this.$module.className = this.$module.className
}

Accordion.prototype.isExpanded = function ($section) {
  return ($section.classList.contains('govuk-accordion__section--expanded'))
}

Accordion.prototype.setHeaderAttributes = function ($headerWrapper, index) {
  var $button = $headerWrapper.querySelector('.govuk-accordion__section-button')
  var $heading = $headerWrapper.querySelector('.govuk-accordion__section-heading')
  var $summary = $headerWrapper.querySelector('.govuk-accordion__section-summary')

  // Copy existing div element to an actual button element, for improved accessibility.
  // TODO: this probably needs to be more robust, and copy all attributes and child nodes?
  var $buttonAsButton = document.createElement('button')
  $buttonAsButton.setAttribute('class', $button.getAttribute('class'))
  $buttonAsButton.setAttribute('type', 'button')
  $buttonAsButton.setAttribute('id', this.moduleId + '-heading-' + (index + 1))
  $buttonAsButton.setAttribute('aria-controls', this.moduleId + '-content-' + (index + 1))

  $buttonAsButton.addEventListener('focusin', function (e) {
    if (!$headerWrapper.classList.contains('govuk-accordion__section-header--focused')) {
      $headerWrapper.className += ' govuk-accordion__section-header--focused'
    }
  })

  $buttonAsButton.addEventListener('blur', function (e) {
    $headerWrapper.classList.remove('govuk-accordion__section-header--focused')
  })

  if (typeof ($summary) !== 'undefined' && $summary !== null) {
    $buttonAsButton.setAttribute('aria-describedby', this.moduleId + '-summary-' + (index + 1))
  }

  for (var i = 0; i < $button.childNodes.length; i++) {
    var child = $button.childNodes[i]
    $button.removeChild(child)
    $buttonAsButton.appendChild(child)
  }

  $heading.removeChild($button)
  $heading.appendChild($buttonAsButton)

  // Add "+/-" icon
  var icon = document.createElement('span')

  icon.className = 'govuk-accordion__icon'
  icon.setAttribute('aria-hidden', 'true')

  $heading.appendChild(icon)
}

Accordion.prototype.setOpenAllButtonAttributes = function ($button) {
  $button.innerHTML = 'Open all <span class="govuk-visually-hidden">sections</span>'
  $button.setAttribute('class', 'govuk-accordion__open-all')
  $button.setAttribute('aria-expanded', 'false')
  $button.setAttribute('type', 'button')
}

// Open or close all sections
Accordion.prototype.openOrCloseAllSections = function () {
  var $module = this
  var $sections = this.$sections

  var nowExpanded = !($module.$openAllButton.getAttribute('aria-expanded') === 'true')

  nodeListForEach($sections, function ($section) {
    $module.setExpanded(nowExpanded, $section)
  })

  $module.updateOpenAllButton(nowExpanded)
}

// Update "Open all" button
Accordion.prototype.updateOpenAllButton = function (expanded) {
  var newButtonText = expanded ? 'Close all' : 'Open all'
  newButtonText += '<span class="govuk-visually-hidden"> sections</span>'
  this.$openAllButton.setAttribute('aria-expanded', expanded)
  this.$openAllButton.innerHTML = newButtonText
}

// Check if all sections are open and update button text
Accordion.prototype.checkIfAllSectionsOpen = function () {
  var $this = this
  var $sections = this.$sections
  var sectionsCount = this.$sections.length
  var openSectionsCount = 0
  var areAllSectionsOpen = false

  nodeListForEach($sections, function ($section) {
    if ($this.isExpanded($section)) {
      openSectionsCount++
    }
  })

  areAllSectionsOpen = sectionsCount === openSectionsCount

  return areAllSectionsOpen
}

// Check for `window.sessionStorage`, and that it actually works.
var helper = {
  checkForSessionStorage: function () {
    var testString = 'this is the test string'
    var result
    try {
      window.sessionStorage.setItem(testString, testString)
      result = window.sessionStorage.getItem(testString) === testString.toString()
      window.sessionStorage.removeItem(testString)
      return result
    } catch (exception) {
      // console.log('Notice: sessionStorage not available.')
    }
  }
}

// Set the state of the accordions in sessionStorage
Accordion.prototype.storeState = function () {
  if (helper.checkForSessionStorage()) {
    nodeListForEach(this.$sections, function (element) {
      // We need a unique way of identifying each content in the accordion. Since
      // an `#id` should be unique and an `id` is required for `aria-` attributes
      // `id` can be safely used.
      var contentId = element.querySelector('h2 [aria-controls]') ? element.querySelector('h2 [aria-controls]').getAttribute('aria-controls') : false
      var contentState = element.querySelector('h2 [aria-expanded]') ? element.querySelector('h2 [aria-expanded]').getAttribute('aria-expanded') : false

      if (contentId === false && console) {
        console.error(new Error('No aria controls present in accordion section heading.'))
      }

      if (contentState === false && console) {
        console.error(new Error('No aria expanded present in accordion section heading.'))
      }

      // Only set the state when both `contentId` and `contentState` are taken from the DOM.
      if (contentId && contentState) {
        window.sessionStorage.setItem(contentId, contentState)
      }
    })
  }
}

// Read the state of the accordions from sessionStorage
Accordion.prototype.readState = function () {
  if (helper.checkForSessionStorage()) {
    nodeListForEach(this.$sections, function ($section) {
      var contentId = $section.querySelector('h2 [aria-controls]') ? $section.querySelector('h2 [aria-controls]').getAttribute('aria-controls') : false
      var contentState

      if (contentId) {
        contentState = window.sessionStorage.getItem(contentId)
      }

      if (contentState !== null) {
        var trueState = contentState === 'true'
        this.setExpanded(trueState, $section)
      }
    }.bind(this))
  }
}

export default Accordion
