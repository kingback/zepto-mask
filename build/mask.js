/**
 * 简单的遮罩层 
 * @author ningzbruc@gmail.com
 * @gitbub http://gitbub.com/kingback/zepto-mask/
 */

!(function() {
    
    var isHuaweiP6 = !!navigator.userAgent.match(/huawei(\w?|\s?|-?)p6/ig),
        doc = $(document.documentElement),
        body = $(document.body);
        
    //初始化样式
    function initStyle() {
        var stylesheet = document.createElement('style'),
            head = document.getElementsByTagName('head')[0];
            
        stylesheet.type = 'text/css';
        stylesheet.id = 'm-mask-style';
        head.insertBefore(stylesheet, head.firstChild);
        
        //默认样式为黑色
        stylesheet.appendChild(document.createTextNode('.m-mask {background:#000;}'));
        
        //华为P6bug touchmove preventDefault时不会阻止页面滚动
        if (isHuaweiP6) {
            stylesheet.appendChild(document.createTextNode('.m-mask-disable-scroll {position:relative;overflow:hidden;height:100%;}'));
        }
    }
    
    /**
     * 遮罩层
     * @class Mask
     * @constructor
     */
    function Mask() {
        this.init.apply(this, arguments);
    }
    
    /**
     * 默认模板
     * @property TEMPLATES
     * @static
     */
    Mask.TEMPLATES = {
        mask: '<div class="m-mask m-mask-hidden"></div>',
        content: '<div class="m-mask-content"></div>'
    };
    
    /**
     * 默认属性
     * @property ATTRS
     * @static
     */
    Mask.ATTRS = {
        
        /**
         * 遮罩层的动画效果
         * @attribtue easing
         * @type String 
         */
        easing: 'linear',
        
        /**
         * 遮罩层的动画时间
         * @attribtue duration
         * @type Number 
         */
        duration: 200,
        
        /**
         * 遮罩层的z-index
         * @attribtue zIndex
         * @type String|Number 
         */
        zIndex: 100,
        
        /**
         * 遮罩层的透明度
         * @attribtue opacity
         * @type String|Number 
         */
        opacity: 0.7,
        
        /**
         * 遮罩层是否使用动画
         * @attribtue useAnim
         * @type String|Number 
         */
        useAnim: false,
        
        /**
         * 遮罩层显隐性
         * @attribute visible
         * @type Boolean 
         */
        visible: false,
        
        /**
         * 是否锁住屏幕
         * @attribtue scroll
         * @type Boolean
         */
        scroll: false,
        
        /**
         * 点击Mask时隐藏 
         * @attribute clickHide
         * @type Boolean
         */
        clickHide: false,
        
        /**
         * 初始化时渲染 
         * @attribute render
         * @type Boolean
         */
        render: false,
        
        /**
         * 父节点
         * @attribute parent
         * @type String|Node 
         */
        parent: 'body',
        
        /**
         * 内容
         * @attribute content
         * @type String|Node 
         */
        content: null,
        
        /**
         * 默认class
         * @attribute defClass
         * @type String 
         */
        defClass: null,
        
        /**
         * position
         * @attribute position
         * @type String
         */
        position: 'fixed'
    };
    
    $.extend(Mask.prototype, {
        
        //--------------------------- 公有方法 ---------------------------
        
        /**
         * 初始化
         * @method init
         * @param {Object} config 初始化参数
         */
        init: function(config) {
            var render;
            
            this.rendered = false;
            this.destroyed = false;
            
            //合并参数
            this._config = $.extend({}, Mask.ATTRS, config);
            
            //渲染
            if ((render = this.config('render'))) {
                this.render(render);
            }
        },
        
        /**
         * 销毁
         * @method destroy
         * @chainable
         * @public
         */
        destroy: function() {
            
            if (this.rendered && !this.destroyed) {
                this.mask.off();
                this.mask.remove();
                
                delete this.mask;
                delete this.content;
                delete this.parent;
            }
            
            delete this._config;
            
            this.destroyed = true;
            
            return this;
        },
        
        /**
         * 设置参数
         * @method config
         * @param {String|Object} name 参数名或参数对象
         * @param {Any} value 参数值
         * @public
         */
        config: function(name, value) {
            if (typeof name === 'string') {
                if (typeof value === 'undefined') {
                    return this._config[name];
                } else {
                    this._config[name] = value;
                }
            } else if (name)  {
                this._config = $.extend(this._config, name);
            }
            
            return this._config;
        },
        
        /**
         * 渲染
         * @method render
         * @chainable
         * @public
         */
        render: function(parent) {
            if (this.rendered) { return this; }
            
            this.renderUI(parent);
            this.bindUI();
            this.syncUI();
            
            this.rendered = true;
            
            return this; 
        },
        
        /**
         * 渲染UI
         * @method renderUI
         * @public
         */
        renderUI: function(parent) {
            var config = this.config(),
                parent = $((parent && parent !== true) ? parent : config.parent),
                mask = $(Mask.TEMPLATES.mask),
                content = config.content ? $(Mask.TEMPLATES.content) : null;
            
            //添加样式
            mask.css({
                'width': '100%',
                'height': '100%',
                'left': '0',
                'top': '0',
                'opacity': '0',
                'display': 'none',
                'position': config.position,
                'z-index': Number(config.zIndex)
            });
            
            //添加class
            if (config.defClass) {
                mask.addClass(config.defClass);
            }
            
            //添加内容
            if (content) {
                content.append(config.content);
                mask.append(content);
            }
            
            //插入文档
            parent.append(mask);
            
            //添加属性
            this.mask = mask;
            this.parent = parent;
            this.content = content;
            
            return this;
        },
        
        /**
         * 绑定UI事件
         * @method bindUI
         * @public
         */
        bindUI: function() {
            if (this.config('clickHide')) {
                this.mask.on('click', $.proxy(function() {
                    this.hide();
                }, this));
            }
        },
        
        /**
         * 更新UI状态
         * @method syncUI
         * @public
         */
        syncUI: function() {
            
            //如果初始化时设置展示
            //直接展示，不使用动画
            if (this.config('visible')) {
                this._show(false);
            }
        },
        
        /**
         * 展示遮罩层
         * @method show
         * @param {Boolean} useAnim 是否使用动画
         * @chainable
         * @public
         */
        show: function(useAnim) {
            return this.setVisible(true, useAnim);
        },
        
        /**
         * 隐藏遮罩层
         * @method hide
         * @param {Boolean} useAnim 是否使用动画
         * @chainable
         * @public
         */
        hide: function(useAnim) {
            return this.setVisible(false, useAnim);
        },
        
        /**
         * 切换遮罩层显隐性
         * @method toggle
         * @param {Boolean} useAnim 是否使用动画
         * @chainable
         * @public
         */
        toggle: function(useAnim) {
            return this.setVisible(!this.config('visible'), useAnim);
        },
        
        /**
         * 设置遮罩层显隐性
         * @method setVisible
         * @param {Boolean} visible 显隐性
         * @param {Boolean} useAnim 是否使用动画
         * @chainable
         * @public
         */
        setVisible: function(visible, useAnim) {
            var config = this.config(),
                prevVal = config.visible,
                newVal = !!visible;
                
            if (prevVal !== newVal) {
                
                //设置属性
                config.visible = newVal;
                
                //执行动作
                this[newVal ? '_show' : '_hide'](useAnim);
            }
            
            return this;
        },
        
        /**
         * 设置阻止页面滚动
         * @method disableScroll
         * @chainable
         * @public
         */
        disableScroll: function() {
            doc.off('touchmove', this._preventScroll);
            doc.on('touchmove', this._preventScroll);
            
            if (isHuaweiP6) {
                doc.addClass('m-mask-disable-scroll');
                body.addClass('m-mask-disable-scroll');
            }
            
            return this;
        },
        
        /**
         * 设置允许页面滚动
         * @method enableScroll
         * @chainable
         * @public
         */
        enableScroll: function() {
            doc.off('touchmove', this._preventScroll);
            
            if (isHuaweiP6) {
                doc.removeClass('m-mask-disable-scroll');
                body.removeClass('m-mask-disable-scroll');
            }
            
            return this;
        },
        
        //--------------------------- 私有方法 ---------------------------
        
        /**
         * 展示遮罩层
         * @method _show
         * @param {Boolean} useAnim 是否使用动画
         * @protected
         */
        _show: function(useAnim) {
            if (!this.mask) { this.render(); }
            this._handleVisibleChange(useAnim);
        },
        
        /**
         * 隐藏遮罩层
         * @method _hide
         * @param {Boolean} useAnim 是否使用动画
         * @protected
         */
        _hide: function(useAnim) {
            if (!this.mask) { return; }
            this._handleVisibleChange(useAnim);
        },
        
        /**
         * 遮罩层显隐性变化
         * @method _uiVisibleChange
         * @param {Boolean} useAnim 是否使用动画
         * @protected
         */
        _handleVisibleChange: function(useAnim) {
            var _this = this,
                config = this.config(),
                visible = config.visible,
                useAnim = typeof useAnim === 'undefined' ? config.useAnim : !!useAnim,
                cssCfg = { opacity: visible ? config.opacity : 0 };
            
            function end() {
                !visible && _this.mask.hide();
                !scroll && _this[visible ? 'disableScroll' : 'enableScroll']();
                
                //触发事件
                _this.mask.trigger('afterVisibleChange', {
                    visible: visible,
                    useAnim: useAnim
                });
            }
            
            //触发事件
            _this.mask.trigger('visibleChange', {
                visible: visible,
                useAnim: useAnim
            });
            
            visible && _this.mask.show();
            _this.mask.toggleClass('m-mask-hidden', !visible);
                
            if (useAnim && this.mask.animate) {
                
                //动画
                this.mask.animate(cssCfg, config.duration, config.easing, end);
            } else {
                
                //无动画
                this.mask.css(cssCfg);
                end();
            }
        },
        
        /**
         * 阻止动画滚动
         * @method _preventScroll
         * @protected
         */
        _preventScroll: function(e) {
            e.preventDefault();
        }
        
    });
    
    initStyle();
    
    window.ZeptoMask = Mask;
    
})();