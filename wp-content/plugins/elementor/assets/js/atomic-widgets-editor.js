/*! elementor - v3.28.0 - 01-04-2025 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../assets/dev/js/editor/elements/views/behaviors/sortable.js":
/*!********************************************************************!*\
  !*** ../assets/dev/js/editor/elements/views/behaviors/sortable.js ***!
  \********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../node_modules/@babel/runtime/helpers/defineProperty.js"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2.default)(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var SortableBehavior;

/**
 * @typedef {import('../../../container/container')} Container
 */
SortableBehavior = Marionette.Behavior.extend({
  defaults: {
    elChildType: 'widget'
  },
  events: {
    sortstart: 'onSortStart',
    sortreceive: 'onSortReceive',
    sortupdate: 'onSortUpdate',
    sortover: 'onSortOver',
    sortout: 'onSortOut'
  },
  initialize: function initialize() {
    this.listenTo(elementor.channels.dataEditMode, 'switch', this.onEditModeSwitched).listenTo(this.view.options.model, 'request:sort:start', this.startSort).listenTo(this.view.options.model, 'request:sort:update', this.updateSort).listenTo(this.view.options.model, 'request:sort:receive', this.receiveSort);
  },
  onEditModeSwitched: function onEditModeSwitched(activeMode) {
    this.onToggleSortMode('edit' === activeMode);
  },
  refresh: function refresh() {
    this.onEditModeSwitched(elementor.channels.dataEditMode.request('activeMode'));
  },
  onRender: function onRender() {
    var _this = this;
    this.view.collection.on('update', function () {
      return _this.refresh();
    });
    _.defer(function () {
      return _this.refresh();
    });
  },
  onDestroy: function onDestroy() {
    this.deactivate();
  },
  /**
   * Create an item placeholder in order to avoid UI jumps due to flex.
   *
   * @param {Object}  $element  - jQuery element instance to create placeholder for.
   * @param {string}  className - Placeholder class.
   * @param {boolean} hide      - Whether to hide the original element.
   *
   * @return {void}
   */
  createPlaceholder: function createPlaceholder($element) {
    var className = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var hide = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    // Get the actual item size.
    $element.css('display', '');
    var _$element$ = $element[0],
      width = _$element$.clientWidth,
      height = _$element$.clientHeight;
    if (hide) {
      $element.css('display', 'none');
    }
    jQuery('<div />').css(_objectSpread(_objectSpread({}, $element.css(['flex-basis', 'flex-grow', 'flex-shrink', 'position'])), {}, {
      width: width,
      height: height
    })).addClass(className).insertAfter($element);
  },
  /**
   * Return a settings object for jQuery UI sortable to make it swappable.
   *
   * @return {{stop: Function, start: Function}} options
   */
  getSwappableOptions: function getSwappableOptions() {
    var _this2 = this;
    var $childViewContainer = this.getChildViewContainer(),
      placeholderClass = 'e-swappable--item-placeholder';
    return {
      start: function start(event, ui) {
        $childViewContainer.sortable('refreshPositions');

        // TODO: Find a better solution than this hack.
        // Used in order to prevent dragging a container into itself.
        _this2.createPlaceholder(ui.item, placeholderClass);
      },
      stop: function stop() {
        // Cleanup.
        $childViewContainer.find(".".concat(placeholderClass)).remove();
      }
    };
  },
  onToggleSortMode: function onToggleSortMode(isActive) {
    if (isActive) {
      this.activate();
    } else {
      this.deactivate();
    }
  },
  applySortable: function applySortable() {
    if (!elementor.userCan('design')) {
      return;
    }
    var $childViewContainer = this.getChildViewContainer(),
      defaultSortableOptions = {
        placeholder: 'elementor-sortable-placeholder elementor-' + this.getOption('elChildType') + '-placeholder',
        cursorAt: {
          top: 20,
          left: 25
        },
        helper: this._getSortableHelper.bind(this),
        cancel: 'input, textarea, button, select, option, .elementor-inline-editing, .elementor-tab-title',
        // Fix: Sortable - Unable to drag and drop sections with huge height.
        start: function start() {
          $childViewContainer.sortable('refreshPositions');
        }
      };
    var sortableOptions = _.extend(defaultSortableOptions, this.view.getSortableOptions());

    // Add a swappable behavior (used for flex containers).
    if (this.isSwappable()) {
      $childViewContainer.addClass('e-swappable');
      sortableOptions = _.extend(sortableOptions, this.getSwappableOptions());
    }

    // TODO: Temporary hack for Container.
    //  Will be removed in the future when the Navigator will use React.
    if (sortableOptions.preventInit) {
      return;
    }
    $childViewContainer.sortable(sortableOptions);
  },
  /**
   * Enable sorting for this element, and generate sortable instance for it unless already generated.
   */
  activate: function activate() {
    if (!this.getChildViewContainer().sortable('instance')) {
      // Generate sortable instance for this element. Since fresh instances of sortable already allowing sorting,
      // we can return.
      this.applySortable();
      return;
    }
    this.getChildViewContainer().sortable('enable');
  },
  _getSortableHelper: function _getSortableHelper(event, $item) {
    var model = this.view.collection.get({
      cid: $item.data('model-cid')
    });
    return '<div style="height: 84px; width: 125px;" class="elementor-sortable-helper elementor-sortable-helper-' + model.get('elType') + '"><div class="icon"><i class="' + model.getIcon() + '"></i></div><div class="title-wrapper"><div class="title">' + model.getTitle() + '</div></div></div>';
  },
  getChildViewContainer: function getChildViewContainer() {
    return this.view.getChildViewContainer(this.view);
  },
  // The natural widget index in the column is wrong, since there are other elements
  // at the beginning of the column (background-overlay, element-overlay, resizeable-handle)
  getSortedElementNewIndex: function getSortedElementNewIndex($element) {
    var widgets = Object.values($element.parent().find('> .elementor-element'));
    return widgets.indexOf($element[0]);
  },
  /**
   * Disable sorting of the element unless no sortable instance exists, in which case there is already no option to
   * sort.
   */
  deactivate: function deactivate() {
    var childViewContainer = this.getChildViewContainer();
    if (childViewContainer.sortable('instance')) {
      childViewContainer.sortable('disable');
    }
  },
  /**
   * Determine if the current instance of Sortable is swappable.
   *
   * @return {boolean} is swappable
   */
  isSwappable: function isSwappable() {
    return !!this.view.getSortableOptions().swappable;
  },
  startSort: function startSort(event, ui) {
    event.stopPropagation();
    var container = elementor.getContainer(ui.item.attr('data-id'));
    elementor.channels.data.reply('dragging:model', container.model).reply('dragging:view', container.view).reply('dragging:parent:view', this.view).trigger('drag:start', container.model).trigger(container.model.get('elType') + ':drag:start');
  },
  // On sorting element
  updateSort: function updateSort(ui, newIndex) {
    if (undefined === newIndex) {
      newIndex = ui.item.index();
    }
    var child = elementor.channels.data.request('dragging:view').getContainer();
    this.moveChild(child, newIndex);
  },
  // On receiving element from another container
  receiveSort: function receiveSort(event, ui, newIndex) {
    event.stopPropagation();
    if (this.view.isCollectionFilled()) {
      jQuery(ui.sender).sortable('cancel');
      return;
    }
    var model = elementor.channels.data.request('dragging:model'),
      draggedElType = model.get('elType'),
      draggedIsInnerSection = 'section' === draggedElType && model.get('isInner'),
      targetIsInnerColumn = 'column' === this.view.getElementType() && this.view.isInner();
    if (draggedIsInnerSection && targetIsInnerColumn) {
      jQuery(ui.sender).sortable('cancel');
      return;
    }
    if (undefined === newIndex) {
      newIndex = ui.item.index();
    }
    var child = elementor.channels.data.request('dragging:view').getContainer();
    this.moveChild(child, newIndex);
  },
  onSortStart: function onSortStart(event, ui) {
    if ('column' === this.options.elChildType) {
      var uiData = ui.item.data('sortableItem'),
        uiItems = uiData.items,
        itemHeight = 0;
      uiItems.forEach(function (item) {
        if (item.item[0] === ui.item[0]) {
          itemHeight = item.height;
          return false;
        }
      });
      ui.placeholder.height(itemHeight);
    }
    this.startSort(event, ui);
  },
  onSortOver: function onSortOver(event) {
    event.stopPropagation();
    var model = elementor.channels.data.request('dragging:model');
    jQuery(event.target).addClass('elementor-draggable-over').attr({
      'data-dragged-element': model.get('elType'),
      'data-dragged-is-inner': model.get('isInner')
    });
    this.$el.addClass('elementor-dragging-on-child');
  },
  onSortOut: function onSortOut(event) {
    event.stopPropagation();
    jQuery(event.target).removeClass('elementor-draggable-over').removeAttr('data-dragged-element data-dragged-is-inner');
    this.$el.removeClass('elementor-dragging-on-child');
  },
  onSortReceive: function onSortReceive(event, ui) {
    this.receiveSort(event, ui, this.getSortedElementNewIndex(ui.item));
  },
  onSortUpdate: function onSortUpdate(event, ui) {
    event.stopPropagation();
    if (this.getChildViewContainer()[0] !== ui.item.parent()[0]) {
      return;
    }
    this.updateSort(ui, this.getSortedElementNewIndex(ui.item));
  },
  onAddChild: function onAddChild(view) {
    view.$el.attr('data-model-cid', view.model.cid);
  },
  /**
   * Move a child container to another position.
   *
   * @param {Container}     child - The child container to move.
   * @param {number|string} index - New index.
   *
   * @return {void}
   */
  moveChild: function moveChild(child, index) {
    $e.run('document/elements/move', {
      container: child,
      target: this.view.getContainer(),
      options: {
        at: index
      }
    });
  }
});
module.exports = SortableBehavior;

