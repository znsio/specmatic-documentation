/*! elementor-pro - v3.20.0 - 11-03-2024 */"use strict";(self["webpackChunkelementor_pro"]=self["webpackChunkelementor_pro"]||[]).push([["product-add-to-cart"],{"../modules/woocommerce/assets/js/frontend/handlers/base.js":
/*!******************************************************************!*\
  !*** ../modules/woocommerce/assets/js/frontend/handlers/base.js ***!
  \******************************************************************/
((__unused_webpack_module,exports)=>{Object.defineProperty(exports,"__esModule",({value:true}));exports["default"]=void 0;class Base extends elementorModules.frontend.handlers.Base{getDefaultSettings(){return{selectors:{stickyRightColumn:'.e-sticky-right-column'},classes:{stickyRightColumnActive:'e-sticky-right-column--active'}};}
getDefaultElements(){const selectors=this.getSettings('selectors');return{$stickyRightColumn:this.$element.find(selectors.stickyRightColumn)};}
bindEvents(){elementorFrontend.elements.$document.on('select2:open',event=>{this.addSelect2Wrapper(event);});}
addSelect2Wrapper(event){const selectElement=jQuery(event.target).data('select2');if(selectElement.$dropdown){selectElement.$dropdown.addClass('e-woo-select2-wrapper');}}
isStickyRightColumnActive(){const classes=this.getSettings('classes');return this.elements.$stickyRightColumn.hasClass(classes.stickyRightColumnActive);}
activateStickyRightColumn(){const elementSettings=this.getElementSettings(),$wpAdminBar=elementorFrontend.elements.$wpAdminBar,classes=this.getSettings('classes');let stickyOptionsOffset=elementSettings.sticky_right_column_offset||0;if($wpAdminBar.length&&'fixed'===$wpAdminBar.css('position')){stickyOptionsOffset+=$wpAdminBar.height();}
if('yes'===this.getElementSettings('sticky_right_column')){this.elements.$stickyRightColumn.addClass(classes.stickyRightColumnActive);this.elements.$stickyRightColumn.css('top',stickyOptionsOffset+'px');}}
deactivateStickyRightColumn(){if(!this.isStickyRightColumnActive()){return;}
const classes=this.getSettings('classes');this.elements.$stickyRightColumn.removeClass(classes.stickyRightColumnActive);}
toggleStickyRightColumn(){if(!this.getElementSettings('sticky_right_column')){this.deactivateStickyRightColumn();return;}
if(!this.isStickyRightColumnActive()){this.activateStickyRightColumn();}}
equalizeElementHeight($element){if($element.length){$element.removeAttr('style');let maxHeight=0;$element.each((index,element)=>{maxHeight=Math.max(maxHeight,element.offsetHeight);});if(0<maxHeight){$element.css({height:maxHeight+'px'});}}}
removePaddingBetweenPurchaseNote($element){if($element){$element.each((index,element)=>{jQuery(element).prev().children('td').addClass('product-purchase-note-is-below');});}}
updateWpReferers(){const selectors=this.getSettings('selectors'),wpHttpRefererInputs=this.$element.find(selectors.wpHttpRefererInputs),url=new URL(document.location);url.searchParams.set('elementorPageId',elementorFrontend.config.post.id);url.searchParams.set('elementorWidgetId',this.getID());wpHttpRefererInputs.attr('value',url);}}
exports["default"]=Base;}),"../modules/woocommerce/assets/js/frontend/handlers/product-add-to-cart.js":
/*!*********************************************************************************!*\
  !*** ../modules/woocommerce/assets/js/frontend/handlers/product-add-to-cart.js ***!
  \*********************************************************************************/
((__unused_webpack_module,exports,__webpack_require__)=>{var _interopRequireDefault=__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */"../node_modules/@babel/runtime/helpers/interopRequireDefault.js");Object.defineProperty(exports,"__esModule",({value:true}));exports["default"]=void 0;var _base=_interopRequireDefault(__webpack_require__(/*! ./base */"../modules/woocommerce/assets/js/frontend/handlers/base.js"));class ProductAddToCart extends _base.default{getDefaultSettings(){return{selectors:{quantityInput:'.e-loop-add-to-cart-form input.qty',addToCartButton:'.e-loop-add-to-cart-form .ajax_add_to_cart',addedToCartButton:'.added_to_cart',loopFormContainer:'.e-loop-add-to-cart-form-container'}};}
getDefaultElements(){const selectors=this.getSettings('selectors');return{$quantityInput:this.$element.find(selectors.quantityInput),$addToCartButton:this.$element.find(selectors.addToCartButton)};}
updateAddToCartButtonQuantity(){this.elements.$addToCartButton.attr('data-quantity',this.elements.$quantityInput.val());}
handleAddedToCart($button){const selectors=this.getSettings('selectors'),$addToCartButton=$button.siblings(selectors.addedToCartButton),$loopFormContainer=$addToCartButton.parents(selectors.loopFormContainer);$loopFormContainer.children(selectors.addedToCartButton).remove();$loopFormContainer.append($addToCartButton);}
bindEvents(){super.bindEvents(...arguments);this.elements.$quantityInput.on('change',()=>{this.updateAddToCartButtonQuantity();});elementorFrontend.elements.$body.off('added_to_cart.elementor-woocommerce-product-add-to-cart');elementorFrontend.elements.$body.on('added_to_cart.elementor-woocommerce-product-add-to-cart',(e,fragments,cartHash,$button)=>{this.handleAddedToCart($button);});}}
exports["default"]=ProductAddToCart;})}]);