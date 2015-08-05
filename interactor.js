/*
The MIT License (MIT)

Copyright (c) 2015 Benjamin Cordier

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Interactor = function (config) {
	this.__init__(config);
};

Interactor.prototype = {

	// Initialization
	__init__: function (config) {
		this.interactions 		= config.interactions 		|| true,
		this.interactionElement = config.interactionElement || 'interaction',
		this.interactionEvents 	= config.interactionEvents 	|| ['mouseup', 'touchend'],
		this.conversions 		= config.coversions 		|| false,
		this.conversionElement 	= config.conversionElement 	|| 'conversion',
		this.conversionEvents 	= config.conversionEvents 	|| ['mouseup', 'touchend'],
		this.endpoint 			= config.endpoint 			|| '/interactions',
		this.records 			= [],
		this.__createEvents__();
	},

	// Create Events to Track
	__createEvents__: function () {
		var Interaction 	= this;

		// Set Interaction Capture
		if (Interaction.interactions === true) {
			for (var i = 0; i < Interaction.interactionEvents.length; i++) {
				var ev 		= Interaction.interactionEvents[i],
					targets = document.getElementsByClassName(Interaction.interactionElement);
				for (var j = 0; j < targets.length; j++) {
					targets[j].addEventListener(ev, function (e) {
						e.stopPropagation();
						Interaction.__addInteraction__(e, "interaction");
					});
				}
			}	
		}

		// Set Conversion Capture
		if (Interaction.conversions === true) {
			for (var i = 0; i < Interaction.conversionEvents.length; i++) {
				var ev 		= Interaction.events[i],
					targets = document.getElementsByClassName(Interaction.conversionElement);
				for (var j = 0; j < targets.length; j++) {
					targets[j].addEventListener(ev, function (e) {
						e.stopPropagation();
						Interaction.__addInteraction__(e, "conversion");
					});
				}
			}	
		}

		// Bind onbeforeunload Event
		window.onbeforeunload = function (e) {
			Interaction.__sendInteractions__();
		};
	},

	// Add Interaction Triggered By Events
	__addInteraction__: function (e, type) {
		var Interaction 	= this,
			interaction 	= {
				type 			: type,
				event 			: e.type,
				targetTag 		: e.path[0].tagName,
				targetClasses 	: e.path[0].className,
				content 		: e.path[0].innerText,
				clientPosition  : {
					x 				: e.clientX,
					y 				: e.clientY
				},
				screenPosition 	: {
					x 				: e.screenX,
					y 				: e.screenY
				},
				createdAt 		: new Date
			};
		Interaction.records.push(interaction);
		return this.interactions;
	},

	// Gather additional data and send interaction(s) to server
	__sendInteractions__: function () {
		var Interaction 	= this,
			data 			= {
				language 		: window.navigator.language,
				platform 		: window.navigator.platform,
				port 			: window.location.port,
				client 			: {
					name 			: window.navigator.appVersion,
					innerWidth 		: window.innerWidth,
					innerHeight 	: window.innerHeight,
					outerWidth 		: window.outerWidth,
					outerHeight 	: window.outerHeight
				},
				page 			: {
					location 		: window.location.pathname,
					href 			: window.location.href,
					origin 			: window.location.origin,
					title 			: document.title
				},
				interactions 	: Interaction.records
			},
			ajax  			= new XMLHttpRequest();
		ajax.open('POST', Interaction.endpoint, false);
		ajax.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		ajax.send(JSON.stringify(data));
	}
};