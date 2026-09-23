// Runs before first paint (plain, synchronous script) so a saved or system dark theme never flashes white.
// Lives in its own file rather than inline so the Content-Security-Policy can stay at script-src 'self'.
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark =
      stored === "dark" || (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.add(dark ? "dark" : "light");
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch (e) {}
})();
