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
    }
  };

  $(function() {
    new App();
  });
})(jQuery);

