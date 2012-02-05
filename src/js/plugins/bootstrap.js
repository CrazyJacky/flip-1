(function() {
    eve.on('flipper.change', function(newpage, oldpage) {
        if (newpage && newpage.container && newpage.path) {
            $('.navbar a[href="' + newpage.path + '"]', newpage.container).each(function() {
                $(this).parent('li').siblings('li').removeClass('active');
                $(this).parent('li').addClass('active');
            });
        }
    });
})();