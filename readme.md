Slim Player
==========

A customized HTML5 player.

Features
--------

* Very lightweight. It uses vanila JS (no libraries)
* Provides full access to the elements that are used.
* Allows disabling the functionality of the Play/Pause button if you want custom logic in place.

Dependencies
------------

See ``package.json`` for a detailed list of dependencies.

How to use
----------

The only thing other than including the ``slimplayer.js`` file is to create a video/audio tag with a ``class="SlimPlayer"`` and a proper source child.<br>
Example: 
```HTML
<video class="SlimPlayer">
    <source src="./media.mp4">
</video> 
```


Notes
-----

* A CSS style is not included but I'll probably do it in a later commit
* There are a lot of bugs and missing features, but I'm in a hurry and at this point the essentials are enough.
