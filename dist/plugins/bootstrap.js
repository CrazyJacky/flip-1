(function() {
    eve.on('flipr.change', function(newpage, oldpage, evt) {
        if (evt && newpage && typeof jQuery != 'undefined') {
            var target = evt.target || evt.srcElement;
            
            $(target).parent('li').siblings('li').removeClass('active');
            $(target).parent('li').addClass('active');
         }
    });
})();