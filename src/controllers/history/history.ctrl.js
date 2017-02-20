import dom from '../../utils/dom'

require('./history.scss');

/**
 * History Controller
 * Simple controller stacking the previous pattern
 * tested by the user. This is a simple dummy container
 * stacking all the SVGs
 * The class used is .history, for optimisation all
 * SVGs will use `will-change` or `transformZ` properties
 * to improve performance.
 */
class HistoryCtrl {

  /**
   * Set up instance
   */
  constructor () {
    this.lastPattern = null
    this.setupTemplate()
  }

  /**
   * Build template of the controller
   * @return {SVGDOMElement}
   */
  setupTemplate () {
    this.containerEl = dom.quickNode('div', 'history-container')
    this.el = dom.create('div', {class: 'history'} , [this.containerEl])
    return this.el
  }

  /**
   * Add a new pattern in the container
   * @param {SVGDOM} pattern The try to stack
   */
  stackPattern (pattern) {
    if (this.lastPattern)
      this.containerEl.insertBefore(pattern, this.lastPattern)
    else
      this.containerEl.appendChild(pattern)
    this.lastPattern = pattern
    this.scrollToStart()
  }

  /**
   * Loop animation to scroll smoothly
   * the history to the start.
   */
  scrollToStart () {
    let pos = this.el.scrollLeft
    this.el.scrollTo(pos - Math.max(pos / 4, 4), 0)

    if (this.el.scrollLeft > 0) {
      window.requestAnimationFrame(this.scrollToStart.bind(this))
    }
  }

  /**
   * Clean the history
   */
  clear () {
    this.lastPattern = null

    // Clean the container
    this.containerEl.remove()
    this.containerEl = dom.quickNode('div', 'history-container')
    this.el.appendChild(this.containerEl)
  }
}

export default HistoryCtrl