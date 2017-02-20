import StatusBarCtrl from '../statusBar/statusBar.ctrl'
import HistoryCtrl   from '../history/history.ctrl'
import LockCtrl      from '../lock/lock.ctrl'
import SummaryCtrl   from '../summary/summary.ctrl'
import Pattern       from '../../models/pattern'
import PatternSVG    from '../../utils/patternSVG'
import config        from '../../config'
import dom           from '../../utils/dom'

require('./game.scss');

/**
 * Game Controller
 * The playground, the arena
 * It combines a status bar, a pattern history
 * and a lock.
 */
class GameCtrl {

  /**
   * Setup the controller
   * The callback provided will be called with
   * different parameter depending on the type
   * of end (abort, success, fail)
   * @param  {function} onEnd Callback for end of game
   * @return {[type]}       [description]
   */
  constructor (onEnd) {
    // Lets leave it empty for now
    // just init the shite to help V8
    this.statusBar = new StatusBarCtrl(this.abort.bind(this))
    this.history   = new HistoryCtrl()
    this.lock      = new LockCtrl(this.newAttempt.bind(this)); //# TO_DO move the dot length to dynamic
    this.summary   = new SummaryCtrl(this.action.bind(this))
    this.pattern   = null
    this.type      = null
    this.onEnd     = onEnd

    //# QUESTION: Does it really make sense?
    this.statusBar.init()
    this.lock.init()

    this.setupTemplate()
  }

  /**
   * Build template of the controller
   * @return {SVGDOMElement}
   */
  setupTemplate () {
    this.summary.toggle()

    this.el = dom.create('div', {class: 'game-layout view'}, [
      dom.create('div', {class: 'view-bloc'}, [
        this.statusBar.el,
        dom.create('div', {class: 'history-wrap'}, [this.history.el])
      ]),
      dom.create('div', {class: 'view-bloc'}, [this.lock.el]),
      this.summary.el
    ])
    return this.el
  }


  /* Controls **********************************/

  /**
   * Start a new game
   * @param  {int} type       Type ID
   * @param  {int} difficulty Number of dots
   */
  start (type, difficulty) {
    this.type = type
    this.difficulty = difficulty
    this.lock.setDotLength(difficulty)
    this.pattern = new Pattern(difficulty)
    this.pattern.fillRandomly()
    this.history.clear()
    this.count = 0

    switch (type) {
      case config.GAME.TYPE.PRACTICE:
        return this.statusBar.setCounter(0)
      case config.GAME.TYPE.CHALLENGE:
        return this.statusBar.setCounter(10)
      case config.GAME.TYPE.COUNTDOWN:
        return this.statusBar.setCountdown(60)
    }
  }

  /**
   * Listener for new pattern drawn by the user
   * and provided via the the Lock controller.
   * @param  {Pattern} pattern Pattern to test
   * @return {Boolean}         True if the pattern is correct
   */
  newAttempt (pattern) {
    // Generate a SVG from the pattern provided
    let attemptSVG = new PatternSVG()
    attemptSVG.addDots(1)
    attemptSVG.addPattern(pattern, 14, ['#999','#ccc','#fff']) //# TO_DO: Need consts

    let match = this.pattern.compare(pattern)
    PatternSVG.prototype.addCombinaison.apply(attemptSVG, match)

    this.count++

    if (match[0] === this.pattern.dotLength) {
      // Success case
      this.summary.setContent(true, 'Lock found in ' + this.count + ' attemps. Well done.', false)

      return true
    }
    else {
      // Fail case
      this.history.stackPattern(attemptSVG.getSVG())
      switch (this.type) {
        case config.GAME.TYPE.PRACTICE:
          return this.statusBar.incrementCounter()
        case config.GAME.TYPE.CHALLENGE:
          if (this.statusBar.decrementCounter() === 0) {
            this.summary.setContent(false, 'Sorry, you didn\'t make it this time.', true)
          }
          break;
      }
      return false
    }
  }

  /**
   * Cancel listener for the status bar
   * @param  {Number} exitCode Exit code from the status bar
   */
  abort (exitCode) {
    if (exitCode) {
      // Exit from countdown
      this.summary.setContent(false, 'Sorry, you didn\'t make it this time.', true)
    }
    else {
      // Abort from the user
      this.onEnd()
    }
  }

  /**
   * Action listener for the action of the summary
   * controller. To continue, try again or go back
   * to the home menu.
   * @param  {Number} actionId Action code to apply
   */
  action (actionId) {
    switch (actionId) {
    case config.GAME.ACTIONS.TRY_AGAIN:
      this.start(this.type, this.difficulty)
      break;
    case config.GAME.ACTIONS.BACK_HOME:
      this.abort()
      break;
    case config.GAME.ACTIONS.CONTINUE:
      // Nothing for now
      break;
    }
    this.summary.toggle()
  }
}

export default GameCtrl