// This function will say the given text out loud using the browser's speech synthesis API, or send the message to the ElevenLabs conversion stack
function SayOutLoud(text) {
	console.log("[BROWSER] Saying out loud: " + text);
	const msg = new SpeechSynthesisUtterance();
	msg.text = text;

	msg.rate = 1.25;
	msg.onstart = () => {
		console.timeEnd('t2s lag');
		console.timeEnd('total');
	};
	msg.onend = () => {
		console.log('ended speech');
	}

	console.log('started speech');
	window.speechSynthesis.speak(msg);
}

// Check for new messages the bot has sent. If a new message is found, it will be read out loud
function finishMessage(lastMessage) {
	var currentText = $(".sc-30feab15-3:last").text();

	if (currentText == lastMessage) {
		console.log("Complete new message detected:", currentText);
		currentText = currentText.slice(currentText.indexOf(" ") + 1);
		console.log("Removed first word", currentText);

		SayOutLoud(currentText);
	} else {
		setTimeout(function () { finishMessage(currentText) }, 100); //TODO: find right value for this
	}
}

// Check for new messages the bot has sent. If a new message is found, it will be read out loud
function CheckNewMessages(replyCount, lastMessage = '') {
	// Any new messages?
	const currentMessageCount = $(".sc-30feab15-3").length;
	//console.log('currentMessageCount', currentMessageCount)
	//console.log('replyCount', replyCount)

	if (currentMessageCount > replyCount) {
		// New message
		var currentText = $(".sc-30feab15-3:last").text();

		if (currentText.length > 1 && currentText == lastMessage) {
			console.log("Complete new message detected without space");

			SayOutLoud(currentText);
		} else if (currentText.includes(" ")) {
			console.log("saying first word", currentText.split(" ")[0]);

			SayOutLoud(currentText.split(" ")[0]);
			setTimeout(function () { finishMessage(currentText) }, 100); //TODO: find right value for this
		} else {
			console.log('no first word yet')
			setTimeout(function () { CheckNewMessages(replyCount, currentText) }, 100); //TODO: find right value for this
		}
	} else {
		console.log('no message yet')
		setTimeout(function () { CheckNewMessages(replyCount, currentText) }, 100); //TODO: find right value for this
	}
}

// Send a message to the bot (will simply put text in the textarea and simulate a send button click)
function SendMessage(text) {
	//get current reply count
	const currentMessageCount = $(".sc-30feab15-3").length;

	$(".ProseMirror").text(function (index, existingText) {
		return existingText + " " + text;
	});

	if (window.location.href.includes('claude.ai/chats')) {
		console.time('response');
		console.log('sending message')
		setTimeout(function () {
			$("[data-value='new chat']").find("button").click();
			CheckNewMessages(currentMessageCount + 1);
		}, 1); //TODO: find best value for this
	} else {
		console.time('response');
		console.log('sending message')
		setTimeout(function () {
			$('button[aria-label="Send Message"]').click();
			CheckNewMessages(currentMessageCount + 1);
		}, 1); //TODO: find best value for this
	}
}

// Start speech recognition using the browser's speech recognition API
function StartSpeechRecognition() {
	var speechRec = new webkitSpeechRecognition();
	speechRec.continuous = true;
	speechRec.lang = 'en-US';
	speechRec.start();
	console.log("Speech recognition started");

	speechRec.onstart = () => {
		console.log("I'm listening");
		console.time('s2t');
		console.time('total');
	};

	speechRec.onend = () => {
		console.log("I've stopped listening");
		console.timeEnd('s2t');
		console.timeEnd('total');
		StartSpeechRecognition();
	};

	speechRec.onerror = (event) => {
		console.log("Error while listening: " + event.error);
		//StartSpeechRecognition();
	};

	speechRec.onresult = (event) => {
		console.timeEnd('s2t')
		const final_transcript = event.results[event.results.length - 1][0].transcript;

		console.log("Voice recognition: '" + (final_transcript) + "'");

		// Empty? https://github.com/C-Nedelcu/talk-to-chatgpt/issues/72
		if (final_transcript.trim() == "") {
			console.log("Empty sentence detected, ignoring");
			return;
		}

		// Send the message
		SendMessage(final_transcript);
	};
}

