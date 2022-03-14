// ==UserScript==
// @name            Scroll Everywhere
// @description     Scroll everywhere with right mouse button.
// @author          tumpio
// @oujs:author     tumpio
// @contributor     joeytwiddle
// @namespace       tumpio@sci.fi
// @homepageURL     https://openuserjs.org/scripts/tumpio/Scroll_Everywhere
// @supportURL      https://github.com/tumpio/gmscripts
// @icon            https://raw.githubusercontent.com/tumpio/gmscripts/master/Scroll_Everywhere/large.png
// @include         *
// @grant           GM_addStyle
// @run-at          document-body
// @version         0.3m
// ==/UserScript==

/* jshint multistr: true, strict: false, browser: true, devel: true */
/* global escape: true,GM_getValue: true,GM_setValue: true,GM_addStyle: true,GM_xmlhttpRequest: true */

// TODO: add slow scroll start mode
// FIXME: Linux/mac context menu on mousedown, probably needs browser level
// FUTURE: Options dialog

var mouseBtn, reverse, stopOnSecondClick, verticalScroll, startAnimDelay, cursorStyle, down,
    scrollevents, scrollBarWidth, cursorMask, isWin, fScrollX, fScrollY, fScroll, slowScrollStart;

var middleIsStart, startX, startY, startScrollTop, startScrollLeft, lastScrollHeight;

var relativeScrolling, lastX, lastY, scaleX, scaleY, power, offsetMiddle;

var lastMiddleClickTime;

var startAfterLongPress, longPressTimer, eventBeforeLongPress, longPressStylesAdded;

var scrollStartTime, scrollStopTime;

// NOTE: Do not run on iframes
if (window.top === window.self) {
    // USER SETTINGS
    mouseBtn = 3; // 1:left, 2:middle, 3:right mouse button
    startAfterLongPress = false; // Only start scrolling after a long click
    reverse = false; // reversed scroll direction
    stopOnSecondClick = false; // keep scrolling until the left mouse button clicked
    verticalScroll = false; // vertical scrolling
    slowScrollStart = false; // slow scroll start on begin
    startAnimDelay = 150; // slow scroll start mode animation delay
    cursorStyle = "grab"; // cursor style on scroll
    middleIsStart = false; // don't jump when the mouse starts moving
    relativeScrolling = false; // scroll the page relative to where we are now
    scaleX = 3; // how fast to scroll with relative scrolling
    scaleY = 3;
    power = 3; // when moving the mouse faster, how quickly should it speed up?
    // END

    fScroll = ((reverse) ? fRevPos : fPos);
    fScrollX = ((verticalScroll) ? fScroll : noScrollX);
    fScrollY = fScroll;
    down = false;
    scrollevents = 0;
    scrollBarWidth = 2 * getScrollBarWidth();
    cursorMask = document.createElement('div');
    isWin = (window.navigator.appVersion.indexOf("Win") != -1 ? true : false);
    if (cursorStyle === "grab")
        cursorStyle = "-webkit-grabbing; cursor: -moz-grabbing";
    cursorMask.id = "SE_cursorMask_cursor";
    cursorMask.setAttribute("style", "position: fixed; width: 100%; height: 100%; zindex: 5000; top: 0px; left: 0px; cursor: " + cursorStyle + "; background: none; display: none;");
    document.body.appendChild(cursorMask);

    window.addEventListener("mousedown", handleMouseDown, false);
    window.addEventListener("mouseup", handleMouseUp, false);
    window.addEventListener("click", handleClick, true);
    window.addEventListener('paste', handlePaste, true);
}

function handleMouseDown(e) {
    // From: https://stackoverflow.com/questions/10045423/determine-whether-user-clicking-scrollbar-or-content-onclick-for-native-scroll
    var wasClickOnScrollbar = e.offsetX > e.target.clientWidth || e.offsetY > e.target.clientHeight;
    if (wasClickOnScrollbar) {
        //console.log('Ignoring click on scrollbar:', e);
        return;
    }
    if (e.which == mouseBtn) {
        if (startAfterLongPress) {
            startLongPress(e);
        } else {
            if (!down) {
                start(e);
            } else {
                stop();
            }
        }
    }
}

