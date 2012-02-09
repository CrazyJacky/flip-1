====
Flip
====

Lightweight single page apps event-driven unframework.  

The point of flip is not to try and do everything.  **Less is more as I see it**. In fact the core attempts to do as little as programmatically possible.  

Why Flip?
=========

Well, I'm incredibly frustrated with the current state of play with regards to cross-platform mobile web frameworks.  Sure there's some good stuff out there, but all of them are being pretty instructive about how they want me to write my code.  Even worse, they are generally providing me with AJAX wrappers, DOM manipulators, and whole piles of other stuff that I don't think is as good as other things out there. Bloat, bloat, bloat.  Not a fan.

On the other side of the mobile web fence we are seeing some fantastic progress around out of the box responsive CSS focused toolkits.  Stuff like `Twitter Bootstrap`__ and `Zurb Foundation`__ to name a few.

__ http://twitter.github.com/bootstrap
__ http://foundation.zurb.com/

While we aren't there yet, it's not hard to see that you can really do a lot with these frameworks and code without a framework.  You can use something like `Backbone`__ with these and get some pretty solid results, over using one of the other "full-stack" mobile web application frameworks.

__ http://backbonejs.org/

Unlike just about everyone else on the web (it would seem) though, I really haven't fallen for Backone.  I can see it's merits, but despite the praises being sung from the rooftops for building apps using MVC (or MV*) patterns, it's really not my bag.  Patterns are important yes, but the client-side web is highly evented and trying to wrap that chaotic evented world with structured patterns like MVC just seems, well, not quite right.

So I created flip as an **experiment**.  

After looking at the various frameworks out there and then combining that with my love for the absolutely awesome eventing library, `Eve`__ I set out to create something different - a small "unframework" that did **substantially less** than all the other options out there.  

__ https://github.com/DmitryBaranovskiy/eve

Example Usage
=============

For the moment, I'd recommend checking out the `Bootstrap demos`__ and having a look through the source if you are feeling brave.  I'll provide more detail here soon...

__ /DamonOehlman/flip/tree/master/demos



Your Choice and Your Feedback
=============================

You should be free to choose.  Backbone goes some of the way to encouraging choice, but I think you should have yet more freedom.  Flip represents an attempt at providing you that freedom.  

Somewhere between 90% and 99% of you will probably think this is just silly and MV* style patterns are the answer. That's fair enough.  If you love MVC then we should chat over beer sometime and you can convince me why.  If, however, you do think this is an idea *worth further exploration*, then please let me know and throw some constructive criticism my way (issues, tweets, etc).

I think I would definitely benefit from some external perspective :)