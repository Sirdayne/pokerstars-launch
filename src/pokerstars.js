(() => {
	/**
	 * @typedef {Object} GameController
	 * @property {function} pauseGame - allows to pause game
	 * @property {function} resumeGame - allows to resume game
	 * @property {function} stopAutospins - allows to stop game autospins
	 *
	 * @typedef {Object} InitData
	 * @extends ResizeData
	 * @property {Boolean} isProvabilityAvailable
	 * @property {Boolean} isGambleAvailable
	 *
	 * @typedef {Object} SpinData
	 * @property {Number} bet - total bet for spin
	 * @property {Number} win - spin total win amount
	 *
	 */

	/**
	 * game events with sended data descriptions
	 */
	const GAME_EVENTS = {
		/**
		 * Fires when game just started loading
		 * @property {undefined} targetName
		 * @property {GameController} context - game controller which allows pause and resume game, stop autospins etc.
		 */
		START_LOADING: 'start_loading',
		/**
		 * Fires when a game just show up
		 * @property {String} targetName - Game identifier (name)
		 * @property {InitData} context - Game size, orientation data and flags about game state (provabiity, gamble)
		 */
		GAME_LOADED: 'game_loaded',

		ADJUST_WAGER_AMOUNT: 'adjust_wager_amount',

		ON_BET: 'on_bet',

		ON_MUTE: 'on_mute',
		ON_UNMUTE: 'on_unmute'
	};

	const GAME_POST_EVENTS = {
		MUTE: 'mute_game',
		UNMUTE: 'unmute_game'
	}

	/**
	 * events from XC client(PokerStars) to Game Client
	 */
	const GET_EVENTS = {
		// Requests launching the game with corresponding parameters. When completed, the Game sends rg2xcLaunchGameDone to the XC Client.
		// field 'keysAndValues' with a lot of fields
		XC_LAUNCH_GAME: 'xc2rgLaunchGame',

		// Notify the player's latest balance to the game. This is triggered by either depositing/withdrawing using the cashier, or winning/losing in a game.
		XC_BALANCE_UPDATED: 'xc2rgBalanceUpdated2',

		// Notifies the game that properties are updated, and game should apply them accordingly. Used for Mute/Unmute game.
		XC_PROPERTIES_UPDATED: 'xc2rgPropertiesUpdated',

		// Notifies the game that the size of the iFrame of the game has changed.
		XC_SIZE_CHANGED: 'xc2rgSizeChanged',

		// Requests the game to open the Pay Table.
		XC_SHOW_PAYTABLE: 'xc2rgShowPaytable',

		// Response of the rg2xcErrorOccurred message, indicating that the error is handled by the XC Client.
		// When receiving this message, game play should be reenabled if it was disabled/grayed out when the error occurred.
		XC_ERROR_HANDLED: 'xc2rgErrorHandled',

		// Requests the game to pause and stop autoplay (if one exists).
		// field `condition`: 'waitUntilHandEnd', 'waitUntilAnimationEnd'
		XC_PAUSE_GAME: 'xc2rgPauseGame',

		// Requests the game to resume.
		XC_RESUME_GAME: 'xc2rgResumeGame',

		// Requests the game to close, including free all resources and disconnecting from the Server.
		// When completed, the game should notify the Container by calling rg2xcGameReadyForUnload.
		XC_CLOSE_GAME: 'xc2rgCloseGame'
	};

	/**
	 * events which WE(Game Client) send to XC client(PokerStars)
	 */
	const POST_EVENTS = {
		// Notifies the XC Client that the Game Client is ready to receive messages.
		// Before calling this method, the Game Client must ensure it has established listeners for the incoming API messages.
		RG_GAME_LOADER_READY: 'rg2xcGameLoaderReady',

		// Notifies the XC Client that game loading has started.
		RG_PRELOADER_START: 'rg2xcPreloadStart',

		// Notifies the XC Client that game loading progress is updated
		// `percentage`: number 0.0-1.0
		// `localizedText`: string
		RG_PRELOADER_PROGRESS: 'rg2xcPreloaderProgress',

		// Notifies the XC Client that game loading ends.
		RG_PRELOADER_END: 'rg2xcPreloaderEnd',

		// Notifies the XC Client that the game is fully launched and ready to be played, which is the response of xc2rgLaunchGame message
		RG_LAUNCH_GAME_DONE: 'rg2xcLaunchGameDone',

		// Notifies the XC Client that the game result is shown to the player.
		RG_GAME_RESULT_SHOWN: 'rg2xcGameResultShown',

		// Notifies the XC Client that an error has occurred.
		// `error` string length>0 Case sensitive string that is defined in Error Handling.
		// `details` string length>0 Optional, details/reasons of the error that the Game Client provides for investigation purposes.
		RG_ERROR_OCCURED: 'rg2xcErrorOccurred',

		// Notifies the XC Client that the game wager amount has been updated.
		// value number integer>=0 Amount of game wager in current hand, number is in cents.
		RG_GAME_WAGER_UPDATED: 'rg2xcGameWagerUpdated',

		// Notifies the XC Client that the game won amount has been updated.
		// value number integer, >=0 Amount of game won in the current hand, number is in cents.
		RG_GAME_WON_UPDATED: 'rg2xcGameWonUpdated',

		// Notifies the XC Client that the game status has been updated.
		// status string one of the status defined as below:
		// "handStart"
		// "handEnd"
		// "autoPlayStart"
		// "autoPlayEnd"
		RG_GAME_STATUS_UPDATED: 'rg2xcGameStatusUpdated',

		// Notifies the XC Client that properties have been updated in the game.
		// Used for mute/unmute, field `soundEnabled` boolean
		RG_PROPERTIES_UPDATED: 'rg2xcPropertiesUpdated',

		// Notifies the XC Client that the game is paused.
		RG_GAME_PAUSED: 'rg2xcGamePaused',

		// Notifies the XC Client that the game has resumed.
		RG_GAME_RESUMED: 'rg2xcGameResumed',

		// Notifies the XC Client that the game is ready to be unloaded, which is the response of xc2rgCloseGame message.
		// localizedMessage string empty or has string
		RG_GAME_READ_FOR_UNLOAD: 'rg2xcGameReadyForUnload'
	};

	/**
	 * @type {GameController}
	 */
	let gameController;
	let gameId = window.__OPTIONS__.identifier;
	let isGameStarted = false;
	let keysAndValues = {};
	let balance = 0;
	let soundEnabled = false;
	let width = 0;
	let height = 0;

	if (!window.trackGameEventListeners) {
		window.trackGameEventListeners = [];
	}
	window.trackGameEventListeners.push(eventProcessor);

	function eventProcessor(eventName, targetName, context) {
		switch (eventName) {
			case GAME_EVENTS.START_LOADING: {
				gameController = context;

				window.addEventListener('message', onCasinoMessage, false);
				break;
			}
			case GAME_EVENTS.GAME_LOADED: {
				const previousGameId = gameId;
				gameId = targetName;

				if (!isGameStarted || previousGameId !== gameId) {
					isGameStarted = true;
					sendEvent(POST_EVENTS.RG_GAME_LOADER_READY);
				}
				break;
			}

			case GAME_EVENTS.ADJUST_WAGER_AMOUNT: {
				// get value of changed bet from game and sent to XC
				const value = gameController.formatMoneyToNumber(context.bet);
				sendEvent(POST_EVENTS.RG_GAME_WAGER_UPDATED, { value })
			}

			case GAME_EVENTS.ON_BET: {
				// get value of changed bet from game and sent to XC
				const status = 'handStart';
				sendEvent(POST_EVENTS.RG_GAME_STATUS_UPDATED, { status })
			}

			case GAME_EVENTS.ON_MUTE: {
				const soundEnabled = false;
				sendEvent(POST_EVENTS.RG_PROPERTIES_UPDATED, { soundEnabled })
			}

			case GAME_EVENTS.ON_UNMUTE: {
				const soundEnabled = true;
				sendEvent(POST_EVENTS.RG_PROPERTIES_UPDATED, { soundEnabled })
			}
		}
	}

	function sendGameEvent(name) {
		const parentWindow = window.parent || window;

		parentWindow.postMessage({
			name
		}, '*');
	}

	function sendEvent(msgId, body = null) {
		const parentWindow = window.parent || window;

		let payload = { msgId };
		if (body) {
			payload = {
				msgId,
				...body
			}
		}

		parentWindow.postMessage({
			payload
		}, '*');

		if (!window.parent || window.parent === window) {
			console.log('⛩ [POKERSTARS] postMessage', name, body);
		}
	}

	function preloadingGame() {
		sendEvent(POST_EVENTS.RG_PRELOADER_START);
		sendEvent(POST_EVENTS.RG_PRELOADER_PROGRESS, { percentage: 0.15, 'localizedText': 'loading assets...'});
		sendEvent(POST_EVENTS.RG_PRELOADER_END);
	}

	/**
	 * events which WE(Game Client) receiving from XC client(PokerStars)
	 */
	function onCasinoMessage(eventData) {
		if (!gameController || !eventData.data) return;

		let message = eventData.data;
		if (typeof (message) === 'string') {
			try {
				message = JSON.parse(message);
			} catch (e) {
				return;
			}
		}

		switch (message.msgId) {
			case GET_EVENTS.XC_LAUNCH_GAME:
				keysAndValues = message.keysAndValues
				/** Example of keysAndValues
				 * "keysAndValues":{
				 *  "userId":"4-16852454xQA8740981825",
				 *  "rgToken":"000000020900CC410682674242A042A6A526F71375078342A409391b9322847ddb5674da1eea7xQA",
				 *  "siteId":2,
				 *  "hostId":2,
				 *  "platform":1,
				 *  "isNewSession":true,
				 *  "currency":"USD",
				 *  "languageCode":"en",
				 *  "countryCode":"AG",
				 *  "playForFun":true,
				 *  "soundEnabled":true,
				 *  "vendorGameConfig":"SEVENLUCKYDWARFS",
				 *  "showPlayMoneyWithDecimal":true
				 *  }
				 */
				preloadingGame();
				sendEvent(POST_EVENTS.RG_LAUNCH_GAME_DONE);
				break;
			case GET_EVENTS.XC_BALANCE_UPDATED:
				balance = message.balance
				console.log('xc2rg Update balance, update balance of game')
				break;
			case GET_EVENTS.XC_PROPERTIES_UPDATED:
				soundEnabled = message.keysAndValues.soundEnabled;
				console.log('xc2rg Mute/Unmute:', soundEnabled);
				if (soundEnabled === true) {
					sendGameEvent(GAME_POST_EVENTS.UNMUTE)
				} else if (soundEnabled === false) {
					sendGameEvent(GAME_POST_EVENTS.MUTE)
				}
				break;
			case GET_EVENTS.XC_SIZE_CHANGED:
				width = message.width;
				height = message.height;
				console.log('xc2rg Size Changed Width and Height: ', width, height);
				break;
			case GET_EVENTS.XC_SHOW_PAYTABLE:
				console.log('xc2rg Show/Open Pay Table');
				break;
			case GET_EVENTS.XC_ERROR_HANDLED:
				const error = message.error;
				console.log('xc2rg Error Handled: ', error);
				break;
			case GET_EVENTS.XC_PAUSE_GAME:
				const condition = message.condition;
				console.log('xc2rg Pause Game: ', condition);
				break;
			case GET_EVENTS.XC_RESUME_GAME:
				console.log('xc2rg Resume Game');
				break;
			case GET_EVENTS.XC_CLOSE_GAME:
				console.log('xc2rg Close Game');
				break;
		}
	}
})();
