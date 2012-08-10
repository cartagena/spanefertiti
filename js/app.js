/* ==========================================================
 * Spa nefertiti page.
 *
 * Dual licensed under the MIT and GPL Version 2 licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Copyright (c) 2012 Rafael Xavier de Souza <rxaviers@gmail.com>.
 * ========================================================== 
 */
;
(function( $, undefined ) {

  function App() {
    this._run();
  };

  App.prototype = {
    _run: function() {
      this._bind();

      $("#album")
        .bind("photoviewerdisplay", function(ev, data) {
          var next = $(data.anchor).next(),
              prev = $(data.anchor).prev();

          next.length && next.attr("href") ? $.imgpreload(next.attr("href")) : null;
          prev.length && prev.attr("href") ? $.imgpreload(prev.attr("href")) : null;
        })
        .photoviewer();
    },

    _bind: function() {
      $("#logo").click(function() {
        $(".main .nav .home a").click();
      });

      $("#home")
        .on("click", "li", function(ev) {
          var $target = $(ev.target),
              source = $target.attr("class")
                .replace(/span3/g, "")
                .replace(/ /g, "");
          $(".main .nav ." + source + " a").click();
        });

      $("#album").photoviewer();

      $("li.fotos a").click(function() {
        $('img[data-original]').each(function() {
          $(this)
            .attr("src", $(this).data("original"))
            .removeAttr("data-original");
        })
      });
    }
  };

  $(function() {
    new App();
  });
})(jQuery);