/***/ }),

/***/ "../assets/dev/js/editor/elements/views/container/empty-component.js":
/*!***************************************************************************!*\
  !*** ../assets/dev/js/editor/elements/views/container/empty-component.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = EmptyComponent;
var _react = _interopRequireDefault(__webpack_require__(/*! react */ "react"));
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
function EmptyComponent() {
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "elementor-first-add"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "elementor-icon eicon-plus",
    onClick: function onClick() {
      return $e.route('panel/elements/categories');
    }
  }));
}

/***/ }),

/***/ "../assets/dev/js/utils/react.js":
/*!***************************************!*\
  !*** ../assets/dev/js/utils/react.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var React = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));
var ReactDOM = _interopRequireWildcard(__webpack_require__(/*! react-dom */ "react-dom"));
var _client = __webpack_require__(/*! react-dom/client */ "../node_modules/react-dom/client.js");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * Support conditional rendering of a React App to the DOM, based on the React version.
 * We use `createRoot` when available, but fallback to `ReactDOM.render` for older versions.
 *
 * @param { React.ReactElement } app        The app to render.
 * @param { HTMLElement }        domElement The DOM element to render the app into.
 *
 * @return {{ unmount: () => void }} The unmount function.
 */
function render(app, domElement) {
  var unmountFunction;
  try {
    var root = (0, _client.createRoot)(domElement);
    root.render(app);
    unmountFunction = function unmountFunction() {
      root.unmount();
    };
  } catch (e) {
    // eslint-disable-next-line react/no-deprecated
    ReactDOM.render(app, domElement);
    unmountFunction = function unmountFunction() {
      // eslint-disable-next-line react/no-deprecated
      ReactDOM.unmountComponentAtNode(domElement);
    };
  }
  return {
    unmount: unmountFunction
  };
}
var _default = exports["default"] = {
  render: render
};

/***/ }),

/***/ "../modules/atomic-widgets/assets/js/editor/atomic-widget-type.js":
/*!************************************************************************!*\
  !*** ../modules/atomic-widgets/assets/js/editor/atomic-widget-type.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.AtomicWidgetType = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _atomicWidgetView = __webpack_require__(/*! ./atomic-widget-view */ "../modules/atomic-widgets/assets/js/editor/atomic-widget-view.js");
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var _type = /*#__PURE__*/new WeakMap();
var AtomicWidgetType = exports.AtomicWidgetType = /*#__PURE__*/function (_elementor$modules$el) {
  function AtomicWidgetType(type) {
    var _this;
    (0, _classCallCheck2.default)(this, AtomicWidgetType);
    _this = _callSuper(this, AtomicWidgetType);
    _classPrivateFieldInitSpec(_this, _type, void 0);
    _classPrivateFieldSet(_type, _this, type);
    return _this;
  }
  (0, _inherits2.default)(AtomicWidgetType, _elementor$modules$el);
  return (0, _createClass2.default)(AtomicWidgetType, [{
    key: "getType",
    value: function getType() {
      return _classPrivateFieldGet(_type, this);
    }
  }, {
    key: "getView",
    value: function getView() {
      return _atomicWidgetView.AtomicWidgetView;
    }
  }]);
}(elementor.modules.elements.types.Widget);

