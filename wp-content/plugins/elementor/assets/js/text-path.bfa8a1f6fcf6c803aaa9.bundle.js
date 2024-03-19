/*! elementor - v3.20.0 - 13-03-2024 */"use strict";(self["webpackChunkelementor"]=self["webpackChunkelementor"]||[]).push([["text-path"],{"../modules/shapes/assets/js/frontend/handlers/text-path.js":
/*!******************************************************************!*\
  !*** ../modules/shapes/assets/js/frontend/handlers/text-path.js ***!
  \******************************************************************/
((__unused_webpack_module,exports,__webpack_require__)=>{Object.defineProperty(exports,"__esModule",({value:true}));exports["default"]=void 0;var _utils=__webpack_require__(/*! elementor-frontend/utils/utils */"../assets/dev/js/frontend/utils/utils.js");class TextPathHandler extends elementorModules.frontend.handlers.Base{getDefaultSettings(){return{selectors:{pathContainer:'.e-text-path',svg:'.e-text-path > svg'}};}
getDefaultElements(){const{selectors}=this.getSettings();const element=this.$element[0];return{widgetWrapper:element,pathContainer:element.querySelector(selectors.pathContainer),svg:element.querySelector(selectors.svg),textPath:element.querySelector(selectors.textPath)};}
onInit(){this.elements=this.getDefaultElements();this.fetchSVG().then(()=>{this.pathId=`e-path-${this.elements.widgetWrapper.dataset.id}`;this.textPathId=`e-text-path-${this.elements.widgetWrapper.dataset.id}`;if(!this.elements.svg){return;}
this.initTextPath();});}
fetchSVG(){const{url}=this.elements.pathContainer.dataset;if(!url||!url.endsWith('.svg')){return Promise.reject(url);}
return fetch(url).then(res=>res.text()).then(svg=>{this.elements.pathContainer.innerHTML=svg;this.elements=this.getDefaultElements();});}
setOffset(offset){if(!this.elements.textPath){return;}
if(this.isRTL()){offset=100-parseInt(offset);}
this.elements.textPath.setAttribute('startOffset',offset+'%');}
onElementChange(setting){const{start_point:startPoint,text}=this.getElementSettings();switch(setting){case'start_point':this.setOffset(startPoint.size);break;case'text':this.setText(text);break;case'text_path_direction':this.setOffset(startPoint.size);this.setText(text);break;default:break;}}
attachIdToPath(){const path=this.elements.svg.querySelector('[data-path-anchor]')||this.elements.svg.querySelector('path');path.id=this.pathId;}
initTextPath(){const{start_point:startPoint}=this.getElementSettings();const text=this.elements.pathContainer.dataset.text;this.attachIdToPath();this.elements.svg.innerHTML+=`
   <text>
    <textPath id="${this.textPathId}" href="#${this.pathId}"></textPath>
   </text>
  `;this.elements.textPath=this.elements.svg.querySelector(`#${this.textPathId}`);this.setOffset(startPoint.size);this.setText(text);}
setText(newText){const{is_external:isExternal,nofollow}=this.getElementSettings().link;const{linkUrl:url}=this.elements.pathContainer.dataset;const target=isExternal?'_blank':'',rel=nofollow?'nofollow':'';if(url){newText=`<a href="${(0, _utils.escapeHTML)(url)}" rel="${rel}" target="${target}">${(0, _utils.escapeHTML)(newText)}</a>`;}
this.elements.textPath.innerHTML=newText;const existingClone=this.elements.svg.querySelector(`#${this.textPathId}-clone`);if(existingClone){existingClone.remove();}
if(this.shouldReverseText()){const clone=this.elements.textPath.cloneNode();clone.id+='-clone';clone.classList.add('elementor-hidden');clone.textContent=newText;this.elements.textPath.parentNode.appendChild(clone);this.reverseToRTL();}}
isRTL(){const{text_path_direction:direction}=this.getElementSettings();let isRTL=elementorFrontend.config.is_rtl;if(direction){isRTL='rtl'===direction;}
return isRTL;}
shouldReverseText(){if(!this.isRTL()){return false;}
const isFirefox=elementorFrontend.utils.environment.firefox;if(isFirefox){return false;}
const isChromium=elementorFrontend.utils.environment.blink;if(isChromium){return!this.isFixedChromiumVersion();}
return true;}
isFixedChromiumVersion(){const FIXED_CHROMIUM_VERSION=96;const currentChromiumVersion=parseInt(navigator.userAgent.match(/(?:Chrom(?:e|ium)|Edg)\/([0-9]+)\./)[1]);return currentChromiumVersion>=FIXED_CHROMIUM_VERSION;}
reverseToRTL(){let parentElement=this.elements.textPath;parentElement=parentElement.querySelector('a')||parentElement;const pattern=/([\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC\s$&+,:;=?@#|'<>.^*()%!-]+)/ig;parentElement.textContent=parentElement.textContent.replace(pattern,word=>{return word.split('').reverse().join('');});parentElement.setAttribute('aria-hidden',true);}}
exports["default"]=TextPathHandler;})}]);