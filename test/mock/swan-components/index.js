/**
 * @file mock swan-components
 * @author lvlei(lvlei03@baidu.com)
 */

import {noop} from '../../utils';

export const swanComponents = {
    getContextOperators: noop,
    getComponentRecievers: noop,
    getComponents: () => {
        return {
            "swan-component": {
                "dependencies": ["swaninterface", "communicator", "san"],
                "computed": {}
            },
            "view": {
                "superComponent": "swan-component",
                "componentDependencies": ["text", "view"],
                "template": "<swan-view class=\"{{__privateClass}}\">\n        <slot></slot>\n    <text>swan-text</text>\n    <view>swan-view</view>\n    <aaa>aaa</aaa>\n    </swan-view>",
                "behaviors": ["userTouchEvents", "noNativeBehavior", "hoverEffect", "animateEffect", "nativeEventEffect"],
                "computed": {}
            },
            "cover-view": {
                "behaviors": ["nativeEventEffect", "nativeCover"],
                "computed": {},
                "template": "<swan-cover-view data-sanid=\"{{provideData.componentId}}\">\n        <div s-ref=\"container\" class=\"swan-cover-view\" style=\"display: none\">\n            <slot></slot>\n        </div>\n        <div s-ref=\"computed\" class=\"{{'computed ' + (class ? class : '')}}\" style=\"{{style}}\"></div>\n    </swan-cover-view>"
            },
            "image": {
                "behaviors": ["userTouchEvents", "noNativeBehavior", "animateEffect"],
                "computed": {},
                "template": "<swan-image>\n            <div s-ref=\"img\"></div>\n        </swan-image>"
            },
            "text": {
                "behaviors": ["userTouchEvents", "animateEffect"],
                "computed": {},
                "messages": {},
                "template": "<swan-text>\n        <span s-ref='templateText' style=\"display: none;\"><slot></slot></span>\n        <span s-ref='showText' class=\"{{textSelectableClass}}\"></span>\n    </swan-text>"
            },
            "map": {
                "behaviors": ["nativeEventEffect"],
                "template": "<swan-map id=\"{{id}}\"\n        style=\"{{hiddenStyle}}\"\n        data-sanid=\"{{provideData.componentId}}\"\n    >\n        <div class=\"slot\"><slot></slot></div>\n    </swan-map>",
                "computed": {}
            },
            "scroll-view": {
                "behaviors": ["userTouchEvents", "noNativeBehavior", "animateEffect"],
                "template": "\n        <swan-scroll-view>\n            <div s-ref=\"wrap\" class=\"swan-scroll-view\">\n                <div s-ref=\"main\" class=\"swan-scroll-view scroll-view-compute-offset\"\n                    on-scroll=\"onScroll($event)\"\n                    on-touchend=\"onScrollViewTouchEnd($event)\"\n                    on-touchstart=\"onScrollViewTouchStart($event)\"\n                    on-touchmove=\"onScrollViewTouchMove($event)\">\n                    <div s-ref=\"content\">\n                        <slot></slot>\n                    </div>\n                </div>\n            </div>\n        </swan-scroll-view>",
                "computed": {}
            },
            "web-view": {
                "template": "<swan-web-view style=\"{{hiddenStyle}}\" data-sanid=\"{{provideData.componentId}}\"></swan-web-view>",
                "computed": {}
            },
            "navigator": {
                "behaviors": ["userTouchEvents", "noNativeBehavior", "hoverEffect", "animateEffect"],
                "computed": {},
                "template": "<swan-nav class=\"{{__privateClass}} swan-spider-tap\">\n        <slot></slot>\n    </swan-nav>"
            },
            "input": {
                "behaviors": ["form", "noNativeBehavior", "keyboardStatus"],
                "computed": {},
                "template": "<swan-input type=\"{{privateType}}\"\n        focus=\"{{__focus}}\"\n        cursor=\"{{__cursor}}\"\n        on-click=\"showNativeInput()\"\n        value=\"{{__value}}\"\n        style=\"{{getStyle}}\"\n        id=\"{{id}}\"\n        name=\"{{name}}\"\n        data-sanid=\"{{provideData.componentId}}\"\n    >\n        <div class=\"swan-input-main\">\n            <div s-ref=\"placeholder\"\n                showplaceholder=\"{{__value.length === 0 && provideData.placeholderValue.length === 0}}\"\n                class=\"input-placeholder\"\n                style=\"{{placeholderComputedStyle}}\">\n                {{__placeholder}}\n            </div>\n            <div s-ref=\"inputValue\"\n                class=\"input-value\"\n                style=\"{{inputTextStyle}}\">\n                {{showValue}}\n            </div>\n            <div s-ref=\"stylecompute\"\n                class=\"input-stylecompute {{placeholderClass}}\"\n                style=\"{{placeholderStyle}}\"></div>\n        </div>\n    </swan-input>"
            },
            "textarea": {
                "behaviors": ["form", "nativeCover", "keyboardStatus"],
                "computed": {},
                "template": "<swan-textarea\n        placeholder=\"{{__placeholder}}\"\n        focus=\"{{__focus}}\"\n        maxlength=\"{{__maxlength}}\"\n        auto-height=\"{{__autoHeight}}\"\n        value=\"{{__value}}\"\n        id=\"{{id}}\"\n        disabled=\"{{disabled}}\"\n        data-sanid=\"{{provideData.componentId}}\"\n    >\n        <div class=\"swan-textarea-main\">\n            <div s-ref=\"placeholder\"\n                class=\"{{getPlaceholderClass}}\"\n                style=\"{{getPlaceholderStyle}}\">\n                {{__placeholder}}\n            </div>\n        </div>\n    </swan-textarea>"
            },
            "cover-image": {
                "behaviors": ["nativeEventEffect", "nativeCover"],
                "template": "<swan-cover-image data-sanid=\"{{provideData.componentId}}\"\n        src=\"{{src}}\">\n        <img s-ref=\"img\"\n            src=\"{{provideData.src}}\"\n            style=\"width: {{provideData.isLoaded ? '100%' : 'auto'}}\" />\n        <div s-ref=\"computed\"\n            class=\"{{'computed ' + (class ? class : '')}}\"\n            style=\"{{style}}\"></div>\n    </swan-cover-image>",
                "computed": {}
            },
            "button": {
                "behaviors": ["userTouchEvents", "nativeEventEffect", "noNativeBehavior", "hoverEffect", "animateEffect", "nativeCover"],
                "computed": {},
                "template": "<swan-button type=\"{{__type}}\"\n        class=\"{{privateStyle[__size]}} {{__privateClass}} {{__disabled ? 'swan-button-disabled' : ''}}\n        {{provideData.isIos ? 'swan-button-radius-ios' : ''}}\"\n        loading=\"{{__loading}}\"\n        size=\"{{__size}}\"\n        plain=\"{{__plain}}\"\n        swan-label-target=\"true\"\n        data-sanid=\"{{provideData.componentId}}\"\n    >\n        <slot></slot>\n    </swan-button>"
            },
            "swiper": {
                "behaviors": ["userTouchEvents", "noNativeBehavior"],
                "template": "<swan-swiper class=\"swan-swiper-wrapper\">\n            <div class=\"swan-swiper-slides\" style=\"{{getStyle}}\">\n                <div s-ref=\"swiperSlides\" class=\"swan-swiper-slide-frame\"\n                    on-touchend=\"onSwiperTouchEnd($event)\"\n                    on-touchcancel=\"onSwiperTouchEnd($event)\"\n                    on-touchstart=\"onSwiperTouchStart($event)\"\n                    on-touchmove=\"onSwiperTouchMove($event)\">\n                    <slot></slot>\n                </div>\n            </div>\n            <div s-if=\"__indicatorDots\"\n                class=\"swan-swiper-dots {{__vertical ? 'swan-swiper-dots-vertical' : 'swan-swiper-dots-horizontal'}}\">\n                <div s-for=\"v, k in swiperDots\" class=\"swan-swiper-dot\"\n                style=\"background: {{ v ? indicatorActiveColor : indicatorColor}}\"></div>\n            </div>\n        </swan-swiper>",
                "computed": {}
            },
            "swiper-item": {
                "behaviors": ["userTouchEvents", "noNativeBehavior"],
                "template": "\n        <swan-swiper-item item-id=\"{{itemId}}\">\n            <slot></slot>\n        </swan-swiper-item>"
            },
            "picker-view": {
                "behaviors": ["userTouchEvents", "noNativeBehavior"],
                "template": "\n        <swan-picker-view value=\"{{value}}\">\n            <div class=\"wrapper\" s-ref=\"wrapper\" data-sanid=\"{{provideData.componentId}}\">\n                <slot\n                    var-value=\"__value\" var-indicatorStyle=\"__indicatorStyle\"\n                    var-indicatorClass=\"__indicatorClass\" var-maskStyle=\"__maskStyle\"\n                    var-maskClass=\"__maskClass\">\n                </slot>\n            </div>\n        </swan-picker-view>",
                "computed": {}
            },
            "picker-view-column": {
                "behaviors": ["userTouchEvents", "noNativeBehavior"],
                "template": "\n        <swan-picker-view-column\n            on-touchstart=\"onTouchStart($event)\"\n            on-touchmove=\"onTouchMove($event)\"\n            on-touchend=\"onTouchEnd($event)\">\n            <div class=\"swan-picker__group\" s-ref=\"columnGroup\">\n                <div class=\"swan-picker__mask\" s-ref=\"columnMask\"></div>\n                <div class=\"swan-picker__indicator\" s-ref=\"columnIndicator\"></div>\n                <div class=\"swan-picker__content\" s-ref=\"columnContent\"\n                    style=\"transform: translate3d(0px, 0px, 0px)\">\n                    <slot></slot>\n                </div>\n            </div>\n        </swan-picker-view-column>"
            },
            "picker": {
                "behaviors": ["form", "userTouchEvents", "noNativeBehavior"],
                "computed": {},
                "template": "<swan-picker\n        mode=\"{{__mode}}\"\n        disabled=\"{{__disabled}}\"\n        data-sanid=\"{{provideData.componentId}}\">\n        <slot></slot>\n    </swan-picker>"
            },
            "icon": {
                "behaviors": ["userTouchEvents", "noNativeBehavior", "hoverEffect", "animateEffect"],
                "template": "\n        <swan-icon\n            class=\"{{__privateClass}}\">\n            <span class=\"{{iconClass}} swan-icon\" \n            s-if=\"{{__type != 'loadingWhite' && __type != 'loadingGrey'}}\" \n            style=\"{{__color ? 'color:' + __color : ''}};{{__size ? 'font-size:' + __size + 'px': ''}}\"></span>\n            <span class=\"{{iconClass}} swan-icon\" \n            s-if=\"{{__type == 'loadingWhite' || __type == 'loadingGrey'}}\" \n            style=\"width: {{__size}}px;height: {{__size}}px;\"></span>\n        </swan-icon>",
                "computed": {}
            },
            "label": {
                "behaviors": ["noNativeBehavior", "animateEffect", "userTouchEvents"],
                "template": "<swan-label\n            class=\"{{__privateClass}}\"\n            on-click=\"labelClick($event)\"\n            for=\"{{for}}\"\n        >\n            <slot></slot>\n        </swan-label>",
                "computed": {}
            },
            "form": {
                "behaviors": ["userTouchEvents", "noNativeBehavior"],
                "computed": {},
                "template": "<swan-form>\n        <slot></slot>\n    </swan-form>",
                "messages": {}
            },
            "slider": {
                "behaviors": ["userTouchEvents", "form", "animateEffect"],
                "template": "<swan-slider>\n        <div class=\"swan-slider\">\n            <div class=\"swan-slider-wrapper\">\n                <div class=\"swan-slider-tap-area\"\n                    on-touchstart=\"onTouchStart($event)\"\n                    on-touchmove=\"onTouchMove($event)\"\n                    on-touchend=\"onTouchEnd($event)\">\n                    <div class=\"swan-slider-handle-wrapper\"\n                        style=\"background: {{backgroundColor}};\">\n                        <div class=\"swan-slider-handle\"\n                            style=\"left: {{handleLeft}}%;\"></div>\n                        <div class=\"swan-slider-thumb\"\n                            style=\"left: {{handleLeft}}%;\n                            background: {{blockColor}};\n                            width: {{blockSize}}px;\n                            height: {{blockSize}}px;\n                            margin-top: -{{blockSize/2}}px;\n                            margin-left: -{{blockSize/2}}px;\"></div>\n                        <div class=\"swan-slider-track\"\n                            style=\"background: {{activeColor}}; width: {{handleLeft}}%;\"></div>\n                    </div>\n                </div>\n                <span s-if=\"{{__showValue && __showValue !== 'false'}}\" class=\"swan-slider-value\">\n                    {{value}}\n                </span>\n            </div>\n        </div>\n    </swan-slider>",
                "computed": {}
            },
            "rich-text": {
                "behaviors": ["userTouchEvents", "noNativeBehavior"],
                "template": "<swan-rich-text></swan-rich-text>"
            },
            "canvas": {
                "behaviors": ["nativeEventEffect"],
                "template": "\n        <swan-canvas canvas-id=\"{{canvasId}}\"\n            style=\"{{hiddenStyle}}\"\n            data-sanid=\"{{provideData.componentId}}\">\n            <canvas></canvas>\n            <div class=\"slot\"><slot></slot></div>\n        </swan-canvas>",
                "computed": {}
            },
            "checkbox": {
                "behaviors": ["userTouchEvents", "hoverEffect"],
                "computed": {},
                "template": "<swan-checkbox\n        class=\"{{__privateClass}}\"\n        value=\"{{value}}\"\n        checked=\"{{__checked}}\"\n        disabled=\"{{__disabled}}\"\n        on-click=\"onClick($event)\"\n    >\n        <div class=\"{{'swan-checkbox-input'}}\"\n            style=\"{{setUserColor}}\"\n        ></div>\n        <slot></slot>\n    </swan-checkbox>"
            },
            "checkbox-group": {
                "behaviors": ["userTouchEvents", "hoverEffect", "form"],
                "template": "<swan-checkbox-group\n        name=\"{{name}}\"\n    >\n        <slot></slot>\n    </swan-checkbox-group>"
            },
            "live-player": {
                "behaviors": ["nativeEventEffect"],
                "template": "<swan-live-player class=\"liveWrapper\"\n        id=\"{{id}}\"\n        style=\"{{hiddenStyle}}\"\n        data-sanid=\"{{provideData.componentId}}\"\n    >\n        <span class=\"liveicon\" on-click=\"openLivePlayer\"></span>\n        <div s-ref=\"slot\"\n            style=\"display: {{provideData.isFullscreen ? 'none' : 'block'}}\"\n            class=\"slot\">\n            <slot s-if=\"{{!provideData.isFullscreen}}\"></slot>\n        </div>\n        <div s-ref=\"full\"\n            style=\"{{getFullscreenContainerStyle}}\"\n            class=\"full\">\n            <slot s-if=\"{{provideData.isFullscreen}}\"></slot>\n        </div>\n    </swan-live-player>",
                "computed": {}
            },
            "video": {
                "behaviors": ["nativeEventEffect"],
                "template": "<swan-video id=\"{{id}}\" data-sanid=\"{{provideData.componentId}}\"\n        style=\"{{__poster ? 'background-image: url(' + __poster + ');' : ''}}\"\n        data-poster-type=\"{{__objectFit}}\"\n    >\n        <swan-video-play\n            on-click=\"openVideo(true)\"\n            s-if=\"{{provideData.isShowPlayBtn}}\"\n        ></swan-video-play>\n        <div s-ref=\"slot\"\n            style=\"display: {{provideData.isFullscreen ? 'none' : 'block'}}\"\n            class=\"slot\">\n            <slot s-if=\"{{!provideData.isFullscreen && !__hidden}}\"></slot>\n        </div>\n        <div s-ref=\"full\"\n            style=\"{{getFullscreenContainerStyle}}\"\n            class=\"full\">\n            <slot s-if=\"{{provideData.isFullscreen && !__hidden}}\"></slot>\n        </div>\n    </swan-video>",
                "computed": {}
            },
            "radio": {
                "behaviors": ["form", "userTouchEvents", "noNativeBehavior", "animateEffect", "color"],
                "computed": {},
                "template": "<swan-radio on-click=\"radioTap($event)\">\n        <div class=\"swan-radio-wrapper\">\n            <div class=\"{{getRadioInputClass}}\">\n                <div class=\"swan-radio-input-border\" style=\"border-color: {{getRadioInputColor}}\"></div>\n                <div class=\"swan-radio-input-button\" style=\"background-color: {{getRadioInputColor}}\"></div>\n            </div>\n            <slot></slot>\n        </div>\n    </swan-radio>"
            },
            "radio-group": {
                "behaviors": ["form", "userTouchEvents", "noNativeBehavior", "animateEffect"],
                "template": "<swan-radio-group id=\"{{id}}\"><slot></slot></swan-radio-group>",
                "messages": {}
            },
            "switch": {
                "behaviors": ["userTouchEvents", "hoverEffect", "form"],
                "computed": {},
                "template": "<swan-switch\n        class=\"{{__privateClass}}\"\n        checked=\"{{__checked}}\"\n        color=\"{{__color}}\"\n        type=\"{{__type}}\"\n        name=\"{{name}}\"\n        on-click=\"onClick($event)\"\n    >\n        <div class=\"{{'swan-switch-input'}}\n            {{getSwitchChecked}}\"\n            style=\"{{getUserColor}}\"\n            hiddenl=\"{{__type}}\"\n        ></div>\n        <div class=\"{{'swan-checkbox-input'}}\n            {{getSwitchChecked}}\"\n            style=\"color: {{__color}};\"\n            hiddenl=\"{{__type}}\"\n        ></div>\n    </swan-switch>"
            },
            "progress": {
                "behaviors": ["userTouchEvents", "noNativeBehavior"],
                "computed": {},
                "template": "<swan-progress>\n        <div class=\"progress-bar\"\n        showInfo=\"{{showInfo}}\"\n        style=\"background-color: {{backgroundColor}}\"\n        active=\"{{active}}\"\n        percent=\"{{percent}}\">\n            <div class=\"progress-inner-bar\"\n            style=\"height:{{strokeWidth + 'px'}};\n            width:{{width}};background-color:{{activeColor || color}};{{animationStyle}}\"></div>\n        </div>\n        <div style=\"{{__showInfo && __showInfo !== 'false' ? '' : 'display:none;'}}\"\n            class=\"progress-info\">\n            {{percent + '%'}}\n        </div>\n        </swan-progress>"
            },
            "movable-view": {
                "behaviors": ["userTouchEvents", "noNativeBehavior", "animateEffect"],
                "template": "<swan-movable-view\n        on-touchstart=\"onMovableViewTouchStart($event)\"\n        on-touchmove=\"onMovableViewTouchMove($event)\"\n        on-touchend=\"onMovableViewTouchEnd($event)\"\n        style=\"transform-origin: center center 0px;\n            transform: translateX({{privateData.x}}px) translateY({{privateData.y}}px) translateZ(0) scale({{privateData.scaleValue}});\n            will-change: {{privateData.changeStatus}}; transition-duration: {{privateData.transitionDuration}}s;\">\n        <slot></slot>\n    </swan-movable-view>",
                "computed": {}
            },
            "movable-area": {
                "behaviors": ["userTouchEvents", "noNativeBehavior", "animateEffect"],
                "computed": {},
                "template": "<swan-movable-area\n        on-touchstart=\"onMovableAreaTouchStart($event)\"\n        on-touchmove=\"onMovableAreaTouchMove($event)\"\n        on-touchend=\"onMovableAreaTouchEnd($event)\">\n        <slot></slot>\n    </swan-movable-area>"
            },
            "audio": {
                "computed": {},
                "template": "<swan-audio class=\"swan-audio-common {{audioShowClassName}}\"\n        id=\"{{id}}\"\n        author=\"{{author}}\"\n        name=\"{{name}}\"\n        poster=\"{{poster}}\"\n        src=\"{{src}}\"\n        controls=\"{{__controls}}\"\n        loop=\"{{__loop}}\">\n        <div class=\"swan-audio-wrapper\">\n            <div class=\"swan-audio-left\">\n                <div class=\"imgwrap\">\n                    <img s-if=\"poster && poster.length\" src=\"{{poster}}\"/>\n                    <span class=\"{{playStateClassName}}\" on-click=\"onClick($event)\"></span>\n                </div>\n                <div class=\"swan-audio-songinfo\">\n                    <p class=\"swan-audio-title\">{{name}}</p>\n                    <p class=\"swan-audio-name\">{{author}}</p>\n                </div>\n            </div>\n            <div class=\"swan-audio-right\">{{provideData.currentTime}}</div>\n        </div>\n    </swan-audio>"
            },
            "camera": {
                "behaviors": ["nativeEventEffect"],
                "template": "<swan-camera device-position=\"{{devicePosition}}\"\n        flash=\"{{flash}}\"\n        style=\"{{hiddenStyle}}\"\n        data-sanid=\"{{provideData.componentId}}\"\n    >\n        <div class=\"slot\"><slot></slot></div>\n    </swan-camera>",
                "computed": {}
            },
            "open-data": {
                "behaviors": ["userTouchEvents", "noNativeBehavior", "nativeCover"],
                "template": "<swan-open-data native=\"{{provideData.showNativeComponent}}\" isempty=\"{{provideData.isEmpty}}\">\n        <span s-ref=\"value\"\n            class=\"avatar {{provideData.showDefaultAvatar ? 'default-avatar' : ''}}\"\n            style=\"{{!!provideData.value ? 'background-image: url(' + provideData.value + ')' : ''}}\"\n            s-if=\"__type === 'userAvatarUrl'\"></span>\n        <span s-ref=\"value\"\n            class=\"text\"\n            s-else>{{provideData.value}}</span>\n    </swan-open-data>",
                "computed": {}
            },
            "animation-view": {
                "behaviors": ["nativeEventEffect", "nativeCover"],
                "computed": {},
                "template": "<swan-animation-view\n        action=\"{{__action}}\"\n        data-sanid=\"{{provideData.componentId}}\"\n    >\n        <div class=\"slot\"><slot></slot></div>\n    </swan-animation-view>"
            },
            "ad": {
                "behaviors": ["userTouchEvents", "noNativeBehavior"],
                "template": "<swan-ad>\n        <div class=\"swan-ad-content\"\n            on-touchend=\"onTouchEnd($event)\"\n            on-touchstart=\"onTouchStart($event)\"\n            on-touchmove=\"onTouchMove($event)\"\n            s-ref=\"content\"\n        >\n            <div s-if=\"rawHtml\">\n                {{rawHtml | raw}}\n            </div>\n            <div class=\"swan-ad-popover{{isMaskShow ? ' swan-ad-popover-show' : ''}}\"\n                data-event-type=\"hideMask\" on-touchmove=\"onCloseTouchMove($event)\">\n                <div s-ref=\"popBox\" class=\"swan-ad-popover-content-wrapper\" style=\"{{popBoxOffset}}\">\n                    <div class=\"swan-ad-popover-content\">\n                        <div class=\"swan-ad-popover-arrow\" style=\"left: {{popBoxArrowLeft}}px;\n                            {{popDirection ? 'bottom: -3px' : 'top: -3px'}}\"></div>\n                        <div class=\"swan-ad-popover-inner\">\n                            <div class=\"swan-ad-popover-header\">\n                                <div class=\"swan-ad-popover-header-title\">选择不喜欢的理由</div>\n                                <div class=\"swan-ad-popover-header-button\" data-event-type=\"feedbackSubmit\">\n                                    {{feedbackId ? '确定' : '不感兴趣'}}\n                                </div>\n                            </div>\n                            <div class=\"swan-ad-popover-body\">\n                                <div s-for=\"feedback in feedbackList\" class=\"swan-ad-popover-body-reason\n                                    {{feedback.selected? 'swan-ad-popover-body-reason-selected' : ''}}\"\n                                    data-event-type=\"feedback\" data-value=\"{{feedback.id}}\">{{feedback.reason}}</div>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div>{{res}}</div>\n    </swan-ad>"
            },
            "ad-fc": {
                "behaviors": ["userTouchEvents"],
                "template": "<swan-ad-fc>\n        <div s-ref=\"adFcEle\" class=\"swan-ad-fc-content\">\n            <div s-if=\"provideData.rawHtml\">\n                {{provideData.rawHtml | raw}}\n            </div>\n        </div>\n    </swan-ad-fc>",
                "computed": {}
            },
            "ar-camera": {
                "behaviors": ["nativeEventEffect"],
                "template": "<swan-ar-camera style=\"{{hiddenStyle}}\"\n        ar-key=\"{{arKey}}\"\n        ar-type=\"{{arType}}\"\n        key=\"{{key}}\"\n        type=\"{{type}}\"\n        flash=\"{{flash}}\"\n        data-sanid=\"{{provideData.componentId}}\"\n    >\n        <div class=\"slot\"><slot></slot></div>\n    </swan-ar-camera>",
                "computed": {}
            },
            "super-page": {
                "dependencies": ["swaninterface", "communicator"],
                "messages": {},
                "enviromentBinded": false,
                "slaveLoaded": noop,
                setInitData: function(params) {
                    params = Object.prototype.toString.call(params) === '[object Array]' ? params[0] : params;
                    let {value} = params;
                    for (let k in value) {
                        this.data.set(k, value[k]);
                    }
                }
            },
            "super-custom-component": {
                "behaviors": ["userTouchEvents", "noNativeBehavior"]
            },
            "track-log": {
                "behaviors": ["userTouchEvents", "noNativeBehavior", "animateEffect"],
                "template": "<swan-track-log><slot></slot></swan-track-log>"
            },
            "mask": {
                "behaviors": ["userTouchEvents", "noNativeBehavior", "animateEffect"],
                "template": "<swan-mask></swan-mask>"
            }
        };
    },
    getBehaviorDecorators: () => (behaviors, target) => {
        return target;
    }
};