/***/ }),

/***/ "../modules/atomic-widgets/assets/js/editor/atomic-widget-view.js":
/*!************************************************************************!*\
  !*** ../modules/atomic-widgets/assets/js/editor/atomic-widget-view.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.AtomicWidgetView = void 0;
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../node_modules/@babel/runtime/helpers/defineProperty.js"));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _get2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/get */ "../node_modules/@babel/runtime/helpers/get.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2.default)(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = (0, _get2.default)((0, _getPrototypeOf2.default)(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var _AtomicWidgetView_brand = /*#__PURE__*/new WeakSet();
var AtomicWidgetView = exports.AtomicWidgetView = /*#__PURE__*/function (_elementor$modules$el) {
  function AtomicWidgetView() {
    var _this;
    (0, _classCallCheck2.default)(this, AtomicWidgetView);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, AtomicWidgetView, [].concat(args));
    _classPrivateMethodInitSpec(_this, _AtomicWidgetView_brand);
    return _this;
  }
  (0, _inherits2.default)(AtomicWidgetView, _elementor$modules$el);
  return (0, _createClass2.default)(AtomicWidgetView, [{
    key: "onRender",
    value:
    // Dispatch `render` event so the overlay layer will be updated
    function onRender() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      _superPropGet(AtomicWidgetView, "onRender", this, 3)(args);
      _assertClassBrand(_AtomicWidgetView_brand, this, _dispatchEvent).call(this, 'elementor/preview/atomic-widget/render');
    }

    // Dispatch `destroy` event so the overlay layer will be updated
  }, {
    key: "onDestroy",
    value: function onDestroy() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      _superPropGet(AtomicWidgetView, "onDestroy", this, 3)(args);
      _assertClassBrand(_AtomicWidgetView_brand, this, _dispatchEvent).call(this, 'elementor/preview/atomic-widget/destroy');
    }

    // Removes behaviors that are not needed for atomic widgets (that are implemented in the overlay layer).
  }, {
    key: "behaviors",
    value: function behaviors() {
      var disabledBehaviors = ['InlineEditing', 'Draggable', 'Resizable'];
      var behaviorsAsEntries = Object.entries(_superPropGet(AtomicWidgetView, "behaviors", this, 3)([])).filter(function (_ref) {
        var _ref2 = (0, _slicedToArray2.default)(_ref, 1),
          key = _ref2[0];
        return !disabledBehaviors.includes(key);
      });
      return Object.fromEntries(behaviorsAsEntries);
    }

    // Change the drag handle because the $el is not the draggable element (`display: contents`).
  }, {
    key: "getDraggableElement",
    value: function getDraggableElement() {
      return this.$el.find(':first-child');
    }

    // Remove the overlay, so we can use the new overlay layer.
  }, {
    key: "getHandlesOverlay",
    value: function getHandlesOverlay() {
      return null;
    }
  }, {
    key: "attributes",
    value: function attributes() {
      return _objectSpread(_objectSpread({}, _superPropGet(AtomicWidgetView, "attributes", this, 3)([])), {}, {
        // Mark the widget as atomic, so the overlay layer can identify it.
        'data-atomic': '',
        // Make the wrapper non-existent in terms of CSS to mimic the frontend DOM tree.
        style: 'display: contents !important;'
      });
    }
  }]);
}(elementor.modules.elements.views.Widget);
function _dispatchEvent(type) {
  window.top.dispatchEvent(new CustomEvent(type, {
    detail: {
      id: this.model.get('id')
    }
  }));
}

/***/ }),

/***/ "../modules/atomic-widgets/assets/js/editor/component.js":
/*!***************************************************************!*\
  !*** ../modules/atomic-widgets/assets/js/editor/component.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var hooks = _interopRequireWildcard(__webpack_require__(/*! ./hooks */ "../modules/atomic-widgets/assets/js/editor/hooks/index.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var Component = exports["default"] = /*#__PURE__*/function (_$e$modules$Component) {
  function Component() {
    (0, _classCallCheck2.default)(this, Component);
    return _callSuper(this, Component, arguments);
  }
  (0, _inherits2.default)(Component, _$e$modules$Component);
  return (0, _createClass2.default)(Component, [{
    key: "getNamespace",
    value: function getNamespace() {
      return 'document/atomic-widgets';
    }
  }, {
    key: "defaultHooks",
    value: function defaultHooks() {
      return this.importHooks(hooks);
    }
  }]);
}($e.modules.ComponentBase);

/***/ }),

/***/ "../modules/atomic-widgets/assets/js/editor/container/div-block-empty-view.js":
/*!************************************************************************************!*\
  !*** ../modules/atomic-widgets/assets/js/editor/container/div-block-empty-view.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _react = _interopRequireDefault(__webpack_require__(/*! react */ "react"));
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../node_modules/@babel/runtime/helpers/defineProperty.js"));
var _react2 = _interopRequireDefault(__webpack_require__(/*! elementor-utils/react */ "../assets/dev/js/utils/react.js"));
var _emptyComponent = _interopRequireDefault(__webpack_require__(/*! elementor-elements/views/container/empty-component */ "../assets/dev/js/editor/elements/views/container/empty-component.js"));
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var DivBlockEmptyView = exports["default"] = /*#__PURE__*/function (_Marionette$ItemView) {
  function DivBlockEmptyView() {
    var _this;
    (0, _classCallCheck2.default)(this, DivBlockEmptyView);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, DivBlockEmptyView, [].concat(args));
    (0, _defineProperty2.default)(_this, "template", '<div></div>');
    (0, _defineProperty2.default)(_this, "className", 'elementor-empty-view');
    return _this;
  }
  (0, _inherits2.default)(DivBlockEmptyView, _Marionette$ItemView);
  return (0, _createClass2.default)(DivBlockEmptyView, [{
    key: "renderReactDefaultElement",
    value: function renderReactDefaultElement(container) {
      var _ReactUtils$render = _react2.default.render(/*#__PURE__*/_react.default.createElement(_emptyComponent.default, {
          container: container
        }), this.el),
        unmount = _ReactUtils$render.unmount;
      this.unmount = unmount;
    }
  }, {
    key: "onRender",
    value: function onRender() {
      this.$el.addClass(this.className);
      this.renderReactDefaultElement();
    }
  }, {
    key: "onDestroy",
    value: function onDestroy() {
      this.unmount();
    }
  }]);
}(Marionette.ItemView);

