/*
* jQuery UI Multiselect
*
* Authors:
*  Michael Aufreiter (quasipartikel.at)
*  Yanick Rochon (yanick.rochon[at]gmail[dot]com)
* 
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
* 
* http://www.quasipartikel.at/multiselect/
*
* 
* Depends:
*	ui.core.js
*
* Optional:
* localization (http://plugins.jquery.com/project/localisation)
* scrollTo (http://plugins.jquery.com/project/ScrollTo)
* 
* Todo:
*  Make batch actions faster
*  Implement dynamic insertion through remote calls
*/

(function($) {
    $.widget("ui.multiselect", {
        options: {
            searchable: true,
            animated: 'fast',
            show: 'fadeIn',
            hide: 'fadeOut',
            dividerLocation: 0.52,
            nodeComparator: function(node1, node2) {
                var text1 = node1.text(),
			    text2 = node2.text();
                return text1 == text2 ? 0 : (text1 < text2 ? -1 : 1);
            }
        },
        _create: function() {
            this.element.hide();
            this.id = this.element.attr("id");
            this.container = $('<div class="multiselect"></div>').insertAfter(this.element);
            this.container.wrap('<div class="row-fluid"></div>');
            this.count = 0; // number of currently selected options
            this.selectedContainer = $('<div class="selected span6"></div>').appendTo(this.container);
            this.availableContainer = $('<div class="available span6"></div>').appendTo(this.container);
            this.selectedActions = $('<div class="row-fluid"><span class="count">0 ' + $.ui.multiselect.locale.itemsCount + '</span><a href="#" class="remove-all pull-right">' + $.ui.multiselect.locale.removeAll + '</a></div>').appendTo(this.selectedContainer);
            this.availableActions = $('<div class="row-fluid"><input type="text" class="search empty input-medium"/><a href="#" class="add-all pull-right">' + $.ui.multiselect.locale.addAll + '</a></div>').appendTo(this.availableContainer);
            this.selectedList = $('<ul class="selected nav nav-list connected-list"><li class="ui-helper-hidden-accessible"></li></ul>').on('selectstart', function() { return false; }).appendTo(this.selectedContainer);
            this.availableList = $('<ul class="available nav nav-list connected-list"><li class="ui-helper-hidden-accessible"></li></ul>').on('selectstart', function() { return false; }).appendTo(this.availableContainer);

            var that = this;

            if (!this.options.animated) {
                this.options.show = 'show';
                this.options.hide = 'hide';
            }

            // init lists
            this._populateLists(this.element.find('option'));

            // set up livesearch
            if (this.options.searchable) {
                this._registerSearchEvents(this.availableContainer.find('input.search'));
            } else {
                $('.search').hide();
            }

            // batch actions
            this.container.find(".remove-all").click(function() {
                that._populateLists(that.element.find('option').prop('selected', false));
                return false;
            });

            this.container.find(".add-all").click(function() {
                that._populateLists(that.element.find('option').prop('selected', true));
                return false;
            });
        },
        destroy: function() {
            this.element.show();
            this.container.remove();

            $.widget.prototype.destroy.apply(this, arguments);
        },
        _populateLists: function(options) {
            this.selectedList.children('.ui-element').remove();
            this.availableList.children('.ui-element').remove();
            this.count = 0;

            var that = this;
            var items = $(options.map(function(i) {
                var item = that._getOptionNode(this).appendTo(this.selected ? that.selectedList : that.availableList).show();

                if (this.selected) that.count += 1;
                that._applyItemState(item, this.selected);
                item.data('idx', i);
                return item[0];
            }));

            // update count
            this._updateCount();
        },
        _updateCount: function() {
            this.selectedContainer.find('span.count').text(this.count + " " + $.ui.multiselect.locale.itemsCount);
        },
        _getOptionNode: function(option) {
            option = $(option);
            var node = $('<li class="ui-element" title="' + option.text() + '"><a href="#" class="action">' + option.text() + '</a></li>').hide();
            node.data('optionLink', option);
            return node;
        },
        // clones an item with associated data
        // didn't find a smarter away around this
        _cloneWithData: function(clonee) {
            var clone = clonee.clone();
            clone.data('optionLink', clonee.data('optionLink'));
            clone.data('idx', clonee.data('idx'));
            return clone;
        },
        _setSelected: function(item, selected) {
            item.data('optionLink').attr('selected', selected);

            if (selected) {
                var selectedItem = this._cloneWithData(item);
                item[this.options.hide](this.options.animated, function() { $(this).remove(); });
                selectedItem.appendTo(this.selectedList).hide()[this.options.show](this.options.animated);

                this._applyItemState(selectedItem, true);
                return selectedItem;
            } else {

                // look for successor based on initial option index
                var items = this.availableList.find('li'), comparator = this.options.nodeComparator;
                var succ = null, i = item.data('idx'), direction = comparator(item, $(items[i]));

                // TODO: test needed for dynamic list populating
                if (direction) {
                    while (i >= 0 && i < items.length) {
                        direction > 0 ? i++ : i--;
                        if (direction != comparator(item, $(items[i]))) {
                            // going up, go back one item down, otherwise leave as is
                            succ = items[direction > 0 ? i : i + 1];
                            break;
                        }
                    }
                } else {
                    succ = items[i];
                }

                var availableItem = this._cloneWithData(item);
                succ ? availableItem.insertBefore($(succ)) : availableItem.appendTo(this.availableList);
                item[this.options.hide](this.options.animated, function() { $(this).remove(); });
                availableItem.hide()[this.options.show](this.options.animated);

                this._applyItemState(availableItem, false);
                return availableItem;
            }
        },
        _applyItemState: function(item, selected) {
            item.children('span').addClass('ui-helper-hidden');

            if (selected) {
                this._registerRemoveEvents(item.find('a.action'));
            } else {
                this._registerAddEvents(item.find('a.action'));
            }

            this._registerHoverEvents(item);
        },
        // taken from John Resig's liveUpdate script
        _filter: function(list) {
            var input = $(this);
            var rows = list.children('li'),
			cache = rows.map(function() {
			    return $(this).text().toLowerCase();
			});

            var term = $.trim(input.val().toLowerCase()), scores = [];

            if (!term) {
                rows.show();
            } else {
                rows.hide();

                cache.each(function(i) {
                    if (this.indexOf(term) > -1) { scores.push(i); }
                });

                $.each(scores, function() {
                    $(rows[this]).show();
                });
            }
        },
        _registerHoverEvents: function(elements) {
            // TODO: Adicionar eventos para o bootstrap
        },
        _registerAddEvents: function(elements) {
            var that = this;
            elements.click(function() {
                var item = that._setSelected($(this).parent(), true);
                that.count += 1;
                that._updateCount();
                return false;
            });
        },
        _registerRemoveEvents: function(elements) {
            var that = this;
            elements.click(function() {
                that._setSelected($(this).parent(), false);
                that.count -= 1;
                that._updateCount();
                return false;
            });
        },
        _registerSearchEvents: function(input) {
            var that = this;
            input.keypress(function(e) {
                if (e.keyCode == 13)
                    return false;
            })
            .keyup(function() {
                that._filter.apply(this, [that.availableList]);
            });
        }
    });
    $.extend($.ui.multiselect, {
        locale: {
            addAll: 'Adicionar Todos',
            removeAll: 'Remover todos',
            itemsCount: 'item(s) selecionados'
        }
    });
})(jQuery);