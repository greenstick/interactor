/*
BSD 2-Clause License

Copyright (c) 2016, Benjamin Cordier
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var Interactor = function (config) {
    // Call Initialization on Interactor Call
    this.__init__(config);
};

Interactor.prototype = {

    // Initialization
    __init__: function (config) {

        var interactor = this;
        
        // Argument Assignment          // Type Checks                                                                          // Default Values
        interactor.interactions       = typeof(config.interactions)               == "boolean"    ? config.interations        : true,
        interactor.interactionElement = typeof(config.interactionElement)         == "string"     ? config.interactionElement :'interaction',
        interactor.interactionEvents  = Array.isArray(config.interactionEvents)   === true        ? config.interactionEvents  : ['mouseup', 'touchend'],
        interactor.conversions        = typeof(config.coversions)                 == "boolean"    ? config.conversions        : false,
        interactor.conversionElement  = typeof(config.conversionElement)          == "string"     ? config.conversionElement  : 'conversion',
        interactor.conversionEvents   = Array.isArray(config.conversionEvents)    === true        ? config.conversionEvents   : ['mouseup', 'touchend'],
        interactor.mode               = typeof(config.mode)                       == "string"     ? config.mode               : "xhr",
        interactor.endpoint           = typeof(config.endpoint)                   == "string"     ? config.endpoint           : '/interactions',
        interactor.async              = typeof(config.async)                      == "boolean"    ? config.async              : true,
        interactor.socketSubprotocol  = Array.isArray(config.socketSubprotocol)   === true        ? config.socketSubprotocol  : [],      
        interactor.socketReconnects   = typeof(config.socketReconnects)           === "number"    ? config.socketReconnects   : 3,
        interactor.sessionContinuity  = typeof(config.sessionContinuity)          === "number"    ? config.sessionContinuity  : 900 * 1000 // Sessions Expire After 15 Minutes
        interactor.debug              = typeof(config.debug)                      == "boolean"    ? config.debug              : true,
        interactor.browserStorage     = window.Storage                            !== "undefined" ? true                      : false,
        interactor.records            = [],
        interactor.session            = {},
        interactor.loadTime           = new Date();

        // If in WebSocket Mode, Attempt WebSocket Initialization
        if (interactor.mode === "wss" || interactor.mode === "ws") {
            try {
                interactor.socket = new WebSocket(interactor.endpoint, interactor.socketSubprotocol);
                interactor.__bindWebSocket__();
            } catch (error) {
                console.log("Error: Unable to initialize Web Socket.")
            }
        }

        // Initialize Session
        interactor.__initializeSession__();

        // Call Event Binding Method
        interactor.__bindEvents__();
        
        return interactor;
    },

    // Generate an RFC4122 version 4 compliant UUID - Modified From: stackoverflow.com/questions/105034/create-guid-uuid-in-javascript#2117523
    __generateUUID__: function () {
        var interactor  = this,
            d           = new Date().getTime(),
            uuid        = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                return (c == 'x' ? r : (r&0x3|0x8)).toString(16);
            });
        return uuid;
    },

    // Initialize WebSocket
    __bindWebSocket__: function () {
        var interactor = this;

        // WebSocket Open Event Handler
        interactor.socket.onopen = function () {
            connection.send('ready');
        };

        // WebSocket Error Event Handler
        interactor.socket.onerror = function (error) {
            if (interactor.socketReconnects > 0) {
                console.log('Interactor WS Error: ' + error + '\nReconnecting...');
                var delay = setTimeout(interactor.initWebSocket, 5000);
                -- interactor.socketReconnects;
            } else {
                console.log('Interactor WS Error: ' + error + '\n');
            }
        };
    },

    // Create Events to Track
    __bindEvents__: function () {
        
        var interactor  = this;

        // Set Interaction Capture
        if (interactor.interactions === true) {
            for (var i = 0; i < interactor.interactionEvents.length; i++) {
                var ev      = interactor.interactionEvents[i],
                    targets = document.getElementsByClassName(interactor.interactionElement);
                for (var j = 0; j < targets.length; j++) {
                    targets[j].addEventListener(ev, function (e) {
                        e.stopPropagation();
                        interactor.__addInteraction__(e, "interaction");
                    });
                }
            }   
        }

        // Set Conversion Capture
        if (interactor.conversions === true) {
            for (var i = 0; i < interactor.conversionEvents.length; i++) {
                var ev      = interactor.events[i],
                    targets = document.getElementsByClassName(interactor.conversionElement);
                for (var j = 0; j < targets.length; j++) {
                    targets[j].addEventListener(ev, function (e) {
                        e.stopPropagation();
                        interactor.__addInteraction__(e, "conversion");
                    });
                }
            }   
        }

        // Bind onbeforeunload Event
        window.onbeforeunload = function (e) {
            var unload = {
                "xhr"   : interactor.__sendInteractions__,
                "wss"   : interactor.__closeWebSocket__,
                "ws"    : interactor.__closeWebSocket__
            }
            unload[interactor.mode]();
        };
        
        return interactor;
    },

    // Add Interaction Object Triggered By Events to Records Array
    __addInteraction__: function (e, type) {
            
        var interactor  = this,

            // Interaction Object
            interaction     = {
                type            : type,
                event           : e.type,
                targetTag       : e.target.nodeName,
                targetClasses   : e.target.className,
                content         : e.target.innerText,
                clientPosition  : {
                    x               : e.clientX,
                    y               : e.clientY
                },
                screenPosition  : {
                    x               : e.screenX,
                    y               : e.screenY
                },
                createdAt       : new Date()
            };

        // Insert into Records Array
        interactor.records.push(interaction);

        // Log Interaction if Debugging
        if (interactor.debug) {
            // Close Session & Log to Console
            interactor.__closeSession__();
            console.log("Session:\n", interactor.session);
        }

        return interactor;
    },

    // Generate Session Object & Assign to Session Property
    __initializeSession__: function () {
        var interactor = this;

        // Assign Session Property
        interactor.session  = {
            language        : window.navigator.language,
            platform        : window.navigator.platform,
            port            : window.location.port,
            localstorage    : interactor.browserStorage,
            clientStart     : {
                name            : window.navigator.appVersion,
                innerWidth      : window.innerWidth,
                innerHeight     : window.innerHeight,
                outerWidth      : window.outerWidth,
                outerHeight     : window.outerHeight
            },
            page            : {
                loadTime        : interactor.loadTime,
                location        : window.location.pathname,
                href            : window.location.href,
                origin          : window.location.origin,
                title           : document.title
            },
            endpoint        : interactor.endpoint,
            tokens          : {
                pageID          : interactor.__generateUUID__(),
                pageValid       : null,
                sessionValid    : null
            }
        };

        // Retrieve / Initialize New Session Token
        if (interactor.browserStorage) {
            var loadedToken = localStorage.getItem("interactor_session_token");
            if (loadedToken !== null && interactor.__validateToken__(loadedToken)) {
                interactor.session.tokens.sessionID = loadedToken;
            } else {
                var newToken = interactor.__generateUUID__();
                localStorage.setItem("interactor_session_token", newToken);
                localStorage.setItem("interactor_session_date", interactor.loadTime);
                interactor.session.tokens.sessionID = newToken;
                interactor.session.sessionDate = interactor.loadTime;
            }
        } else {
            interactor.session.tokens.sessionID = null;
        }

        return interactor;
    },

    // Validate Session / Page Tokens
    __validateToken__: function (token) {
        var status = ((token !== null) && (token.match(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i).length === 1))
        return status;
    },

    // Insert End of Session Values into Session Property
    __closeSession__: function () {

        var interactor = this;

        // Assign Session Properties
        interactor.session.unloadTime   = new Date();
        interactor.session.interactions = interactor.records;
        interactor.session.clientEnd    = {
            name            : window.navigator.appVersion,
            innerWidth      : window.innerWidth,
            innerHeight     : window.innerHeight,
            outerWidth      : window.outerWidth,
            outerHeight     : window.outerHeight
        };
        interactor.session.tokens.pageValid = interactor.__validateToken__(interactor.session.tokens.pageID);
        interactor.session.tokens.sessionValid = interactor.__validateToken__(interactor.session.tokens.sessionID);

        return interactor;
    },

    // Close Web Socket Connection
    __closeWebSocket__: function () {
        var interactor = this;

        return interactor;
    },

    // Gather Additional Data and Send Interaction(s) to Server
    __sendInteractions__: function () {
        
        var interactor  = this,
            xhr         = new XMLHttpRequest();
            
        // Close Session
        interactor.__closeSession__();

        // Post Session Data Serialized as JSON
        xhr.open('POST', interactor.endpoint, interactor.async);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(JSON.stringify(interactor.session));

        return interactor;
    }

};
