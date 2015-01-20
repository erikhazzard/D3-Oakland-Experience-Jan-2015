(function(){
    window.PRESENTATION = window.PRESENTATION || {};
    window.SLIDE_FUNCS = window.SLIDE_FUNCS || {};

    // show the body to prevent the initial janki-ness
    setTimeout(function(){
        $('body').removeClass('hidden');
    }, 200);

    // Setup spinner
    // --------------------------------------
    function setupSpinner() {
        var opts = {
          lines: 13, // The number of lines to draw
          length: 20, // The length of each line
          width: 10, // The line thickness
          radius: 30, // The radius of the inner circle
          corners: 1, // Corner roundness (0..1)
          rotate: 0, // The rotation offset
          direction: 1, // 1: clockwise, -1: counterclockwise
          color: '#000', // #rgb or #rrggbb or array of colors
          speed: 1, // Rounds per second
          trail: 60, // Afterglow percentage
          shadow: false, // Whether to render a shadow
          hwaccel: false, // Whether to use hardware acceleration
          className: 'spinner', // The CSS class to assign to the spinner
          zIndex: 2e9, // The z-index (defaults to 2000000000)
          top: '50%', // Top position relative to parent
          left: '50%' // Left position relative to parent
        };

        // Show a spinner loading indicator on the spinner slide
        var target = document.getElementById('spinner-indicator');
        var spinner = new Spinner(opts).spin(target);
    }

    // Setup individual slide events
    // --------------------------------------
    function setupDeckEvents( deck ){
        deck.on('next', function(event) {
            // Get current slide
            var slideIndex = deck.slide() + 1;

            // cleanup slide
            if(SLIDE_FUNCS[slideIndex-1] && SLIDE_FUNCS[slideIndex-1].cleanup){
                SLIDE_FUNCS[slideIndex-1].cleanup();
            }
            

            handleSlide( slideIndex );
        });
        deck.on('prev', function(event) {
            // Get current slide
            var slideIndex = deck.slide() - 1;

            // cleanup slide
            if(SLIDE_FUNCS[slideIndex+1] && SLIDE_FUNCS[slideIndex+1].cleanup){
                SLIDE_FUNCS[slideIndex+1].cleanup();
            }

            handleSlide( slideIndex );
        });
    }   

    // Handle slide func
    // --------------------------------------
    function handleSlide( slideIndex ){
        // Some slides have fancy shit happening, do it if necessary
        console.log('handleSlide:called | slideIndex: ' + slideIndex);

        // Do stuff based on the slide state
        if(SLIDE_FUNCS[slideIndex]){
            setTimeout(function(){requestAnimationFrame(function(){
                SLIDE_FUNCS[slideIndex].func();
            });}, 450);
        }
    }

    // --------------------------------------
    // Kick off everything after page loads
    // --------------------------------------
    setTimeout(function setEverythingUp(){
        window.PRESENTATION.DECK = window.DECK;

        setupSpinner();

        // Setup and handle deck stuff
        setupDeckEvents( window.DECK );
    }, 400);
})();