function handleMouseUp(e) {
    if (e.which == 2) {
        lastMiddleClickTime = Date.now();
    }
    if (startAfterLongPress) {
        cancelLongPress();
    }
}

function handleClick(e) {
    // If we were just in scrolling mode, then we don't want other listeners to see this click event
    var justStoppedScrolling = Date.now() <= scrollStopTime + 20;
    // But if we went in and out of scrolling mode in a short time, then this was actually a click
    var wasShortClick = !startAfterLongPress && scrollStopTime - scrollStartTime < 200;
    if (justStoppedScrolling && !wasShortClick) {
        //console.info("MUTING click event");
        e.preventDefault();
        e.stopPropagation();
    }
}

function handlePaste(e) {
    var timeSinceLastMiddleClick = Date.now() - lastMiddleClickTime;
    //console.log("Pasting (" + timeSinceLastMiddleClick + "ms):", (event.clipboardData || window.clipboardData).getData('text'));

    // If you use middle button for scrolling on Linux, then you might be sending a paste event every time you use this scroller.
    // Depending on the contents of your clipboard, that could be a privacy leak!
    // Therefore we disable paste events if they come after a middle click (if the user uses middle click for scrolling).
    //
    // Note this solution is still not entirely safe.  There could be an event listener registered before us, which would see the paste.
    // Another option is to disable middle-click but this also isn't trivial to do universally: https://askubuntu.com/questions/4507
    //
    // TODO: It would be better to check if this was a middle-click drag (i.e. a scroll).  A plain short middle-click we could interpret as a paste.

    if (mouseBtn == 2 && timeSinceLastMiddleClick < 200) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}

function startLongPress(e) {
    cancelLongPress();
    eventBeforeLongPress = e;
    longPressTimer = setTimeout(longPressDetected, 500);
    window.addEventListener("mousemove", cancelLongPress, false);
}

function longPressDetected() {
    // Cleanup
    cancelLongPress();
    if (mouseBtn == 1) {
        // After a long press with the left mouse button, the browser will start selecting text, which will get messy when we scroll
        // So we try to cancel that selection
        selectNoText();
    }
    start(eventBeforeLongPress);
    // Give the user a visual indication that scrolling mode has started
    cursorMask.style.display = "";
    // A stronger indication: a ripple effect starting from the mouse location
    // This is especially useful when our pointer change is overriden by the page's CSS
    // Based on: https://css-tricks.com/how-to-recreate-the-ripple-effect-of-material-design-buttons/
    if (!longPressStylesAdded) {
        GM_addStyle(`
            #scroll-anywhere-ripple-animation {
                position: fixed;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 600ms ease-out;
                background-color: #aaa8;
                z-index: 999999;
                pointer-events: none;
            }
            @keyframes ripple {
                from {
                    transform: scale(0);
                    opacity: 1;
                }
                to {
                    transform: scale(16);
                    opacity: 0;
                }
            }
        `);
        longPressStylesAdded = true;
    }
    var circleDiv = document.createElement('div');
    circleDiv.id = 'scroll-anywhere-ripple-animation';
    circleDiv.style.left = (eventBeforeLongPress.clientX - 10) + 'px';
    circleDiv.style.top = (eventBeforeLongPress.clientY - 10) + 'px';
    document.body.appendChild(circleDiv);
    setTimeout(() => {
        circleDiv.parentNode.removeChild(circleDiv);
    }, 2000);
}

function cancelLongPress() {
    clearTimeout(longPressTimer);
    window.removeEventListener("mousemove", cancelLongPress);
}

function start(e) {
    down = true;
    scrollStartTime = Date.now();
    setStartData(e);
    lastX = e.clientX;
    lastY = e.clientY;
    if (!slowScrollStart)
        scroll(e);
    window.addEventListener("mousemove", waitScroll, false);
    if (!stopOnSecondClick)
        window.addEventListener("mouseup", stop, false);
}