/***/ }),

/***/ "../modules/atomic-widgets/assets/js/editor/div-block-model.js":
/*!*********************************************************************!*\
  !*** ../modules/atomic-widgets/assets/js/editor/div-block-model.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var AtomicContainer = exports["default"] = /*#__PURE__*/function (_elementor$modules$el) {
  function AtomicContainer() {
    (0, _classCallCheck2.default)(this, AtomicContainer);
    return _callSuper(this, AtomicContainer, arguments);
  }
  (0, _inherits2.default)(AtomicContainer, _elementor$modules$el);
  return (0, _createClass2.default)(AtomicContainer, [{
    key: "isValidChild",
    value:
    /**
     * Do not allow section, column or container be placed in the Atomic container.
     *
     * @param {*} childModel
     */
    function isValidChild(childModel) {
      var elType = childModel.get('elType');
      return 'section' !== elType && 'column' !== elType && 'container' !== elType;
    }
  }]);
}(elementor.modules.elements.models.Element);

/***/ }),

/***/ "../modules/atomic-widgets/assets/js/editor/div-block-type.js":
/*!********************************************************************!*\
  !*** ../modules/atomic-widgets/assets/js/editor/div-block-type.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _emptyComponent = _interopRequireDefault(__webpack_require__(/*! elementor-elements/views/container/empty-component */ "../assets/dev/js/editor/elements/views/container/empty-component.js"));
var _divBlockModel = _interopRequireDefault(__webpack_require__(/*! ./div-block-model */ "../modules/atomic-widgets/assets/js/editor/div-block-model.js"));
var _divBlockView = _interopRequireDefault(__webpack_require__(/*! ./div-block-view */ "../modules/atomic-widgets/assets/js/editor/div-block-view.js"));
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var AtomicContainer = exports["default"] = /*#__PURE__*/function (_elementor$modules$el) {
  function AtomicContainer() {
    (0, _classCallCheck2.default)(this, AtomicContainer);
    return _callSuper(this, AtomicContainer, arguments);
  }
  (0, _inherits2.default)(AtomicContainer, _elementor$modules$el);
  return (0, _createClass2.default)(AtomicContainer, [{
    key: "getType",
    value: function getType() {
      return 'div-block';
    }
  }, {
    key: "getView",
    value: function getView() {
      return _divBlockView.default;
    }
  }, {
    key: "getEmptyView",
    value: function getEmptyView() {
      return _emptyComponent.default;
    }
  }, {
    key: "getModel",
    value: function getModel() {
      return _divBlockModel.default;
    }
  }]);
}(elementor.modules.elements.types.Base);

/***/ }),

