// (c) 2016 Flavio Colonna Romano
// This code is licensed under MIT license (see license.txt for details)
angular.module("snackbar", ['ngAnimate']).service('$snackbar', ['$http', '$log', '$animate', '$q', '$templateCache', function($http, $log, $animate, $q, $templateCache) {
  var timeout = {};
    var template = $templateCache.get('snackbar.html');
    var templatePromise = null;
    if(typeof template === 'undefined'){
        templatePromise = $http({
            method: 'GET',
            url: './snackbar.html'
        })
    }else{
        templatePromise = $q.resolve({data: template});
    }
    template = templatePromise.then(function(result) {
    var body = document.getElementsByTagName("body")[0];
    var previousSnackbar = document.getElementsByClassName('snackbar-wrapper');
    if (previousSnackbar.length == 0) {
      angular.element(body).append(result.data)
    }
    return result.data;
  }, function(err) {
    $log.log("Error getting html template", JSON.stringify(err))
  });
  this.show = function(options) {
    return $q(function(resolve, reject) {
      clearTimeout(timeout);
      template.then(function(res) {
      var wrapper = document.getElementsByClassName("snackbar-wrapper");
      $animate.removeClass(wrapper[0], "active").then(function() {
        if (!options.message) {
          $log.error("Message in the snackbar not defined");
          reject("Message in the snackbar not defined");
          return;
        }

        var messageColor = options.messageColor ? options.messageColor : 'white';
        var buttons = [];
        if(options.buttons && options.buttons instanceof Array){
            for(var i = 0; i < options.buttons.length; i++){
                buttons.push(
                    createButton(
                        options.buttons[i].name,
                        options.buttons[i].color,
                        options.buttons[i].callback
                    )
                );
            }

        }else{
            //backwards compatibility
            buttons.push(
                createButton(
                    options.buttonName,
                    options.buttonColor ,
                    options.buttonFunction
                )
            );
        }


        var time = options.time ? options.time : 'SHORT';
        var timeMs;
        switch(time) {
            case 'SHORT':
                timeMs = 3000;
                break;
            case 'LONG':
                timeMs = 8000;
                break;
            case 'INDETERMINATE':
                timeMs = 0;
                break;
            default:
                timeMs = 3000;
        }
          angular.element(document.getElementsByClassName("snackbar-btn")).remove();
          var content = document.getElementsByClassName("snackbar-content");

          buttons.forEach(function(
            button
          ){
              content[0].appendChild(button);
          })


          angular.element(wrapper).find('span').text(options.message);
          angular.element(wrapper).find('span').css('color', messageColor);
          angular.element(wrapper).addClass("active");

        if(timeMs > 0){
            timeout = setTimeout(function() {
              angular.element(wrapper).removeClass("active");
              resolve("1");
          }, timeMs);
        }else{
            angular.element(wrapper).on('snackbar-closed', function(){
                if(timeMs == 0){
                    resolve("1");
                }
            })
        }
        });
      });
    });
  };
  this.hide = hide;

  function hide() {
      clearTimeout(timeout);
      var wrapper = document.getElementsByClassName("snackbar-wrapper");
      angular.element(wrapper).triggerHandler('snackbar-closed');
      angular.element(wrapper).removeClass("active");
  }

  function createButton(name, color, callback)
  {
      var button = document.createElement("a");

      button.classList.add("snackbar-btn");
      button.text = name ? name.trim() : false;
      button.style.color = color ? color : '#a1c2fa';
      button.addEventListener('click', callback ? callback : hide);

      return button;
  }
}]);
