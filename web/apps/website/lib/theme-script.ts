/**
 * Inline theme resolver.
 *
 * Runs in <head> before first paint so the chosen theme is applied without a
 * flash. Dark is the default: `.dark` is present on <html> in the markup, and
 * only an explicit "light" choice removes it. Kept in a server-safe module:
 * importing a plain string from a "use client" module would hand the server a
 * client reference instead.
 */
export const themeScript = `(function(){try{var s=localStorage.getItem("astron-theme");var dark=s!=="light";document.documentElement.classList.toggle("dark",dark);document.documentElement.style.colorScheme=dark?"dark":"light";}catch(e){}})();`;
