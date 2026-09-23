// Runs before first paint (plain, synchronous script) so a saved dark theme never flashes white.
// The site opens in light mode for everyone; only a theme the visitor picked with the toggle is remembered.
// Lives in its own file rather than inline so the Content-Security-Policy can stay at script-src 'self'.
(function () {
  try {
    var theme = localStorage.getItem("theme") === "dark" ? "dark" : "light";
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