/***/ "../modules/atomic-widgets/assets/js/editor/div-block-view.js":
/*!********************************************************************!*\
  !*** ../modules/atomic-widgets/assets/js/editor/div-block-view.js ***!
  \********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var sprintf = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n")["sprintf"];
/* provided dependency */ var __ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n")["__"];


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "../node_modules/@babel/runtime/helpers/toConsumableArray.js"));
var _divBlockEmptyView = _interopRequireDefault(__webpack_require__(/*! ./container/div-block-empty-view */ "../modules/atomic-widgets/assets/js/editor/container/div-block-empty-view.js"));
var BaseElementView = elementor.modules.elements.views.BaseElement;
var DivBlockView = BaseElementView.extend({
  template: Marionette.TemplateCache.get('#tmpl-elementor-div-block-content'),
  emptyView: _divBlockEmptyView.default,
  tagName: function tagName() {
    return this.model.getSetting('tag') || 'div';
  },
  getChildViewContainer: function getChildViewContainer() {
    this.childViewContainer = '';
    return Marionette.CompositeView.prototype.getChildViewContainer.apply(this, arguments);
  },
  className: function className() {
    return "".concat(BaseElementView.prototype.className.apply(this), " e-con e-div-block").concat(this.getClassString());
  },
  // TODO: Copied from `views/column.js`.
  ui: function ui() {
    var ui = BaseElementView.prototype.ui.apply(this, arguments);
    ui.percentsTooltip = '> .elementor-element-overlay .elementor-column-percents-tooltip';
    return ui;
  },
  // TODO: Copied from `views/column.js`.
  attachElContent: function attachElContent() {
    BaseElementView.prototype.attachElContent.apply(this, arguments);
    var $tooltip = jQuery('<div>', {
      class: 'elementor-column-percents-tooltip',
      'data-side': elementorCommon.config.isRTL ? 'right' : 'left'
    });
    this.$el.children('.elementor-element-overlay').append($tooltip);
  },
  // TODO: Copied from `views/column.js`.
  getPercentSize: function getPercentSize(size) {
    if (!size) {
      size = this.el.getBoundingClientRect().width;
    }
    return +(size / this.$el.parent().width() * 100).toFixed(3);
  },
  // TODO: Copied from `views/column.js`.
  getPercentsForDisplay: function getPercentsForDisplay() {
    var width = +this.model.getSetting('width') || this.getPercentSize();
    return width.toFixed(1) + '%';
  },
  renderOnChange: function renderOnChange(settings) {
    var changed = settings.changedAttributes();
    if (!changed) {
      return;
    }
    BaseElementView.prototype.renderOnChange.apply(this, settings);
    if (changed.classes) {
      // Rebuild the whole class attribute to remove previous outdated classes
      this.$el.attr('class', this.className());
      return;
    }
    this.$el.addClass(this.getClasses());
  },
  onRender: function onRender() {
    var _this = this;
    BaseElementView.prototype.onRender.apply(this, arguments);

    // Defer to wait for everything to render.
    setTimeout(function () {
      _this.droppableInitialize();
    });
  },
  droppableInitialize: function droppableInitialize() {
    this.$el.html5Droppable(this.getDroppableOptions());
  },
  isDroppingAllowed: function isDroppingAllowed() {
    return true;
  },
  behaviors: function behaviors() {
    var behaviors = BaseElementView.prototype.behaviors.apply(this, arguments);
    _.extend(behaviors, {
      Sortable: {
        behaviorClass: __webpack_require__(/*! elementor-behaviors/sortable */ "../assets/dev/js/editor/elements/views/behaviors/sortable.js"),
        elChildType: 'widget'
      }
    });
    return elementor.hooks.applyFilters('elements/div-block/behaviors', behaviors, this);
  },
  /**
   * @return {{}} options
   */
  getSortableOptions: function getSortableOptions() {
    return {
      preventInit: true
    };
  },
  getDroppableAxis: function getDroppableAxis() {
    if (this.isHorizontalAxis()) {
      return 'horizontal';
    }
    return 'vertical';
  },
  isHorizontalAxis: function isHorizontalAxis() {
    var styles = window.getComputedStyle(this.$el[0]);
    return 'flex' === styles.display && ['row', 'row-reverse'].includes(styles.flexDirection);
  },
  getDroppableOptions: function getDroppableOptions() {
    var _this2 = this;
    var items = '> .elementor-element, > .elementor-empty-view .elementor-first-add';
    var $placeholder;
    return {
      axis: this.getDroppableAxis(),
      items: items,
      groups: ['elementor-element'],
      horizontalThreshold: 5,
      isDroppingAllowed: this.isDroppingAllowed.bind(this),
      currentElementClass: 'elementor-html5dnd-current-element',
      placeholderClass: 'elementor-sortable-placeholder elementor-widget-placeholder',
      hasDraggingOnChildClass: 'e-dragging-over',
      getDropContainer: function getDropContainer() {
        return _this2.getContainer();
      },
      onDropping: function onDropping(side, event) {
        event.stopPropagation();

        // Triggering drag end manually, since it won't fired above iframe
        elementor.getPreviewView().onPanelElementDragEnd();
        var draggedView = elementor.channels.editor.request('element:dragged'),
          draggingInSameParent = (draggedView === null || draggedView === void 0 ? void 0 : draggedView.parent) === _this2,
          containerSelector = event.currentTarget.parentElement;
        var $elements = jQuery(containerSelector).find('> .elementor-element');

        // Exclude the dragged element from the indexing calculations.
        if (draggingInSameParent) {
          $elements = $elements.not(draggedView.$el);
        }
        var widgetsArray = Object.values($elements);
        var newIndex = widgetsArray.indexOf(event.currentTarget);

        // Plus one in order to insert it after the current target element.
        if (_this2.shouldIncrementIndex(side)) {
          newIndex++;
        }

        // User is sorting inside a Container.
        if (draggedView) {
          // Prevent the user from dragging a parent container into its own child container
          var draggedId = draggedView.getContainer().id;
          var currentTargetParentContainer = _this2.container;
          while (currentTargetParentContainer) {
            if (currentTargetParentContainer.id === draggedId) {
              return;
            }
            currentTargetParentContainer = currentTargetParentContainer.parent;
          }

          // Reset the dragged element cache.
          elementor.channels.editor.reply('element:dragged', null);
          $e.run('document/elements/move', {
            container: draggedView.getContainer(),
            target: _this2.getContainer(),
            options: {
              at: newIndex
            }
          });
          return;
        }

        // User is dragging an element from the panel.
        _this2.onDrop(event, {
          at: newIndex
        });
      },
      onDragging: function onDragging(side, event) {
        if (!$placeholder) {
          $placeholder = _this2.$el.find('.elementor-sortable-placeholder');
        }
        if (!$placeholder.length) {
          return;
        }
        var currentTarget = event.currentTarget,
          currentTargetHeight = currentTarget.getBoundingClientRect().height,
          placeholderElement = $placeholder[0],
          isNotBeforeSibling = currentTarget !== placeholderElement.previousElementSibling;
        if ('horizontal' === _this2.getDroppableAxis()) {
          if (isNotBeforeSibling) {
            _this2.handleDropSide(side, placeholderElement, currentTarget);
          }
          _this2.maybeShowCustomDropPlaceholder($placeholder, currentTargetHeight);
        } else {
          $placeholder.removeAttr('style');
        }
      }
    };
  },
  handleDropSide: function handleDropSide(side, placeholderElement, currentTarget) {
    var insertMethod = ['top', 'left'].includes(side) ? 'before' : 'after';
    currentTarget[insertMethod](placeholderElement);
  },
  maybeShowCustomDropPlaceholder: function maybeShowCustomDropPlaceholder($placeholder, currentTargetHeight) {
    if ($placeholder.css('height') !== "".concat(currentTargetHeight, "px")) {
      $placeholder.css({
        display: 'block',
        height: "".concat(currentTargetHeight, "px"),
        'background-color': '#eb8efb',
        width: '10px'
      });
    }
  },
  getEditButtons: function getEditButtons() {
    var elementData = elementor.getElementData(this.model),
      editTools = {};
    if ($e.components.get('document/elements').utils.allowAddingWidgets()) {
      editTools.add = {
        /* Translators: %s: Element Name. */
        title: sprintf(__('Add %s', 'elementor'), elementData.title),
        icon: 'plus'
      };
      editTools.edit = {
        /* Translators: %s: Element Name. */
        title: sprintf(__('Edit %s', 'elementor'), elementData.title),
        icon: 'handle'
      };
    }
    if (!this.getContainer().isLocked()) {
      if (elementor.getPreferences('edit_buttons') && $e.components.get('document/elements').utils.allowAddingWidgets()) {
        editTools.duplicate = {
          /* Translators: %s: Element Name. */
          title: sprintf(__('Duplicate %s', 'elementor'), elementData.title),
          icon: 'clone'
        };
      }
      editTools.remove = {
        /* Translators: %s: Element Name. */
        title: sprintf(__('Delete %s', 'elementor'), elementData.title),
        icon: 'close'
      };
    }
    return editTools;
  },
  shouldIncrementIndex: function shouldIncrementIndex(side) {
    if (!this.draggingOnBottomOrRightSide(side)) {
      return false;
    }
    return !this.emptyViewIsCurrentlyBeingDraggedOver();
  },
  draggingOnBottomOrRightSide: function draggingOnBottomOrRightSide(side) {
    return ['bottom', 'right'].includes(side);
  },
  emptyViewIsCurrentlyBeingDraggedOver: function emptyViewIsCurrentlyBeingDraggedOver() {
    return this.$el.find('> .elementor-empty-view > .elementor-first-add.elementor-html5dnd-current-element').length > 0;
  },
  /**
   * Toggle the `New Section` view when clicking the `add` button in the edit tools.
   *
   * @return {void}
   */
  onAddButtonClick: function onAddButtonClick() {
    if (this.addSectionView && !this.addSectionView.isDestroyed) {
      this.addSectionView.fadeToDeath();
      return;
    }
    var addSectionView = new elementor.modules.elements.components.AddSectionView({
      at: this.model.collection.indexOf(this.model)
    });
    addSectionView.render();
    this.$el.before(addSectionView.$el);
    addSectionView.$el.hide();

    // Delaying the slide down for slow-render browsers (such as FF)
    setTimeout(function () {
      addSectionView.$el.slideDown(null, function () {
        // Remove inline style, for preview mode.
        jQuery(this).css('display', '');
      });
    });
    this.addSectionView = addSectionView;
  },
  getClasses: function getClasses() {
    var _this$options;
    return ((_this$options = this.options) === null || _this$options === void 0 || (_this$options = _this$options.model) === null || _this$options === void 0 || (_this$options = _this$options.getSetting('classes')) === null || _this$options === void 0 ? void 0 : _this$options.value) || [];
  },
  getClassString: function getClassString() {
    var classes = this.getClasses();
    return classes.length ? [''].concat((0, _toConsumableArray2.default)(classes)).join(' ') : '';
  }
});
module.exports = DivBlockView;