function setStartData(e) {
    lastScrollHeight = getScrollHeight();
    startX = e.clientX;
    startY = e.clientY;
    // On some pages, body.scrollTop changes whilst documentElement.scrollTop remains 0.
    // For example: https://docs.kde.org/trunk5/en/kde-workspace/kcontrol/autostart/index.html
    // See: https://stackoverflow.com/questions/19618545
    startScrollTop = document.documentElement.scrollTop || document.body.scrollTop || 0;
    startScrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft || 0;
}

function waitScroll(e) {
    scrollevents += 1;
    if (scrollevents > 2) {
        cursorMask.style.display = "";
        if (isWin)
            document.oncontextmenu = fFalse;
        window.removeEventListener("mousemove", waitScroll, false);
        window.addEventListener("mousemove", scroll, false);
    }
}

function scroll(e) {
    // If the site has just changed the height of the webpage (e.g. by auto-loading more content)
    // then we must adapt to the new height to avoid jumping.
    if (lastScrollHeight !== getScrollHeight()) {
        setStartData(e);
    }
    //scrollevents += 1;
    if (!stopOnSecondClick && e.buttons === 0) {
        stop();
        return;
    }
    if (relativeScrolling) {
      var diffX = e.clientX - lastX;
      var diffY = e.clientY - lastY;
      var distance = Math.sqrt(diffX * diffX + diffY * diffY);
      var velocity = 1 + distance * power / 100;
      var reverseScale = reverse ? -1 : 1;
      window.scrollTo(window.scrollX + diffX * scaleX * velocity * reverseScale, window.scrollY + diffY * scaleY * velocity * reverseScale);
      lastX = e.clientX;
      lastY = e.clientY;
      return;
    }
    // The original absolute scrolling
    window.scrollTo(
        fScrollX(
            window.innerWidth - scrollBarWidth,
            getScrollWidth() - window.innerWidth,
            e.clientX),
        fScrollY(
            window.innerHeight - scrollBarWidth,
            getScrollHeight() - window.innerHeight,
            e.clientY)
    );
}

function stop() {
    cursorMask.style.display = "none";
    if (isWin)
        document.oncontextmenu = !fFalse;
    down = false;
    scrollStopTime = Date.now();
    scrollevents = 0;
    window.removeEventListener("mouseup", stop, false);
    window.removeEventListener("mousemove", scroll, false);
    window.removeEventListener("mousemove", waitScroll, false);
}

function noScrollX() {
    return document.documentElement.scrollLeft;
}

function fPos(win, doc, pos) {
    if (middleIsStart) {
        if (pos < startY) {
            return startScrollTop * pos / startY;
        } else {
            return startScrollTop + (doc - startScrollTop) * (pos - startY) / (win - startY);
        }
    }
    return doc * (pos / win);
}

function fRevPos(win, doc, pos) {
    if (middleIsStart) {
        if (pos < startY) {
            return startScrollTop + (doc - startScrollTop) * (startY - pos) / startY;
        } else {
            return startScrollTop - startScrollTop * (pos - startY) / (win - startY);
        }
    }
    return doc - fPos(win, doc, pos);
}

function getScrollHeight(e) {
  return document.body.scrollHeight || document.documentElement.scrollHeight || 0;
}

function getScrollWidth(e) {
  return document.body.scrollWidth || document.documentElement.scrollWidth || 0;
}

function getScrollBarWidth() {
    var originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    var width = document.body.clientWidth;
    document.body.style.overflow = 'scroll';
    width -= document.body.clientWidth;
    if (!width) width = document.body.offsetWidth - document.body.clientWidth;

    // Now we set overflow back to how it was
    // But if style === '' then Firefox will sometimes leave the temporary scrollbar still showing!
    // We can prevent that by setting it to 'initial', and forcing a relayout, before setting it to ''
    document.body.style.overflow = originalOverflow || 'initial';
    var triggerLayout = document.body.clientWidth;
    document.body.style.overflow = originalOverflow;

    return width;
}

function fFalse() {
    return false;
}

function slowF(x) {
    return 1 / (1 + Math.pow(Math.E, (-0.1 * x)));
}

function selectNoText() {
	if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        selection.removeAllRanges();
    } else {
        console.warn("Could not unselect text: Unsupported browser.");
    }
}
