## ZeptoMask

> 一个简单的遮罩层组件

### 使用方法
    
    //初始化/渲染/销毁
    var mask = new ZeptoMask();
    mask.render();
    mask.destroy();
    
    //展示/隐藏反转
    mask.show();
    mask.hide();
    mask.toggle();
    
    //使用动画
    mask.show(true);
    mask.hide(true);
    mask.toggle(true);
    
    //配置参数
    //以下为默认参数
    new ZeptoMask({
        easing: 'linear', //动画效果
        duration: 200, //动画时间
        zIndex: 100, //z-index
        opacity: 0.7, //透明度
        useAnim: false, //使用动画
        visible: false, //是否展示
        scroll: false, //是否支持页面滚动
        clickHide: false, //点击关闭
        render: false, //初始化时是否直接渲染
        parent: 'body', //父节点
        content: null, //内容
        defClass: null, //默认添加的class
        position: 'fixed' //position
    });
    
    //获取/设置参数
    this.config('useAnim'); //获取useAnim参数
    this.config('useAnim', true); //设置useAnim参数
    this.config({ useAnim: true, duration: 300 }) //设置多个参数
    this.config(); //获取所有参数对象
    this.config().useAnim; //获取useAnim参数
    
    //更多渲染方法
    new Mask({ render: '#container' });
    mask.render('#container');
    
    //节点
    mask.parent //父节点
    mask.mask //遮罩层节点
    mask.content //内容节点
    
    //事件
    //切换前
    mask.mask.on('visibleChange', function(e) {
        console.log(data.visible);
        console.log(data.useAnim);
    });
    
    //切换完成（使用动画的话，在动画结束后触发）
    mask.mask.on('afterVisibleChange', function(e) {
        console.log(data.visible);
        console.log(data.useAnim);
    });
