(function() {
    eve.on('flip.to', function(newroute, oldroute) {
        if (newroute && newroute.element && newroute.url) {
            $('.navbar a[href="' + newroute.url + '"]', newroute.flipper.element).each(function() {
                $(this).parent('li').siblings('li').removeClass('active');
                $(this).parent('li').addClass('active');
            });
        }
    });
})();