// # Flipper Twitter Bootstrap Integration

// This plugin listens for `flip.changed` events and attempts to update an navbar 
// that is likely associated with the flip control.  Generally pretty useful :)

eve.on('flip.changed', function(newroute, oldroute) {
    if (newroute && newroute.element && newroute.url) {
        $('.navbar a[href="' + newroute.url + '"]', newroute.flipper.element).each(function() {
            $(this).parent('li').siblings('li').removeClass('active');
            $(this).parent('li').addClass('active');
        });
    }
});