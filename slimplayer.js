window.SlimPlayer = (function(){
    var seekPaused = false;
    var playPathD = 'M10,10 25,18 20,18 10,18 Z M10,18 20,18 25,18 10,26 Z';
    var pausePathD = 'M10,25 10,10 15,10 15,25 Z M17,25 17,10 22,10 22,25 Z';
    var controlEnabled = true;
    var players = [];
    function PlayerElements() {
        var _controlEnabled = true;
        this.Player = null;
        this.ControlsWrapper = null;
        this.PlayButton = null;
        this.SeekSlider = null;
        this.VolumeSlider = null;
        this.FullScreenButton = null;
        this.TimeInfo = null;
        this.ControlEnabled = function() {
            return _controlEnabled;
        }
        this.ToggleControl = function() {
            if(_controlEnabled) {
                this.PlayButton.addEventListener('click', PlayPauseHandler);
            }
            else {
                this.PlayButton.removeEventListener('click', PlayPauseHandler);
            }
            _controlEnabled = !_controlEnabled;
        }
    };

    document.addEventListener("DOMContentLoaded", function(){
        var elements = document.getElementsByClassName("SlimPlayer");
        for (let i = 0; i < elements.length; i++) {
            if(elements[i].tagName === "VIDEO") {
                ConstructPlayer(elements[i]);
            }
        }
    });

    function ConstructPlayer(videoNode) {
        var pe = new PlayerElements();
        pe.Player = videoNode;
        videoNode.addEventListener('play', PlayHandler);
        videoNode.addEventListener('pause', PauseHandler);
        videoNode.addEventListener('timeupdate', TimeUpdateHandler);
        videoNode.addEventListener('buffer', BufferProgressHandler);
        var nextSibling = videoNode.nextElementSibling;
        var parent = videoNode.parentElement;
        var playerWrapper = CreateElement("slimplayer-wrapper");
        playerWrapper.appendChild(videoNode);
        parent.insertBefore(playerWrapper, nextSibling);
        var controls = CreateElement("controls");
        pe.ControlsWrapper = controls;
        var seekbar = CreateElement("seekbar");
        var seekSlider = CreateElement("range_slider");
        var mainTrack = CreateElement();
        mainTrack.setAttribute("main", 1);
        seekSlider.appendChild(mainTrack);
        seekSlider.appendChild(CreateElement());
        seekSlider.addEventListener("sliderProgressChanged", SliderProgressHandler);
        seekSlider.addEventListener("sliderSeek", SeekStartHandler);
        seekSlider.addEventListener("sliderSeekEnd", SeekEndHandler);
        pe.SeekSlider = SlimSlidy.CreateSliderFromElement(seekSlider);
        seekbar.appendChild(seekSlider);
        controls.appendChild(seekbar);
        var playbutton = CreateElement("playbutton left");
        var playsvg = CreateSvg(playPathD);
        var playpath = playsvg.getElementsByTagName('path')[0];
        playpath.appendChild(CreateAnimate("animation-pause", "200ms", pausePathD));
        playpath.appendChild(CreateAnimate("animation-play", "200ms", playPathD));
        playbutton.appendChild(playsvg);
        playbutton.addEventListener('click', PlayPauseHandler);
        pe.PlayButton = playbutton;
        controls.appendChild(playbutton);
        var timeInfo = CreateElement("timeInfo left", "span");
        timeInfo.innerText = "00:00/00:00";
        pe.TimeInfo = timeInfo;
        controls.appendChild(timeInfo);
        var right = CreateElement("right");
        var volume = CreateElement("volume left");
        var volumeSlider = CreateElement("range_slider");
        mainTrack = CreateElement();
        mainTrack.setAttribute("main", 1);
        volumeSlider.setAttribute("initial", 50);
        volumeSlider.appendChild(mainTrack);
        pe.VolumeSlider = SlimSlidy.CreateSliderFromElement(volumeSlider);
        volume.appendChild(volumeSlider);
        right.appendChild(volume);
        var fullscreen = CreateElement("fullscreen left");
        fullscreen.appendChild(CreateSvg(
            "M10,10 28,10 28,24 10,24 Z M12,12 26,12 26,22 12,22 Z  M13,13 13,16 16,13 Z M25,13 25,16 22,13 M25,21 22,21 25,18 M13,21 13,18 16,21",
                "evenodd"));
        fullscreen.addEventListener("click", FullScreenHandler);
        pe.FullScreenButton = fullscreen;
        right.appendChild(fullscreen);
        controls.appendChild(right);
        playerWrapper.appendChild(controls);
        var conrEvt = new CustomEvent("playerConstructionDone");
        document.dispatchEvent(conrEvt);
        players.push(pe);
    }

    function CreateElement(cls="", type="div"){
        var el = document.createElement(type);
        if(cls!==""){el.setAttribute("class", cls);}
        return el;
    }

    function CreateSvg(pathd, fillrule = "", viewBox="0 0 36 36", fill="#d1d1d1"){
        var svg = document.createElementNS('http://www.w3.org/2000/svg', "svg");
        svg.setAttribute("viewBox", viewBox);
        svg.setAttribute("fill", fill);
        var path = document.createElementNS('http://www.w3.org/2000/svg',"path");
        path.setAttribute("d", pathd);
        if(fillrule !== "") {path.setAttribute("fill-rule", fillrule);}
        svg.appendChild(path);
        return svg;
    }

    function CreateAnimate(className, duration, to, attrName="d"){
        var animate = document.createElementNS('http://www.w3.org/2000/svg', "animate");
        animate.setAttribute('class', className);
        animate.setAttribute('begin', 'indefinite');
        animate.setAttribute('fill', 'freeze');
        animate.setAttribute('attributeName', attrName);
        animate.setAttribute('dur', duration);
        animate.setAttribute('to', to);
        return animate;
    }

    function FullScreenHandler() {
        var player = this.parentElement.parentElement.previousElementSibling;
        if (player.requestFullscreen) {
            player.requestFullscreen();
        } else if (player.mozRequestFullScreen) {
            player.mozRequestFullScreen();
        } else if (player.webkitRequestFullscreen) {
            player.webkitRequestFullscreen();
        }
    }

    function getTimeString(time) {
        time = Math.round(time);
        var minutes = Math.floor(time / 60);
        var seconds = time % 60;
        if(minutes < 10) {
            minutes = '0'+minutes;
        }
        if(seconds < 10) {
            seconds = '0'+seconds;
        }
        return minutes+':'+seconds;
    }

    function PlayHandler() {
        var path = this.parentNode.getElementsByTagName("path")[0];
        var aniPause = this.parentNode.getElementsByClassName("animation-pause")[0];
        animatePlayPause(path, aniPause);
    }

    function PauseHandler() {
        var path = this.parentNode.getElementsByTagName("path")[0];
        var aniPlay = this.parentNode.getElementsByClassName("animation-play")[0];
        animatePlayPause(path, aniPlay);
    }

    function PlayPauseHandler() {
        var player = this.parentNode.parentNode.getElementsByClassName('SlimPlayer')[0];
        if(player.paused) {
            player.play();
        }
        else {
            player.pause();
        }
    }

    function animatePlayPause(path, animation) {
        if('beginElement' in animation) {
            animation.beginElement();
        }
        else {
            path.setAttribute('d', animation.getAttribute('to'));
        }
    }

    function TimeUpdateHandler() {
        var timeSpan = this.parentElement.getElementsByClassName("timeInfo")[0];
        var seekbar = this.parentElement.getElementsByClassName("seekbar")[0].getElementsByClassName("range_slider")[0];
        
        SlimSlidy.GetSliderFromElement(seekbar).SetCurrent(0, this.currentTime/this.duration);
        timeSpan.innerText = getTimeString(this.currentTime)+'/'+getTimeString(this.duration);
    }

    function GetBufferEnd(player) {
        for (let i = 0; i < player.buffered.length; i++) {
            if(player.buffered.start(i) < player.currentTime && player.buffered.end(i) > player.currentTime){
                return player.buffered.end(i);
            }
        }
        return 0;
    }

    function BufferProgressHandler() {
        var seekbar = this.parentElement.getElementsByClassName("seekbar")[0].getElementsByClassName("range_slider")[0];
        var endOfBuffer = GetBufferEnd(this);
        
        SlimSlidy.GetSliderFromElement(seekbar).SetCurrent(1, endOfBuffer / this.duration);
    }

    function SliderProgressHandler(e, obj) {
        obj = obj || this;
        var player = obj.parentElement.parentElement.previousElementSibling;
        if(obj && obj !== this){player.pause();}
        player.currentTime = e.detail.current * player.duration / 100;
    }

    function SeekStartHandler(e){
        var player = obj.parentElement.parentElement.previousElementSibling;
        seekPaused = true;
        fallbackTime = player.currentTime;
        SliderProgressHandler(e, this);
    }

    function SeekEndHandler() {
        if(seekPaused) {
            seekPaused = false;
        }
        var player = this.parentElement.parentElement.previousElementSibling;
        var seekevt = new CustomEvent('SlimPlayerSeek', {detail: player.currentTime});
        player.dispatchEvent(seekevt);

    }

    function GetPlayerFromElement(elem) {
        for (let i = 0; i < players.length; i++) {
            if(elem === players[i].Player) {
                return player[i];
            }
        }
        return null;
    }

    function GetFirstPlayer() {
        return (players.length) ? players[0] : null;
    }

    return {
        GetPlayerFromElement: GetPlayerFromElement,
        GetFirstPlayer: GetFirstPlayer
    }
})();