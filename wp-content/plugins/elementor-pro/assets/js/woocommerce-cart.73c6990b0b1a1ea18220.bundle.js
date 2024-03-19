/*! elementor-pro - v3.20.0 - 11-03-2024 */"use strict";(self["webpackChunkelementor_pro"]=self["webpackChunkelementor_pro"]||[]).push([["woocommerce-cart"],{"../modules/woocommerce/assets/js/frontend/handlers/base.js":
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
exports["default"]=Base;}),"../modules/woocommerce/assets/js/frontend/handlers/cart.js":
/*!******************************************************************!*\
  !*** ../modules/woocommerce/assets/js/frontend/handlers/cart.js ***!
  \******************************************************************/
((__unused_webpack_module,exports,__webpack_require__)=>{var _interopRequireDefault=__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */"../node_modules/@babel/runtime/helpers/interopRequireDefault.js");Object.defineProperty(exports,"__esModule",({value:true}));exports["default"]=void 0;var _base=_interopRequireDefault(__webpack_require__(/*! ./base */"../modules/woocommerce/assets/js/frontend/handlers/base.js"));class Cart extends _base.default{getDefaultSettings(){const defaultSettings=super.getDefaultSettings(...arguments);return{selectors:{...defaultSettings.selectors,shippingForm:'.shipping-calculator-form',quantityInput:'.qty',updateCartButton:'button[name=update_cart]',wpHttpRefererInputs:'[name=_wp_http_referer]',hiddenInput:'input[type=hidden]',productRemove:'.product-remove a'},classes:defaultSettings.classes,ajaxUrl:elementorProFrontend.config.ajaxurl};}
getDefaultElements(){const selectors=this.getSettings('selectors');return{...super.getDefaultElements(...arguments),$shippingForm:this.$element.find(selectors.shippingForm),$stickyColumn:this.$element.find(selectors.stickyColumn),$hiddenInput:this.$element.find(selectors.hiddenInput)};}
bindEvents(){super.bindEvents();const selectors=this.getSettings('selectors');elementorFrontend.elements.$body.on('wc_fragments_refreshed',()=>this.applyButtonsHoverAnimation());if('yes'===this.getElementSettings('update_cart_automatically')){this.$element.on('input',selectors.quantityInput,()=>this.updateCart());}
elementorFrontend.elements.$body.on('wc_fragments_loaded wc_fragments_refreshed',()=>{this.updateWpReferers();if(elementorFrontend.isEditMode()||elementorFrontend.isWPPreviewMode()){this.disableActions();}});elementorFrontend.elements.$body.on('added_to_cart',function(e,data){if(data.e_manually_triggered){return false;}});}
onInit(){super.onInit(...arguments);this.toggleStickyRightColumn();this.hideHiddenInputsParentElements();if(elementorFrontend.isEditMode()){this.elements.$shippingForm.show();}
this.applyButtonsHoverAnimation();this.updateWpReferers();if(elementorFrontend.isEditMode()||elementorFrontend.isWPPreviewMode()){this.disableActions();}}
disableActions(){const selectors=this.getSettings('selectors');this.$element.find(selectors.updateCartButton).attr({disabled:'disabled','aria-disabled':'true'});if(elementorFrontend.isEditMode()){this.$element.find(selectors.quantityInput).attr('disabled','disabled');this.$element.find(selectors.productRemove).css('pointer-events','none');}}
onElementChange(propertyName){if('sticky_right_column'===propertyName){this.toggleStickyRightColumn();}
if('additional_template_select'===propertyName){elementorPro.modules.woocommerce.onTemplateIdChange('additional_template_select');}}
onDestroy(){super.onDestroy(...arguments);this.deactivateStickyRightColumn();}
updateCart(){const selectors=this.getSettings('selectors');clearTimeout(this._debounce);this._debounce=setTimeout(()=>{this.$element.find(selectors.updateCartButton).trigger('click');},1500);}
applyButtonsHoverAnimation(){const elementSettings=this.getElementSettings();if(elementSettings.checkout_button_hover_animation){jQuery('.checkout-button').addClass('elementor-animation-'+elementSettings.checkout_button_hover_animation);}
if(elementSettings.forms_buttons_hover_animation){jQuery('.shop_table .button').addClass('elementor-animation-'+elementSettings.forms_buttons_hover_animation);}}
hideHiddenInputsParentElements(){if(this.isEdit){if(this.elements.$hiddenInput){this.elements.$hiddenInput.parent('.form-row').addClass('elementor-hidden');}}}}
exports["default"]=Cart;})}]);