// Start Talk-to-ChatGPT (Start button)
function Start() {
	// Play sound & start
	var snd = new Audio("data:audio/mpeg;base64,//OEZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAKAAAIuAAYGBgYGBgYGBgYSEhISEhISEhISGxsbGxsbGxsbGyEhISEhISEhISEmZmZmZmZmZmZmbGxsbGxsbGxsbHJycnJycnJycnJ3t7e3t7e3t7e3vz8/Pz8/Pz8/Pz///////////8AAAA5TEFNRTMuOTlyAm4AAAAALgkAABRGJAN7TgAARgAACLgWvfqPAAAAAAAAAAAAAAAAAAAA//OEZAANCD9CBqyIAA5QAlGfQBAALXMbhty2HqnTHRXLvlpzEEMYYxhAUA0BNMAimSibLJ1SG8oEGNHLvp1xprEUCDBwMHw/iAMYPg+D6BACAIYPg+D6AQDEucg+/48H3/gcHwf/5cHAQBA5/KBjB8P//+sH31Ag6D4fggZCAXRUBgQDg/KAgCAYB8/DCgQ4nfBAzB/lAQd/wTB8/8oCYPh/DH/5cHwfP//8Hwff///UCAIeUDD1IAAADUAHQt4F//PEZAkcRgU6i85YACR0DlBXjIgAILcTDAFlTJq1IDRkYwLadS3pTAps7AngjQYEBJgQIJuiRVA07PbA3Hn9Ax+h7Awki/Ay5GxA0EhiAwPh2AwhBTAzSDrAaAcAuAILXiZAwZB6BEB0nSqBjoDaCIBpBmCw0LfRSQlIMvE95d8xLpFTIvEW//MSKiNAzLJLqDLw5qXWMyQ59ExSSMkUTFL//8gQs4ho5orUV4B4Bx1EyRUZUmvuKwV7frMQ7qS90klooqSSWiipJJaP//9dqNaHqROlwvIlkmUg/Ig6VGkktFH1lrQzA3//zXfNj4AD2AGEKBQA0wlCkvlgJjoex9J/FkhKj8dxXBjCbEtGVI82K4zCJHl86REvE0bmg6ibUJSR4N4W4zX0klrR//rGkf86QUe/UUS90tHdL//+iYnC8RYPxCCC5DEumqX2Cy09/zIZYk/v6lffo9W3Wvbst1LvWtFDWuOWYxXh2En/9/Jx1lkh5lX/90VFZo/kBPOW//OkZAAS3c8kP+7UABF7snm/wjgDAAkAFpIFhqPKo6AhgCACxnBX4pmTAakungjIYGA4BinMRxXMVyCMSAxMkixMViiMkggMyh/NDTOMvgeMg1oN56CA9pFwNCDkAQGAYXCwGDQII2EBROrF1J4+C8kr/X///+kkLOPkVIKi3////1e3t0N9qkSVJ0yNv///7df62fWv63r/+lzJNFvZlo3VtRJknQqGlo0f3FCAB0B0VNTpuBCuqK0mbnZL+aPDZuB5E3/////6KOkx81f//////f6zWNVjV////1/XX//1////1/5tFIrAXj35Yx+lmJYCHAZEAXqiPKsokmTlPGypW580wUDDFoTSkTv2DRpQSMzOZ0MdqAzKATHqEOCP//OEZC4QsdMeL2uFVI7qLmmWEAsq00spzVhNMlAkqBQFApg0iyth0SOLaP/Zv/fZk//UAQUWHf/6f/9W6URbN812d2FVI3VXZX3r86t1X/77f0si0rtVbKmkpEojfTEDiqDZkMFEiNQbGdzfooADA8jSfQ1HX7SORBwB2OQa/o5m1/9AGMY3//////r6tfriRj31dF3/11M7nytn/AobaLuE6Q8GjKn01QPjjvgsAz43sy8OEwRsOlFkeTCCs0wZ//N0ZBcNhD8gLjzbBA1Qcl1eAEwMN4KTSoc0hhAsgYXmG/xhmwmYSgmZrZEYqx37x6uQ/k9P8VPFf9rvp9LD/el7UvAQbQwpBEYZCDd9K7p5NaBdJNVqy72CiYuODIo9xiEQKlAkekLDCxHgHo9bmvc4pxzxbTAZA8rf///8W///3Hpaix7WWKSpPInv+vu4sMVc+4hLqvsWWECRbeihamQX2hFe+rhj//OEZAgN6d0YBWwjjo6YBoY+AEQCjZ5V3cp48zckDjFQ9CccWrAybOXNDIx82eVERQdjNGTqBmgSpjNVt/L///8v//6///////+us3L6//n7ZQi8+Vd530+s0yhGaaHu2xquS3bOvIKJyMiUMk7r2SGsc5zBqSgr3IPfPsACtIBgBrZfwXWca1l//+u/////p8rjEmpTz5/Xqi99IULOCZ4SAVTPotHi+3vSkG2iELJcLAcQ2AFdQEeEAByQUg7Z//OEZAkMmd0aajdiOI4wbk5eAFgQ9/vUy7D7CIRFgMyYKMCERDIAQFMEYzOi4yUAEIBIbclt89v////1/+///////917f6//t/qu/Xe/u609ab5NHZ7UJKXIrHdDlFuiI1rEFEGm2Oo7nKKUC9MxGJBxiABhQAK0EI/zzoy4AxIRqq1j63q/u/////+1yhKm6EXC3fVaKirLKlYqLC0ay7ff/Z9LWXTvVtUBmMgAkQelypXttxfp6R0KMQPwoABU//N0ZBYMtZsaKkNlRI4wbkQeAF6A9U7MuhDSSplDphpBiotnOQ6K6mYj/3yf///9fb/////Rd1+un79PTahz1RNLOiOXMtNrSEYjM9dqXiA7Ho2xNtGH2dXwBkmp3MWNy78L1uQACoA2x7CYr0dgFIbI3d/6/////9Sppyg2KCiSZtHuetZVVrlUJ9jNiKZvckU1U1JTz8WJLiZ81UopyAA2222MAEi2//OUZAoQFOs3LxnpL44YZm2+AExLLKPIBYQmjiLiW4npRZpeNCZieppVJ2Je9J9WqN4mJZGAaZwHmgTiOk5kSiVwpxQJxweEoqCwycLkBOYPmSUVEJYuURoDZoyiQljqi6Bh7LSFEqkuuw25plEqskvBtz2WoqpJqTYe7StNIlQJpplWS/b9a/76/+AehKSW2wABMIjKTqtkwcCkZlnhNAYslK1XWemvUOWREqog9UlVVKq4lXKqqxT31dfTS7/////t+kxBTUUzLjk5LjWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//MUZCwAAAEcAAAAAAAAAggAAAAAqqqq");
	snd.play();

	// Hide start button, show action buttons
	$(".StartZone").hide();
	$(".StopZone").show();

	// Start speech rec
	StartSpeechRecognition();
}