/***/ }),

/***/ "../modules/atomic-widgets/assets/js/editor/hooks/data/regenerate-local-style-ids/create-element.js":
/*!**********************************************************************************************************!*\
  !*** ../modules/atomic-widgets/assets/js/editor/hooks/data/regenerate-local-style-ids/create-element.js ***!
  \**********************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.CreateElementHook = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _regenerateLocalStyleIds = __webpack_require__(/*! ../../../utils/regenerate-local-style-ids */ "../modules/atomic-widgets/assets/js/editor/utils/regenerate-local-style-ids.js");
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var CreateElementHook = exports.CreateElementHook = /*#__PURE__*/function (_$e$modules$hookData$) {
  function CreateElementHook() {
    (0, _classCallCheck2.default)(this, CreateElementHook);
    return _callSuper(this, CreateElementHook, arguments);
  }
  (0, _inherits2.default)(CreateElementHook, _$e$modules$hookData$);
  return (0, _createClass2.default)(CreateElementHook, [{
    key: "getCommand",
    value: function getCommand() {
      return 'document/elements/create';
    }
  }, {
    key: "getId",
    value: function getId() {
      return 'regenerate-local-style-ids--document/elements/duplicate';
    }
  }, {
    key: "apply",
    value: function apply(args, result) {
      var containers = Array.isArray(result) ? result : [result];
      containers.forEach(_regenerateLocalStyleIds.regenerateLocalStyleIds);
    }
  }]);
}($e.modules.hookData.After);
var _default = exports["default"] = CreateElementHook;

/***/ }),

/***/ "../modules/atomic-widgets/assets/js/editor/hooks/index.js":
/*!*****************************************************************!*\
  !*** ../modules/atomic-widgets/assets/js/editor/hooks/index.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "CreateElementHook", ({
  enumerable: true,
  get: function get() {
    return _createElement.CreateElementHook;
  }
}));
var _createElement = __webpack_require__(/*! ./data/regenerate-local-style-ids/create-element */ "../modules/atomic-widgets/assets/js/editor/hooks/data/regenerate-local-style-ids/create-element.js");

/***/ }),

/***/ "../modules/atomic-widgets/assets/js/editor/utils/get-element-children.js":
/*!********************************************************************************!*\
  !*** ../modules/atomic-widgets/assets/js/editor/utils/get-element-children.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.getElementChildren = getElementChildren;
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "../node_modules/@babel/runtime/helpers/toConsumableArray.js"));
/**
 * @typedef {import('assets/dev/js/editor/container/container')} Container
 */

/**
 * return all recursively nested elements in a flat array
 * @param {Container} model
 * @return {Container[]}
 */
function getElementChildren(model) {
  var _flatMap, _container$model$get$, _container$model;
  var container = window.elementor.getContainer(model.id);
  var children = (_flatMap = ((_container$model$get$ = (_container$model = container.model) === null || _container$model === void 0 || (_container$model = _container$model.get('elements')) === null || _container$model === void 0 ? void 0 : _container$model.models) !== null && _container$model$get$ !== void 0 ? _container$model$get$ : []).flatMap(function (child) {
    return getElementChildren(child);
  })) !== null && _flatMap !== void 0 ? _flatMap : [];
  return [container].concat((0, _toConsumableArray2.default)(children));
}

/***/ }),

/***/ "../modules/atomic-widgets/assets/js/editor/utils/get-random-style-id.js":
/*!*******************************************************************************!*\
  !*** ../modules/atomic-widgets/assets/js/editor/utils/get-random-style-id.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.getRandomStyleId = getRandomStyleId;
/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */

/**
 * @param {Container} container
 * @param {Object}    existingStyleIds
 * @return {string}
 */
function getRandomStyleId(container) {
  var existingStyleIds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var id;
  do {
    id = "e-".concat(container.id, "-").concat(elementorCommon.helpers.getUniqueId());
  } while (existingStyleIds.hasOwnProperty(id));
  return id;
}

/***/ }),

