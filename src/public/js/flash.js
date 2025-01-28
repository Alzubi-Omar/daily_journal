/**
 * @fileoverview Handles flash message display and dismissal functionality
 * @description Initializes flash message behavior when the DOM content is loaded,
 *              including click-to-dismiss and auto-dismissal features.
 *
 * @constant {number} FADE_OUT_DURATION - Duration in milliseconds for the fade-out animation
 * @constant {number} AUTO_DISMISS_DELAY - Delay in milliseconds before auto-dismissing the message
 */

const FADE_OUT_DURATION = 500;
const AUTO_DISMISS_DELAY = 6000;

document.addEventListener("DOMContentLoaded", function () {
  const flashMessage = document.getElementById("flash-message");

  if (flashMessage) {
    const removeFlashMessage = () => {
      flashMessage.classList.add("hide");
      setTimeout(() => flashMessage.remove(), FADE_OUT_DURATION);
    };

    document.addEventListener("click", removeFlashMessage);

    const autoDismiss = () => {
      setTimeout(removeFlashMessage, AUTO_DISMISS_DELAY);
    };

    autoDismiss();
  }
});
