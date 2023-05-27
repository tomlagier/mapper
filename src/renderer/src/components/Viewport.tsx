// create and instantiate the viewport component

import { PixiComponent, useApp } from '@pixi/react'
import { Viewport } from 'pixi-viewport'
import { Ref, forwardRef } from 'react'

// we share the ticker and interaction from app
const PixiViewportComponent = PixiComponent('Viewport', {
  create({ app, plugins, screenWidth, screenHeight, worldWidth, worldHeight, ...rest }) {
    console.log(screenWidth, screenHeight, worldWidth, worldHeight)

    const viewport = new Viewport({
      ticker: app.ticker,
      events: app.renderer.events,
      // stopPropagation: true,
      screenWidth,
      screenHeight,
      worldWidth,
      worldHeight,
      ...rest
    })

    viewport.eventMode = 'static'

    // activate plugins
    viewport
      .drag({
        // direction: 'all',                // (x, y, or all) direction to drag
        // pressDrag: true,                 // whether click to drag is active
        // wheel: true,                     // use wheel to scroll in direction (unless wheel plugin is active)
        // wheelScroll: 1,                  // number of pixels to scroll with each wheel spin
        // reverse: false,                  // reverse the direction of the wheel scroll
        // clampWheel: false,               // clamp wheel (to avoid weird bounce with mouse wheel)
        // underflow: 'center',             // (top-left, top-center, etc.) where to place world if too small for screen
        // factor: 1,                       // factor to multiply drag to increase the speed of movement
        mouseButtons: 'right' // changes which mouse buttons trigger drag, use: 'all', 'left', right' 'middle', or some combination, like, 'middle-right'; you may want to set viewport.options.disableOnContextMenu if you want to use right-click dragging
        // keyToPress: null,                // array containing https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code codes of keys that can be pressed for the drag to be triggered, e.g.: ['ShiftLeft', 'ShiftRight'}
        // ignoreKeyToPressOnTouch: false,  // ignore keyToPress for touch events
        // lineHeight: 20,                  // scaling factor for non-DOM_DELTA_PIXEL scrolling events (used for firefox mouse scrolling)
      })
      // .decelerate({
      //   // friction: 0.95,              // percent to decelerate after movement
      //   // bounce: 0.8,                 // percent to decelerate when past boundaries (only applicable when viewport.bounce() is active)
      //   // minSpeed: 0.01,              // minimum velocity before stopping/reversing acceleration
      // })
      .pinch({
        // noDrag: false,               // disable two-finger dragging
        // percent: 1,                  // percent to modify pinch speed
        // factor: 1,                   // factor to multiply two-finger drag to increase the speed of movement
        // center: null,                // place this point at center during zoom instead of center of two fingers
        // axis: 'all',                 // axis to zoom
      })
      .wheel({
        // percent: 0.1,                // smooth the zooming by providing the number of frames to zoom between wheel spins
        // interrupt: true,             // stop smoothing with any user input on the viewport
        // reverse: false,              // reverse the direction of the scroll
        // center: null,                // place this point at center during zoom instead of current mouse position
        // lineHeight: 20,	            // scaling factor for non-DOM_DELTA_PIXEL scrolling events
        // axis: 'all',                 // axis to zoom
      })
      .moveCenter(worldWidth / 2, worldHeight / 2)
    // .clamp({
    //   // direction: 'all'
    //   // underflow: 'none'
    //   // direction: 'x'
    // })

    return viewport
  },
  applyProps(viewport, _oldProps, _newProps) {
    const { plugins: oldPlugins, children: oldChildren, ...oldProps } = _oldProps
    const { plugins: newPlugins, children: newChildren, ...newProps } = _newProps

    Object.keys(newProps).forEach((p) => {
      if (oldProps[p] !== newProps[p]) {
        viewport[p] = newProps[p]
      }
    })
  },
  didMount() {}
})

// create a component that can be consumed
// that automatically pass down the app
export const PixiViewport = forwardRef((props, ref) => (
  <PixiViewportComponent ref={ref} app={useApp()} {...props} />
))

PixiViewport.displayName = 'PixiViewport'