/***/ "../modules/atomic-widgets/assets/js/editor/utils/regenerate-local-style-ids.js":
/*!**************************************************************************************!*\
  !*** ../modules/atomic-widgets/assets/js/editor/utils/regenerate-local-style-ids.js ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.regenerateLocalStyleIds = regenerateLocalStyleIds;
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../node_modules/@babel/runtime/helpers/defineProperty.js"));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _getElementChildren = __webpack_require__(/*! ./get-element-children */ "../modules/atomic-widgets/assets/js/editor/utils/get-element-children.js");
var _getRandomStyleId = __webpack_require__(/*! ./get-random-style-id */ "../modules/atomic-widgets/assets/js/editor/utils/get-random-style-id.js");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2.default)(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/**
 * @typedef {import('assets/dev/js/editor/container/container')} Container
 */

function isClassesProp(prop) {
  return prop.$$type && 'classes' === prop.$$type && Array.isArray(prop.value) && prop.value.length > 0;
}

/**
 * Update the style id of the container.
 * @param {Container} container
 */
function updateStyleId(container) {
  var _container$settings$t, _container$settings;
  var originalStyles = container.model.get('styles');
  var settings = (_container$settings$t = (_container$settings = container.settings) === null || _container$settings === void 0 ? void 0 : _container$settings.toJSON()) !== null && _container$settings$t !== void 0 ? _container$settings$t : {};
  var classesProps = Object.entries(settings).filter(function (_ref) {
    var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
      propValue = _ref2[1];
    return isClassesProp(propValue);
  });
  var newStyles = {};
  var changedIds = {}; // Conversion map - {[originalId: string]: newId: string}

  Object.entries(originalStyles).forEach(function (_ref3) {
    var _ref4 = (0, _slicedToArray2.default)(_ref3, 2),
      originalStyleId = _ref4[0],
      style = _ref4[1];
    var newStyleId = (0, _getRandomStyleId.getRandomStyleId)(container, newStyles);
    newStyles[newStyleId] = structuredClone(_objectSpread(_objectSpread({}, style), {}, {
      id: newStyleId
    }));
    changedIds[originalStyleId] = newStyleId;
  });
  var newClassesProps = classesProps.map(function (_ref5) {
    var _ref6 = (0, _slicedToArray2.default)(_ref5, 2),
      key = _ref6[0],
      value = _ref6[1];
    return [key, _objectSpread(_objectSpread({}, value), {}, {
      value: value.value.map(function (className) {
        var _changedIds$className;
        return (_changedIds$className = changedIds[className]) !== null && _changedIds$className !== void 0 ? _changedIds$className : className;
      })
    })];
  }, {});

  // Update classes array
  $e.internal('document/elements/set-settings', {
    container: container,
    settings: Object.fromEntries(newClassesProps)
  });

  // Update local styles
  container.model.set('styles', newStyles);
}

/**
 * Get a container - iterate over its children, find all styled atomic widgets and update their style ids
 * @param {Container} container
 */
function regenerateLocalStyleIds(container) {
  var allElements = (0, _getElementChildren.getElementChildren)(container);
  var styledElements = allElements.filter(function (element) {
    var _element$model$get;
    return Object.keys((_element$model$get = element.model.get('styles')) !== null && _element$model$get !== void 0 ? _element$model$get : {}).length > 0;
  });
  styledElements === null || styledElements === void 0 || styledElements.forEach(updateStyleId);
}

/***/ }),

/***/ "../node_modules/react-dom/client.js":
/*!*******************************************!*\
  !*** ../node_modules/react-dom/client.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var m = __webpack_require__(/*! react-dom */ "react-dom");
if (false) {} else {
  var i = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  exports.createRoot = function(c, o) {
    i.usingClientEntryPoint = true;
    try {
      return m.createRoot(c, o);
    } finally {
      i.usingClientEntryPoint = false;
    }
  };
  exports.hydrateRoot = function(c, h, o) {
    i.usingClientEntryPoint = true;
    try {
      return m.hydrateRoot(c, h, o);
    } finally {
      i.usingClientEntryPoint = false;
    }
  };
}


/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = React;

/***/ }),

/***/ "react-dom":
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = ReactDOM;

/***/ }),

/***/ "@wordpress/i18n":
/*!**************************!*\
  !*** external "wp.i18n" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = wp.i18n;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/arrayLikeToArray.js":
/*!******************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/arrayLikeToArray.js ***!
  \******************************************************************/
