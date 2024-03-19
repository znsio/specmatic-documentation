(function(){"use strict";var __webpack_modules__=({"@elementor/editor-app-bar":
/*!***********************************************!*\
  !*** external ["elementorV2","editorAppBar"] ***!
  \***********************************************/
(function(module){module.exports=window["elementorV2"]["editorAppBar"];}),"@elementor/editor-v1-adapters":
/*!***************************************************!*\
  !*** external ["elementorV2","editorV1Adapters"] ***!
  \***************************************************/
(function(module){module.exports=window["elementorV2"]["editorV1Adapters"];}),"@elementor/icons":
/*!****************************************!*\
  !*** external ["elementorV2","icons"] ***!
  \****************************************/
(function(module){module.exports=window["elementorV2"]["icons"];}),"@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(function(module){module.exports=window["wp"]["i18n"];})});var __webpack_module_cache__={};function __webpack_require__(moduleId){var cachedModule=__webpack_module_cache__[moduleId];if(cachedModule!==undefined){return cachedModule.exports;}
var module=__webpack_module_cache__[moduleId]={exports:{}};__webpack_modules__[moduleId](module,module.exports,__webpack_require__);return module.exports;}!function(){__webpack_require__.r=function(exports){if(typeof Symbol!=='undefined'&&Symbol.toStringTag){Object.defineProperty(exports,Symbol.toStringTag,{value:'Module'});}
Object.defineProperty(exports,'__esModule',{value:true});};}();var __webpack_exports__={};!function(){
/*!*************************************************************!*\
  !*** ./node_modules/@elementor/editor-notes/dist/index.mjs ***!
  \*************************************************************/
__webpack_require__.r(__webpack_exports__);var _elementor_editor_app_bar__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! @elementor/editor-app-bar */"@elementor/editor-app-bar");var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! @wordpress/i18n */"@wordpress/i18n");var _elementor_editor_v1_adapters__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! @elementor/editor-v1-adapters */"@elementor/editor-v1-adapters");var _elementor_icons__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__(/*! @elementor/icons */"@elementor/icons");function useNotesActionProps(){const{isActive,isBlocked}=(0,_elementor_editor_v1_adapters__WEBPACK_IMPORTED_MODULE_2__.__privateUseRouteStatus)("notes",{blockOnPreviewMode:false});return{title:(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Notes","elementor-pro"),icon:_elementor_icons__WEBPACK_IMPORTED_MODULE_3__.MessageIcon,onClick:()=>(0,_elementor_editor_v1_adapters__WEBPACK_IMPORTED_MODULE_2__.__privateRunCommand)("notes/toggle"),selected:isActive,disabled:isBlocked};}
function init(){_elementor_editor_app_bar__WEBPACK_IMPORTED_MODULE_0__.toolsMenu.registerToggleAction({id:"toggle-notes",priority:4,useProps:useNotesActionProps});}
init();}();(window.elementorV2=window.elementorV2||{}).editorNotes=__webpack_exports__;})();