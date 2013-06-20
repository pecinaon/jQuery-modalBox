/**
 * Simple modal window
 * @version 0.6 (beta)
 * @author Pecina Ondřej <pecina.ondrej@gmail.com>
 */
$.fn.modalBox = function(options) {
	var settings = {
		width: 'auto',              // manually set width
		useDataId: false,           // use data-id="idOfModal" for <a href="#" data-id="idOfElement">open modal</a>
		open: true,                 // auto open on load
		appendCloseButton: false,   // add close button automatically
		addScrollTop: false,        // modal hold viewport when are you scrolling
		dismissible: false,         // can click on overlay to close
		singleInstance: false,      // clone original, and on close destroy window
		appendTo: 'body',           // append modal to Element
		boxClass: null,             // special box class
		parentSelector: window,     // parent selector for calculating positions
		verticalFix: 0,             // vertical position fix in pixels
		topPosition: 'auto',        // set top position manually
		animation: 'fade',          // possible values {fade, slideDown, slideRight}
		animationSpeed: 300,        // speed of animation
		onOpen: function(modal){},  // callback called after open
		onClose: function(modal, closedFrom) {}, // callback called on open
		afterOpen: function(modal) {} // callback called when modal is open
	};
	// extend options
	if(typeof options !== 'undefined' && options != null) {
		$.extend(settings, options);
	}

	// create append overlay to DOM
	var $overlay = $('.modal-overlay', settings.appendTo);

	if($overlay.length <= 0) {
		$overlay = $('<div></div>')
			.addClass('modal-overlay')
			.hide();
		$(settings.appendTo).prepend($overlay);
	}

	// PRIVATE METHODS
	/**
	 * Get sizes of hidden element
	 * @param $div
	 * @returns {Number}
	 */
	var getActualSize = function($div, type) {
		if(typeof type === 'undefined' || type == null || type.length <= 0) {
			type = 'width';
		}
		var $el = $($div).clone();
		$el.css('visibility', 'hidden')
			.css('position', 'absolute')
			.css('display', 'block')
			.css('left', 'auto')
			.css('right', 'auto')
			.css('top', 'auto')
			.css('opacity', '1')
			.css('bottom', 'auto')
		;
		$('body').append($el);
		$el.show();

		var height =  parseInt($el.outerHeight());
		var width =  parseInt($el.outerWidth());
		$el.remove();
		return (type == 'height' ? height : width);
	};

	// go throw all elements and create modal boxes
	$(this).each(function() {
		var modalDriver = this;
		var $modalBox = null;

		if(settings.useDataId == false) {
			$modalBox = $(this);
		}
		else {
			$modalBox = $('#' + $(modalDriver).data('id'));
		}

		if(settings.singleInstance) {
			$modalBox = $modalBox.clone();
		}

		if(settings.appendCloseButton) {
			$modalBox.append($('<a></a>')
				.attr('href', '#')
				.attr('data-rel', 'modal-close')
				.text('x')
				.addClass('modal-close')
			);
		}

		var specialClass = $(modalDriver).data('class');
		var $modalDiv = $('<div></div>')
			.css('position', 'absolute')
			.addClass('modal-box');

		if(settings.width !== 'auto') {
			$modalDiv.css('width', settings.width);
		}

		if(typeof specialClass !== 'undefined' && specialClass != null && specialClass.length > 0) {
			$modalDiv.addClass(specialClass);
		}
		if(typeof settings.boxClass !== 'undefined' && settings.boxClass != null && settings.boxClass.length > 0) {
			$modalDiv.addClass(settings.boxClass);
		}

		$modalDiv.append($modalBox);
		$modalDiv.hide();
		$modalBox.show();

		/**
		 * Set position of Modal Div
		 * @param {element} $mDiv
		 * @param {boolean} scrolled
		 */
		var adjustModalPosition = function($mDiv, scrolled) {
			var callback = settings.afterOpen;
			var duration = settings.animationSpeed;
			var boxHeight = getActualSize($mDiv, 'height');

			if(settings.animation === 'fade') {
				duration = 10;
			}
			if(typeof scrolled && scrolled === true) {
				duration = Math.round((duration == 0 ? 300 : duration) / 3);
			}

			// vertical fix of modal div
			if(typeof settings.verticalFix !== 'undefined' && settings.verticalFix != null && settings.verticalFix.length > 0) {
				$mDiv.css('margin-top', settings.verticalFix);
			}

			// calculate left position
			var leftPosition = (Math.round($(settings.parentSelector).width() - getActualSize($mDiv)) / 2) + 'px';

			// TOP position of modal div
			var topPosition = settings.topPosition;

			if(settings.topPosition === 'auto') {
				topPosition = (Math.round((($(settings.parentSelector).height() - boxHeight) / 2)));
				// is enabled scrolling modal?
				if(settings.addScrollTop) {
					topPosition += $(settings.parentSelector).scrollTop();
				}
				topPosition += 'px'
			}

			// set visible
			$mDiv.css('opacity', 1);

			if(settings.animation === 'slideDown' || settings.animation === 'fade')
			{
				$mDiv.css('left', leftPosition);
				$mDiv.animate({top:  topPosition}, duration, function() {
					if(typeof  callback !== 'undefined' && callback != null)
					{
						callback($mDiv);
					}
				});
			}
			else if(settings.animation === 'slideRight')
			{
				$mDiv.css('top', topPosition);
				$mDiv.animate({
					left: leftPosition
				}, duration);
			}

			$overlay.css('height', $(settings.parentSelector).height() + 'px')
				.css('width', $(settings.parentSelector).width() + 'px');
		}

		/**
		 * Function to open modal box
		 * It depend on animation type
		 */
		var openModalBox = function() {
			$modalDiv.css('opacity', 0);
			$modalDiv.show(0, function() {
				// callback
				settings.onOpen($modalDiv);

				$overlay.fadeIn(200);

				if(settings.animation === 'slideDown') {
					adjustModalPosition($(this));
				}
				else if(settings.animation === 'slideRight') {
					adjustModalPosition($(this));
				}
				else {
					$modalDiv.animate({
						opacity: 1
					}, settings.animationSpeed,function() {
						adjustModalPosition($(this));
					});
				}
			});
		};

		// if is integration to link (data-id) then bind click action to open
		if(settings.useDataId) {
			$(modalDriver).click(function(e) {
				e.preventDefault();
				openModalBox();
			});
		}

		// trigger open modal
		if(settings.open == true) {
			openModalBox();
		}

		// change modal position on resize
		$(settings.parentSelector).resize(function() {
			adjustModalPosition($modalDiv);
		});

		// hold dialog always in viewport
		// TODO: Now disabled
		if(settings.addScrollTop) {
			var doit;
			$(settings.parentSelector).scroll(function() {
				clearTimeout(doit);
				doit = setTimeout(function() {
					adjustModalPosition($modalDiv, true);
				}, 10);
			});
		}

		/**
		 * Close modal
		 * @param closeEl - closer element
		 */
		var closedModal = function(closeEl) {
			var closed = function(closeEl) {
				$modalDiv.hide(0);
				$overlay.fadeOut(100, function() {
					settings.onClose($modalDiv, closeEl);
					if(settings.singleInstance) {
						$modalDiv.remove();
					}
				});
			}

			// switch animations
			if(settings.animation === 'slideDown')
			{
				$($modalDiv).animate({
					top: '-1000px'
				}, settings.animationSpeed, function() {
					closed(closeEl);
				});
			}
			else if(settings.animation === 'slideRight')
			{
				$($modalDiv).animate({
					left: '+5000px'
				}, settings.animationSpeed, function() {
					closed(closeEl);
				});
			}
			else {
				$modalDiv.animate({
					opacity: 0
				}, settings.animationSpeed, function() {
					closed(closeEl);
				});
			}
		}

		// find buttons and bind close action
		$('a[data-rel="modal-close"]', $modalDiv).click(function(e) {
			e.preventDefault();
			closedModal(this);
		});

		$(settings.appendTo).append($modalDiv);

		// bind click to overlay to close modal
		if(settings.dismissible) {
			$overlay.on('click',function() {
				closedModal(this);
			});
		}
	});

};