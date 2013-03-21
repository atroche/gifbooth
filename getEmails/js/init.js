

$(function(){
	syncGifs();


	$('.sendGifButton').click(function(){
		emailGif();
	});
	$('#input_text').keyup(function(e) {
		if(e.keyCode == 13) {
			emailGif();
		}
	});
});

function isRFC822ValidEmail(sEmail) {

  var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
  var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
  var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
  var sQuotedPair = '\\x5c[\\x00-\\x7f]';
  var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
  var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
  var sDomain_ref = sAtom;
  var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
  var sWord = '(' + sAtom + '|' + sQuotedString + ')';
  var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
  var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
  var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
  var sValidEmail = '^' + sAddrSpec + '$'; // as whole string
  
  var reValidEmail = new RegExp(sValidEmail);
  
  if (reValidEmail.test(sEmail)) {
    return true;
  }
  
  return false;
}

function emailGif() {

		var email = $('.gifEmailText').val();

		if (!isRFC822ValidEmail(email)) {
			updateStatus('The email address entered was invalid<br />Please try again')
			return;
		}

		var rawSrc = String($('.active').find('img').attr('src').toLowerCase());

			// assume /gif/ at start of filename:
		var getAfter = 6;
		var getBefore = rawSrc.indexOf(".gif");

		var gifId = rawSrc.substring(getAfter,getBefore);

		postData = {
			email: email,
			id: gifId
		};

	  $.ajax({
	  dataType: "json",
	  data: postData,
	  type: 'POST',
	  url: '/email',
	  async: true,
	  success:  function(data){
	  	// Update statusbar
		updateStatus('Your gif has been emailed to <br /><span class="emailColour">'+email+'</span>');
		$('.gifEmailText').val('');
	  }});
}

function updateStatus(text) {
	$('#emailStatus').show();
	$('#emailStatus').html(text);
	$("#emailStatus").delay(2000).fadeOut("slow");
}

function initScroller() {

		$('.gifs').scroller({
		container: {
			easing: 'easeOutElastic'
		},
		direction: 'vertical'
	});

	//Move to top GIF and clear old email, if any
	$('.gifEmailText').val('');
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
	  url: '/recent',
	  async: false,
	  success:  function(data){
			if (compareList(currGifs,data)) {  	
				// console.log('Lists are the same... leave alone');
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


