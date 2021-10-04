# Interactor.js

A simple, light-weight (< 5KB minified), no dependency, front-end website interaction tracker for personal websites and web projects. 

Collects usage data and send it to a user-defined server endpoint on the beforeunload event.

Great for creating a database to drive analytics, inform A/B testing, monitor engagement, and guide site optimization decisions.

This data can help you analyze:
* How your users navigate your website
* Engagement levels on a per-page and site-wide basis
* What platforms, language settings, and browser dimensions your users have
* Bounce rates, page and site bottle-necks, impressions, and conversions

[![DOI](https://zenodo.org/badge/40263917.svg)](https://zenodo.org/badge/latestdoi/40263917)

## Documentation
Documentation is currently being written. There's a working (front-end) [example of Interactor](http://greenstick.github.io/interactor/). To explore it, open up your browsers' console and click on the interaction and conversion buttons.

Interactor currently supports modern browsers: Chrome, Firefox, & Safari. Additional testing & input is welcome.

## What Data is Provided?

General Data:

* Which page is loaded
* When the user loaded the page
* When the user left the page
* The URL of the loaded page
* The previous page location
* The title of the page
* The language settings of the user
* The user's platform
* The port used to access the web server
* The inner and outer width and height of the web browser

Interaction / Conversion Data: 

* The interaction type (i.e. general interaction or conversion)
* The time of the interaction
* The event that triggered interaction
* The target HTML element tag
* The target HTML element classes
* The target HTML element content (i.e. text, etc.)
* The cursor position relative to client
* The cursor position relative to screen

## Example Usage

Include the script in your HTML and invoke it. 
```html
<!DOCTYPE html>
<html>
	<head>
		<title>Interaction Tracker Example</title>
	</head>
	<body>
		<div class="interaction"></div>
		<div class="interaction"></div>
		<div class="interaction"></div>
		<div class="conversion"></div>
		<script src="interactor.min.js" type="application/javascript"></script>
		<script>
			// An example instantiation with custom arguments
			var interactions = new Interactor({
				interactions            : true,
				interactionElement      : "interaction",
				interactionEvents       : ["mousedown", "mouseup", "touchstart", "touchend"],
				conversions             : true,
				conversionElement       : "conversion",
				conversionEvents        : ["mouseup", "touchend"],
				endpoint                : '/usage/interactions',
				async                   : true,
				debug                   : false
			});
		</script>
	</body>
</html>
```
To track a users interactions with an element, simply add the `.interaction` CSS class to the element.

Have a conversion point on your page? You can add that too, just add the `.conversion` CSS class to your conversion's HTML element. 

Want to track a user's interactions and/or conversions with different element classes already on your page? Create multiple instances and allow each to target a specific element to track. No update to your HTML neccessary.

**Example:**
```javascript
var elementsToTrack = [
	{
		element: "element1",
		events : ["mouseup", "touchend"]
	}, 
	{
		element: "element2",
		events : ["mouseup"]
	},
	{ 
		element: "element3",
		events : ["mouseup"]
	}
];

for (var i = 0; i < elementsToTrack.length; i++) {
	var e = elementsToTrack[i];
	new Interactor({
		interactionElement 	: e.element,
		interactionEvents 	: e.events
	});
} 
```

**Default Parameters:**
```javascript
{
	interactions            : true,
	interactionElement      : 'interaction',
	interactionEvents       : ['mouseup', 'touchend'],
	conversions             : false,
	conversionElement       : 'conversion',
	conversionEvents        : ['mouseup', 'touchend'],
	endpoint                : '/interactions',
	async                   : true,
	debug                   : true
}
```

## Can I Buy You a Coffee?
Sure! I'm a grad student – coffee is always very much appreciated! Thanks!

[![Buy me a coffee][buymeacoffee-icon]][buymeacoffee-link]

[buymeacoffee-link]: https://www.buymeacoffee.com/O1TrCFSXa
[buymeacoffee-icon]: https://www.buymeacoffee.com/assets/img/custom_images/purple_img.png
