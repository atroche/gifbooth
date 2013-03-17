

$(function(){
	syncGifs();
});

function initScroller() {

		$('.gifs').scroller({
		container: {
			easing: 'easeOutElastic'
		},
		direction: 'vertical'
	});

	//Move to top GIF
	$('.topGif').click();
}

var idleSeconds = 7;
var idle = true;
var currGifs = {};

function compareList(first,second) {
	for (var i = 0; i < first.length; i++) {
		for (var i = 0; i < second.length; i++) {
			if (first[i] !== second[i]) {
				return false;
			}
		}
	}
	if (Object.keys(first).length < 1 || Object.keys(second).length < 1) {
		return false;
	}
	return true;
}

function syncGifs() {
	//Get list of most recent gifs:

	  $.ajax({
	  dataType: "json",
	  url: 'http://localhost:8080/recent',
	  async: false,
	  success:  function(data){
			if (compareList(currGifs,data)) {  	
				console.log('Lists are the same... leave alone');
			} else {
				$('#scrollerWrapper').html('<div class="scroller gifs"><div class="inside">');
				var htmlClass = 'topGif';
				$.each(data,function(key,value){
					$('.inside').append('<a href="#" class="'+htmlClass+'"> \
					   <img src="/gifs/'+value+'" /></a>');
					htmlClass = '';
				});
				$('#scrollerWrapper').append("</div></div>");

				initScroller();
				currGifs = data;
			}
		    }
		});
}

$(function(){
  var idleTimer;
  function resetTimer(){
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function() {
    	idle = true;
    },idleSeconds*1000);
    idle = false;
  }
  $(document.body).bind('mousemove keydown click',resetTimer);

  resetTimer(); // Start the timer when the page loads

  setInterval(tryPolling, 2000);

});

function tryPolling() {
	if (idle) {
		syncGifs();
	}
}


