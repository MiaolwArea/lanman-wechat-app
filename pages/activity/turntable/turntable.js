// turntable.js
let app = getApp()

Page({
  data: {
    lottery: []       // 放奖品
  },
  // 数据缓存区
  store: {
    url: {
      // 商品详情
      goodsDetialUrl: app.globalData.isDebug ? 'goodsDetial' : '/wechatapp/goods/detail',
    },
    canRoll: true,  // 加控制，防止用户点击两次
    num: 1,         // 用在动画上，让用户在第二次点击的时候可以接着上次转动的角度继续转
    lotteryArrLen: 0, // 放奖品的数组的长度
  },
  onLoad(opt) {
    this._setPlateData(); 
    let that = this;
    let aniData = wx.createAnimation({ 
      duration: 2000,
      timingFunction: 'ease'
    });
    this.aniData = aniData; 
  },
  //设置奖品数组, 表盘文字
  _setPlateData() { 
    let _this = this
      , lottery = ['奖品1', '奖品2', '奖品3奖品3'];

    // TODO 获取奖品
    // app.ApiConfig.ajax(_this.store['url'].goodsDetialUrl, function (res) {
    //   if(res.success){
    //     lottery = res.data;
    //   }
    // });
    _this.store['lotteryArrLen'] = lottery.length; //获取奖品数组的长度，用来判断
    if (_this.store['lotteryArrLen'] < 2) { //数组的奖品只有一个，扩展数组的长度到4
      let evenArr = new Array(4); 
      for (let i = 0; i < 4; i++) {
        if (i % 2 == 1) { //这里为什么要取1是为了在默认的界面将指针放在谢谢的地方，防止别人拿着中奖的截图来要奖品
          evenArr[i] = lottery[0]; 
        } else {
          evenArr[i] = '谢谢' 
        }
      }
      lottery = [...evenArr]; 
    } else { 
      let dataLen = 0; //用来放原来数组的索引
      let evenArr = new Array(_this.store['lotteryArrLen'] * 2); 
      for (let i = 0; i < (_this.store['lotteryArrLen'] * 2); i++) {
        if (i % 2 == 1) {
          evenArr[i] = lottery[dataLen]; 
          dataLen++; //原来数组的索引加一
        } else {
          evenArr[i] = '谢谢'
        }
      }
      lottery = [...evenArr]; 
    }

    _this.store['lotteryArrLen'] = lottery.length; //获取新的数组长度
    this.setData({
      lottery: lottery //设置好值，用于页面展示
    })
  },
  startRollTap() { //开始转盘
    let _this = this;

    if (_this.store['canRoll']) {
      _this.store['canRoll'] = false;
      let aniData = this.aniData; //获取this对象上的动画对象
      let rightNum = ~~(Math.random() * _this.store['lotteryArrLen']); //生成随机数
      console.log(`随机数是${rightNum}`);
      console.log(`奖品是：${_this.data.lottery[rightNum]}`);
      aniData.rotate(3600 * _this.store['num'] - 360 / _this.store['lotteryArrLen'] * rightNum).step(); //设置转动的圈数
      this.setData({
        aniData: aniData.export()
      })
      _this.store['num']++;
      _this.store['canRoll'] = true;
    }
  }
})