function Stop() {
	// Hide action buttons, show start button
	$(".StartZone").show();
	$(".StopZone").hide();

	//TODO: stop interaction loop
}

// Perform initialization after jQuery is loaded
function InitScript() {
	if (typeof $ === null || typeof $ === undefined) $ = jQuery;

	var warning = "";
	if ('webkitSpeechRecognition' in window) {
		console.log("Speech recognition API supported");
	} else {
		alert("[Goose] Sorry, but speech recognition was not able to load. The script cannot run. Try using Google Chrome or Edge on Windows 11");
		return;
	}

	// Add icons on the top right corner
	$("body").append(
		"<div style='position: fixed; top: 8px; right: 16px; display: inline-block; " +
		"background: #41464c; color: white; padding: 0; font-size: 16px; border-radius: 8px; text-align: center;" +
		"cursor: move; font-weight: bold; z-index: 1111;' id='TTGPTSettings'>" +

		// Logo / title
		"<div style='padding: 4px 40px; border-bottom: 1px solid grey; display: inline-block; font-size: 20px; line-height: 80%; padding: 8px 0;' target='_blank' title='Visit project website'>Goose<br />" +
		"<div style='text-align: right; font-size: 12px; color: grey'>V0.0.1</div>" +
		"</div>" +

		// Below logo
		"<div>" +

		// Start button
		"<div style='font-size: 16px; padding: 8px;' class='StartZone'>" +
		"<button style='border: 2px solid grey; padding: 6px 40px; margin: 6px; border-radius: 6px; opacity: 0.7;' id='StartButton' title='ALT+SHIFT+S'><i class=\"fa-solid fa-play\"></i>&nbsp;&nbsp;START</button>" +
		"</div>" +

		// Stop button
		"<div style='font-size: 16px; padding: 8px;' class='StopZone'>" +
		"<button style='border: 2px solid grey; padding: 6px 40px; margin: 6px; border-radius: 6px; opacity: 0.7;' id='StopButton' title='ALT+SHIFT+S'><i class=\"fa-solid fa-play\"></i>&nbsp;&nbsp;STOP</button>" +
		"</div>"
	);

	// Try and get voices
	speechSynthesis.getVoices();

	// Make icons clickable
	$("#StartButton").on("click", Start);
	$("#StopButton").on("click", Stop);

	// Make icons change opacity on hover
	$("#StartButton, #StopButton").on("mouseenter", function () { $(this).css("opacity", 1); });
	$("#StartButton, #StopButton").on("mouseleave", function () { $(this).css("opacity", 0.7); });

	$(".StopZone").hide();
}

// MAIN ENTRY POINT
// Load jQuery, then run initialization function
(function () {
	typeof jQuery == "undefined" ?
		alert("[Goose] Sorry, but jQuery was not able to load. The script cannot run. Try using Google Chrome or Edge on Windows 11") :
		InitScript();

})();
