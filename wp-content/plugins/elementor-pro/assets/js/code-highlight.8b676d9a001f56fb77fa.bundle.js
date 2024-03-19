/*! elementor-pro - v3.20.0 - 11-03-2024 */"use strict";(self["webpackChunkelementor_pro"]=self["webpackChunkelementor_pro"]||[]).push([["code-highlight"],{"../modules/code-highlight/assets/js/frontend/handler.js":
/*!***************************************************************!*\
  !*** ../modules/code-highlight/assets/js/frontend/handler.js ***!
  \***************************************************************/
((__unused_webpack_module,exports)=>{Object.defineProperty(exports,"__esModule",({value:true}));exports["default"]=void 0;class codeHighlightHandler extends elementorModules.frontend.handlers.Base{onInit(){super.onInit(...arguments);Prism.highlightAllUnder(this.$element[0],false);}
onElementChange(){Prism.highlightAllUnder(this.$element[0],false);}}
exports["default"]=codeHighlightHandler;})}]);