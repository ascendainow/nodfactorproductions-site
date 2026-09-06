/* Nod Factor - Luxury Broadcast: shared nav behaviour */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") { fn(); }
    else { document.addEventListener("DOMContentLoaded", fn); }
  }

  ready(function () {
    var burger = document.querySelector(".nf-burger");
    var links  = document.querySelector(".nf-links");

    /* Mobile menu toggle */
    if (burger && links) {
      burger.addEventListener("click", function () {
        var open = links.classList.toggle("open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
      });
      /* Close after choosing a destination */
      links.addEventListener("click", function (e) {
        if (e.target.tagName === "A") {
          links.classList.remove("open");
          burger.setAttribute("aria-expanded", "false");
        }
      });
      /* Close on Escape */
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && links.classList.contains("open")) {
          links.classList.remove("open");
          burger.setAttribute("aria-expanded", "false");
          burger.focus();
        }
      });
    }

    /* Mark the current page in the nav */
    if (links) {
      var here = location.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
      if (here.length > 1 && here.charAt(here.length - 1) === "/") {
        here = here.slice(0, -1);
      }
      var all = links.querySelectorAll("a");
      for (var i = 0; i < all.length; i++) {
        var href = all[i].getAttribute("href") || "";
        if (href.charAt(0) !== "/" || href.indexOf("#") !== -1) { continue; }
        var path = href.replace(/\.html$/, "");
        if (path.length > 1 && path.charAt(path.length - 1) === "/") {
          path = path.slice(0, -1);
        }
        if (path === here) { all[i].setAttribute("aria-current", "page"); }
      }
    }
  });
})();
