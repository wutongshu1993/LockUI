# LockUI
手机解锁UI组件
## 实现思路
用canvas实现绘图，分为以下几个步骤：

1. 初始化页面DOM元素
2. 初始化面板（initCirclePosition），根据屏幕大小计算半径大小，并用数组arr记录每个圆圈的圆心坐标。这里需要注意的是，为了不和边界重合，圆心需要有一点偏移。
3. 整个组件的核心在于为canvas绑定监听事件，这里要维护两个数组，lastPoint记录划过了哪些点，restPoint记录还有哪些点没有划过。为什么会需要两个数组呢？因为touchmove事件会反复触发，所以给lastPoint中添加的点不能是直接从arr中添加，而应该从restPoint中进行添加，这样才不会重复添加。监听canvas的核心在于对事件touchmove的监听，在touchmove中需要不断调用update方法更新UI界面。在touchend中进行逻辑判断。
4. 逻辑判断，定义了三种状态，
	- step=0：第一次设置密码----->这里需要对密码是否小于5进行判断。符合规则则保存如firstPass中，并将step置为1。
	- step=1：第二次设置密码----->需要对前后两次密码是否一致进行判断。设置成功则将密码存入localstorage中
	- setp=2: 验证密码---->对localstorage中存的密码和当前的密码进行比较。

默认进入的时候是选中的‘设置密码’，因此状态为step=0，当选中‘验证密码’的时候，状态变为step=2.

这里需要注意的是，每一次canvas的touchStart开始的时候，都需要将lastPoint置为空，并将restPoint置为arr中的值。