/***/ ((module) => {

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
module.exports = _arrayLikeToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/arrayWithHoles.js":
/*!****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/arrayWithHoles.js ***!
  \****************************************************************/
/***/ ((module) => {

function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
module.exports = _arrayWithHoles, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/arrayWithoutHoles.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/arrayWithoutHoles.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayLikeToArray = __webpack_require__(/*! ./arrayLikeToArray.js */ "../node_modules/@babel/runtime/helpers/arrayLikeToArray.js");
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return arrayLikeToArray(r);
}
module.exports = _arrayWithoutHoles, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/assertThisInitialized.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/assertThisInitialized.js ***!
  \***********************************************************************/
/***/ ((module) => {

function _assertThisInitialized(e) {
  if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}
module.exports = _assertThisInitialized, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/classCallCheck.js":
/*!****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/classCallCheck.js ***!
  \****************************************************************/
/***/ ((module) => {

function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
module.exports = _classCallCheck, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/createClass.js":
/*!*************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/createClass.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toPropertyKey = __webpack_require__(/*! ./toPropertyKey.js */ "../node_modules/@babel/runtime/helpers/toPropertyKey.js");
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}
module.exports = _createClass, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/defineProperty.js":
/*!****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/defineProperty.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toPropertyKey = __webpack_require__(/*! ./toPropertyKey.js */ "../node_modules/@babel/runtime/helpers/toPropertyKey.js");
function _defineProperty(e, r, t) {
  return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/get.js":
/*!*****************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/get.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var superPropBase = __webpack_require__(/*! ./superPropBase.js */ "../node_modules/@babel/runtime/helpers/superPropBase.js");
function _get() {
  return module.exports = _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) {
    var p = superPropBase(e, t);
    if (p) {
      var n = Object.getOwnPropertyDescriptor(p, t);
      return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value;
    }
  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _get.apply(null, arguments);
}
module.exports = _get, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js":
/*!****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/getPrototypeOf.js ***!
  \****************************************************************/
/***/ ((module) => {

function _getPrototypeOf(t) {
  return module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _getPrototypeOf(t);
}
module.exports = _getPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/inherits.js":
/*!**********************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/inherits.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var setPrototypeOf = __webpack_require__(/*! ./setPrototypeOf.js */ "../node_modules/@babel/runtime/helpers/setPrototypeOf.js");
function _inherits(t, e) {
  if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
  t.prototype = Object.create(e && e.prototype, {
    constructor: {
      value: t,
      writable: !0,
      configurable: !0
    }
  }), Object.defineProperty(t, "prototype", {
    writable: !1
  }), e && setPrototypeOf(t, e);
}
module.exports = _inherits, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/interopRequireDefault.js ***!
  \***********************************************************************/
/***/ ((module) => {

function _interopRequireDefault(e) {
  return e && e.__esModule ? e : {
    "default": e
  };
}
module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/iterableToArray.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/iterableToArray.js ***!
  \*****************************************************************/
/***/ ((module) => {

function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
module.exports = _iterableToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/iterableToArrayLimit.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/iterableToArrayLimit.js ***!
  \**********************************************************************/
/***/ ((module) => {

function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
module.exports = _iterableToArrayLimit, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/nonIterableRest.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/nonIterableRest.js ***!
  \*****************************************************************/
/***/ ((module) => {

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
module.exports = _nonIterableRest, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/nonIterableSpread.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/nonIterableSpread.js ***!
  \*******************************************************************/
/***/ ((module) => {

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
module.exports = _nonIterableSpread, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js ***!
  \***************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(/*! ./typeof.js */ "../node_modules/@babel/runtime/helpers/typeof.js")["default"]);
var assertThisInitialized = __webpack_require__(/*! ./assertThisInitialized.js */ "../node_modules/@babel/runtime/helpers/assertThisInitialized.js");
function _possibleConstructorReturn(t, e) {
  if (e && ("object" == _typeof(e) || "function" == typeof e)) return e;
  if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
  return assertThisInitialized(t);
}
module.exports = _possibleConstructorReturn, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/setPrototypeOf.js":
/*!****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/setPrototypeOf.js ***!
  \****************************************************************/
/***/ ((module) => {

function _setPrototypeOf(t, e) {
  return module.exports = _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
    return t.__proto__ = e, t;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _setPrototypeOf(t, e);
}
module.exports = _setPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/slicedToArray.js":
/*!***************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/slicedToArray.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayWithHoles = __webpack_require__(/*! ./arrayWithHoles.js */ "../node_modules/@babel/runtime/helpers/arrayWithHoles.js");
var iterableToArrayLimit = __webpack_require__(/*! ./iterableToArrayLimit.js */ "../node_modules/@babel/runtime/helpers/iterableToArrayLimit.js");
var unsupportedIterableToArray = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "../node_modules/@babel/runtime/helpers/unsupportedIterableToArray.js");
var nonIterableRest = __webpack_require__(/*! ./nonIterableRest.js */ "../node_modules/@babel/runtime/helpers/nonIterableRest.js");
function _slicedToArray(r, e) {
  return arrayWithHoles(r) || iterableToArrayLimit(r, e) || unsupportedIterableToArray(r, e) || nonIterableRest();
}
module.exports = _slicedToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/superPropBase.js":
/*!***************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/superPropBase.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getPrototypeOf = __webpack_require__(/*! ./getPrototypeOf.js */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js");
function _superPropBase(t, o) {
  for (; !{}.hasOwnProperty.call(t, o) && null !== (t = getPrototypeOf(t)););
  return t;
}
module.exports = _superPropBase, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/toConsumableArray.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/toConsumableArray.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayWithoutHoles = __webpack_require__(/*! ./arrayWithoutHoles.js */ "../node_modules/@babel/runtime/helpers/arrayWithoutHoles.js");
var iterableToArray = __webpack_require__(/*! ./iterableToArray.js */ "../node_modules/@babel/runtime/helpers/iterableToArray.js");
var unsupportedIterableToArray = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "../node_modules/@babel/runtime/helpers/unsupportedIterableToArray.js");
var nonIterableSpread = __webpack_require__(/*! ./nonIterableSpread.js */ "../node_modules/@babel/runtime/helpers/nonIterableSpread.js");
function _toConsumableArray(r) {
  return arrayWithoutHoles(r) || iterableToArray(r) || unsupportedIterableToArray(r) || nonIterableSpread();
}
module.exports = _toConsumableArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/toPrimitive.js":
/*!*************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/toPrimitive.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(/*! ./typeof.js */ "../node_modules/@babel/runtime/helpers/typeof.js")["default"]);
function toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
module.exports = toPrimitive, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/toPropertyKey.js":
/*!***************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/toPropertyKey.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(/*! ./typeof.js */ "../node_modules/@babel/runtime/helpers/typeof.js")["default"]);
var toPrimitive = __webpack_require__(/*! ./toPrimitive.js */ "../node_modules/@babel/runtime/helpers/toPrimitive.js");
function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}
module.exports = toPropertyKey, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/typeof.js":
/*!********************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/typeof.js ***!
  \********************************************************/
/***/ ((module) => {

function _typeof(o) {
  "@babel/helpers - typeof";

  return module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof(o);
}
module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/unsupportedIterableToArray.js":
/*!****************************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/unsupportedIterableToArray.js ***!
  \****************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayLikeToArray = __webpack_require__(/*! ./arrayLikeToArray.js */ "../node_modules/@babel/runtime/helpers/arrayLikeToArray.js");
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? arrayLikeToArray(r, a) : void 0;
  }
}
module.exports = _unsupportedIterableToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!************************************************************!*\
  !*** ../modules/atomic-widgets/assets/js/editor/module.js ***!
  \************************************************************/


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "../node_modules/@babel/runtime/helpers/slicedToArray.js"));
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _component = _interopRequireDefault(__webpack_require__(/*! ./component */ "../modules/atomic-widgets/assets/js/editor/component.js"));
var _atomicWidgetType = __webpack_require__(/*! ./atomic-widget-type */ "../modules/atomic-widgets/assets/js/editor/atomic-widget-type.js");
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var Module = /*#__PURE__*/function (_elementorModules$edi) {
  function Module() {
    (0, _classCallCheck2.default)(this, Module);
    return _callSuper(this, Module, arguments);
  }
  (0, _inherits2.default)(Module, _elementorModules$edi);
  return (0, _createClass2.default)(Module, [{
    key: "onInit",
    value: function onInit() {
      $e.components.register(new _component.default());
      this.registerAtomicWidgetTypes();
    }
  }, {
    key: "registerAtomicWidgetTypes",
    value: function registerAtomicWidgetTypes() {
      var _elementor$widgetsCac;
      Object.entries((_elementor$widgetsCac = elementor.widgetsCache) !== null && _elementor$widgetsCac !== void 0 ? _elementor$widgetsCac : {}).filter(function (_ref) {
        var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
          widget = _ref2[1];
        return !!widget.atomic;
      }).forEach(function (_ref3) {
        var _ref4 = (0, _slicedToArray2.default)(_ref3, 1),
          type = _ref4[0];
        return elementor.elementsManager.registerElementType(new _atomicWidgetType.AtomicWidgetType(type));
      });
      this.registerAtomicDivBlockType();
    }
  }, {
    key: "registerAtomicDivBlockType",
    value: function registerAtomicDivBlockType() {
      var DivBlock = (__webpack_require__(/*! ./div-block-type */ "../modules/atomic-widgets/assets/js/editor/div-block-type.js")["default"]);
      elementor.elementsManager.registerElementType(new DivBlock());
    }
  }]);
}(elementorModules.editor.utils.Module);
new Module();
})();

/******/ })()
;
//# sourceMappingURL=atomic-widgets-editor.js.map