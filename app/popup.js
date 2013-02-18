document.addEventListener('DOMContentLoaded', function() {
    
   
    var tracker = new TrackAnything();
    window.GUI = new Gui(tracker);
    window.GUI.attachEvents();
    

});