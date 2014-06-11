/**
 * Engaged State Toggler
 *
 * Handling engaged states for elements to show if they are engaged or not engaged.
 * Useful for toggled states such as follow/unfollow, favorite/unfavorite etc.
 *
 * To setup galleries after say an AJAX call, you can just call:
 *
 *     $(document).engaged();
 *
 * Released under the MIT License
 * <https://github.com/srtfisher/jquery.engager.js>
 */
(function($) {
  function Engager(object, options) {
    // Store the object
    this.object = object;

    // jQuery Element
    this.element = (object instanceof jQuery) ? object : $(object);
    this.init();
  }

  // 
  // Initialize the Plugin
  // 
  Engager.prototype.init = function() {
    var that = this;

    // Determine the state from the DOM
    this.engaged = (this.element.data('engaged')) ? this.element.data('engaged') : false;

    // On initialize
    this.element.bind('ajax:success', function(event, data) {
      console.log('on ajax:success');
      if (typeof data === 'string') {
        try {
          data = jQuery.parseJSON(data);
        } catch (e) {
          return console.error('Unable to parse response in JSON response for Engager plugin');
        }
      }

      // Ensure it's the proper format for Engager
      if (typeof data.engaged === "undefined") {
        return console.error('Unable to find "engaged" element in response object.');
      }

      // Pass to set state
      return that.setState(data.engaged);
    });
  };

  // 
  // Set the state manually
  // 
  Engager.prototype.setState = function(state) {
    // Ensure a boolean state
    this.engaged = (state === true) ? true : false;

    this.element
      .attr('data-engaged', this.engaged.toString())
      .data('engaged', this.engaged)

      // CSS classes
      .removeClass('element-engaged, element-disengaged')
      .addClass(this.className());

    // Remove the tooltip if any
    tooltip = Foundation.libs.tooltip.getTip(this.element);

    // Remove the tooltip if there is one
    if (tooltip && (this.element.data('engaged-tooltip') || this.element.data('unengaged-tooltip')))
      tooltip.remove();

    if (this.engaged && this.element.data('engaged-tooltip')) {
      this.element.attr('title', this.element.data('engaged-tooltip'));
    } else if (! this.engaged && this.element.data('unengaged-tooltip')) {
      this.element.attr('title', this.element.data('unengaged-tooltip'));
    }

    // Trigger the creation of the tooltip
    this.element.foundation();
  };

  Engager.prototype.engage = function() {
    return this.setState(true);
  };

  Engager.prototype.disengage = function() {
    return this.setState(false);
  };

  // 
  // Toggle the State
  // 
  Engager.prototype.toggle = function() {
    return this.setState(! this.engaged);
  };

  // 
  // Class name for current state
  // 
  Engager.prototype.className = function(state) {
    return (state === true) ? 'element-engaged' : 'element-disengaged';
  };

  $.fn.engager = function(options) {
    // 
    // Callback Function
    // 
    var setupEngager = function(object) {
      // Setup the plugin for each that doesn't have it already setup
      if (undefined === $(object).data('plugin_engager')) {
        $(object).data('plugin_engager', new Engager(object, options));
      }

      // Return the object
      return $(object).data('plugin_engager');
    };

    // If we're applying to the document, we actually want to process
    // the elements inside of it
    if ($(document)[0] === $(this).get(0)) {
      return $(this).find('.engaged-toggle, [data-engaged]').each(function() {
        return setupEngager(this);
      });
    } else {
      // Apply to the element
      if (! this.length)
        return;

      return setupEngager(this);
    }
  };
}(jQuery));

$(function() {
  $(document).engager();
});
