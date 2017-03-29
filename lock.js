/**
 * Created by lh on 2017/3/28.
 */
(function () {
    window.Lock = function (obj) {
        this.chooseType = obj.chooseType;//设置解锁的是n*n矩阵
    };
    Lock.prototype.init = function () {
        this.initDOM();
        this.pswObj = window.localStorage.getItem('passwordlk')?{
            step: 0,
            password : JSON.parse(window.localStorage.getItem('passwordlk'))
        }:{step: 0};
        // console.log(this.pswObj);
        this.lastPoint = [];
        this.restPoint = [];///////////////
        this.touchFlag = false;
        this.canvas = document.getElementById('lockCanvas');
        this.ctx = this.canvas.getContext('2d');

        //初始化圆圈
        this.initCirclePosition();
        this.bindType();
        this.bindTouchEvent();
    };
    Lock.prototype.initDOM = function () {
        var wrap = document.createElement("div");
        wrap.setAttribute('class','wrap');
        var content = '<h3>手势密码</h3>' +
            '<canvas id="lockCanvas" width="300" height="300" class="lockCanvas"></canvas>' +
            '<br/><span id="msg">请输入手势密码</span>' +
            '<div class="radioRect" id="radioList">' +
            '<input type="radio" id="resetPass" name="lockType" value="resetPass" checked ="checked"/><label for="resetPass">设置密码</label>' +
            '<br><input type="radio" id="checkPass" name="lockType" value="checkPass" /><label for="checkPass">验证密码</label>' +
            '</div>' ;
        wrap.innerHTML = content;
        document.body.appendChild(wrap);
    };


    /**
     *根据坐标位置绘制一个圆圈
     * @param x
     * @param y
     */
    Lock.prototype.drawCircle = function (x, y) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#aaaaaa';
        this.ctx.lineWidth = 2;
        this.ctx.arc(x, y,this.r, 0, 2 * Math.PI, false );
        this.ctx.stroke();
        this.ctx.fillStyle = '#eeeeee'
        this.ctx.fill();
        this.ctx.restore();
    };
    /**
     * 计算每个圆圈的坐标，并且初始化圆圈
     */
    Lock.prototype.initCirclePosition = function () {
        var n = this.chooseType;
        var count = 0;
        this.r = this.ctx.canvas.width / (2 * n ) /  2;
        var r = this.r;
        // console.log(r);
        this.arr = [];//存储圆心的坐标
        for(var i = 0; i < n; i++ ){
            for(var j = 0; j < n; j++){
                count++;
                var obj = {
                    x : i * 4 * r + 2 * r,
                    y : j * 4 * r + 2 * r,
                    index : count
                };
                this.arr.push(obj);
                this.restPoint.push(obj);
            }
        }
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        //画圆
        for(var i = 0; i < this.arr.length; i++){
            this.drawCircle(this.arr[i].x, this.arr[i].y);
        }

    };

    //给单选按钮设置状态
    Lock.prototype.bindType = function () {
        var self = this;
        var radioList = document.getElementsByName('lockType');
        for(var i = 0; i < radioList.length; i++){
           /* radioList[i].removeEventListener('click', handler);
            radioList[i].addEventListener('click', handler.bind(this));*/
           radioList[i].addEventListener('click', function (e) {
               if(e.target.checked){//如果选中
                   if(e.target.value == 'resetPass'){
                       document.getElementById('msg').innerHTML = '请设置密码';
                       self.pswObj.step = 0;//第一次设置密码
                       self.lastPoint = [];
                       self.pswObj.firstPass = [];
                   }
                   else {
                       document.getElementById('msg').innerHTML = '请输入解锁密码';
                       console.log(Lock.prototype.pswObj);
                       self.pswObj.step = 2;//解锁密码
                   }
               }
           })

        }
    };
    /**
     * 获取点击点相对于canvas的坐标
     * @param e
     */
    Lock.prototype.getPosition = function (e) {
        var rect = e.currentTarget.getBoundingClientRect();
        var pos = {
            x : e.touches[0].clientX - rect.left,
            y : e.touches[0].clientY - rect.top
        };
        return pos;
    };
    /**
     * 绘制划过的圆圈的样式
     */
    Lock.prototype.drawPoint = function () {
        // console.log(this.lastPoint);
        for(var i = 0; i < this.lastPoint.length; i++){
            this.ctx.save();
            this.ctx.fillStyle = 'orange';
            this.ctx.strokeStyle = 'red';
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r, 0, 2 * Math.PI, false);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
            this.ctx.restore();

        }
    };
    /**
     * 绘制划过的线条的样式
     * @param po
     * @param lastPoint
     */
    Lock.prototype.drawLine = function (po, lastPoint) {
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.strokeStyle = 'red';
                this.ctx.lineWidth = 3;
                this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);
                for(var i = 1; i < lastPoint.length; i++){
                    this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
                }
                if(po !== undefined){
                    this.ctx.lineTo(po.x, po.y);
                }

                this.ctx.stroke();
                this.ctx.closePath();
                this.ctx.restore();
    };
    Lock.prototype.update = function (po) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for(var i = 0; i < this.arr.length; i++){//先把默认的圆圈画出来
            this.drawCircle(this.arr[i].x, this.arr[i].y);
        }
        this.drawPoint();//画选中的圆圈
        this.drawLine(po, this.lastPoint);
        var self = this;
        // console.log(self.arr.length)
        for(var i = 0; i < self.restPoint.length; i++){
            if(po !== undefined){
                if(Math.abs(po.x - self.restPoint[i].x) < self.r && Math.abs(po.y - self.restPoint[i].y) < self.r){
                    self.drawPoint();
                    self.lastPoint.push(self.restPoint[i]);
                    self.restPoint.splice(i, 1);
                    break;
                }
            }

        }
    };
    /**
     * touchend结束之后对密码和状态的修改
     * @param psw
     */
    Lock.prototype.storePass = function (psw) {
        if (this.pswObj.step == 0){//第一次绘制密码
            // console.log(psw.length);
            // console.log(psw);
            if(psw.length < 5){
                document.getElementById('msg').innerHTML = '密码太短，至少需要5个点';
                /*this.lastPoint = [];
                this.restPoint = new Array(this.arr);*/
            }
            else {
                this.pswObj.step = 1;
                this.pswObj.firstPass = psw;
                document.getElementById('msg').innerHTML = '请再次输入';//需要清空页面痕迹
            }

        }
        else if(this.pswObj.step == 1){//第二次绘制密码，需要检查密码是否和第一次一致
            if(this.checkPass(this.pswObj.firstPass, psw)){
                this.pswObj.truePass = psw;
                document.getElementById('msg').innerHTML = '密码设置成功';
                window.localStorage.setItem('passwordlk', JSON.stringify(this.pswObj.truePass));
                window.localStorage.setItem('chooseType', this.chooseType);
            }
            else {
                document.getElementById('msg').innerHTML = '两次输入不一致';
                // this.pswObj.step = 0;
            }
        }
        else if(this.pswObj.step == 2){
            if(window.localStorage.getItem('passwordlk')== null){
                document.getElementById('msg').innerHTML = '请先设置密码！';
                document.getElementById('resetPass').checked = 'checked';
                this.pswObj.step = 0;
            }
            else {
                if(this.checkPass(JSON.parse(window.localStorage.getItem('passwordlk')), psw)){
                    document.getElementById('msg').innerHTML = '密码正确！';
                }
                else {
                    document.getElementById('msg').innerHTML = '输入密码不正确';
                }
            }
        }

    };
    /**
     * 比较两个密码是否一致
     * @param pwd1
     * @param pwd2
     * @returns {boolean}
     */
    Lock.prototype.checkPass = function (pwd1, pwd2) {
        if(pwd1.length != pwd2.length){
            return false;
        };
        var len = pwd2.length;
        for(var i = 0; i < len; i++ ){
            if(pwd1[i].x !== pwd2[i].x || pwd1[i].y !== pwd2[i].y ){
                return false;
            }
        }
        return true;
    };

    Lock.prototype.reset = function () {
        this.initCirclePosition();
    }
    /**
     * 给canvas绑定绘制手势
     */
    Lock.prototype.bindTouchEvent = function () {
        var self = this;
        this.canvas.addEventListener('touchstart', function (e) {
            e.preventDefault();//取消默认的事件
            var pos = self.getPosition(e);
            // console.log(pos);
            self.lastPoint = [];
            self.restPoint = self.arr.concat();
            for(var i = 0; i < self.arr.length; i++){
                if(Math.abs(pos.x - self.arr[i].x) < self.r && Math.abs(pos.y - self.arr[i].y) < self.r){
                    self.touchFlag = true;//设置触碰到圆圈为真
                    self.drawPoint();
                    self.lastPoint.push(self.arr[i]);
                    console.log(self.lastPoint);
                    self.restPoint.splice(i, 1);//如果该点已经划过了，就不能再划第二次了，然后在update中，如果该点还没有划过，此时才把该点加入到lastpoint中
                }
            }
        });
        this.canvas.addEventListener('touchmove', function (e) {
            if(self.touchFlag){
                self.update(self.getPosition(e));
            }
        });
        this.canvas.addEventListener('touchend', function (e) {
            console.log('end')
            console.log(self.lastPoint);
            if(self.touchFlag){
                self.touchFlag = false;
                self.update();
                self.storePass(self.lastPoint);
                setTimeout(function () {
                    self.reset();
                    self.lastPoint = [];
                    self.restPoint = self.arr.concat();
                }, 2000)
            }
        })
    }


})();
