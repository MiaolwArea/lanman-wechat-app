// inclist.js
// 获取应用实例
var app = getApp()

let pageConfig = {
  data: {
    inclist: null,
    idAryMap: {},
    chooseNum: 0
  }, 
  // 数据缓存区
  store: {
    url: {
      // 换购商品列表
      inclistUrl: app.globalData.isDebug ? 'shoppingCart' : '/wechatapp/goods/inclist',
    },
    priceAry: ''
  },
  onLoad(){
    let _this = this;

    wx.showLoading({
      mask: true,
    })
    app.ApiConfig.ajax(_this.store['url'].inclistUrl, function (res) {
      if (res.success) {
        let inclist = res.data
          , idAry = wx.getStorageSync('incpriceIds') || {}
          , priceAry = {}
          , num = 0;
        
        _this.setData({
          inclist: inclist
        });
        for (let i = 0; i < inclist.length; i++) {
          priceAry[inclist[i].incprice_id] = inclist[i].price;
          if (idAry[inclist[i].incprice_id] === undefined) {
            idAry[inclist[i].incprice_id] = false;
          }
        }
        
        Object.keys(idAry).forEach((attr, index) => {
          attr /= 1;
          if (priceAry[attr] == undefined){
            delete idAry[attr];
          }
          if (idAry[attr]){
            num++;
          }
        });
        _this.setData({
          idAryMap: idAry,
          chooseNum: num
        });
        _this.store['priceAry'] = priceAry;
        wx.hideLoading();
      }
    })
  },
  // 单选
  changeSelected(e) {
    let _this = this
      , idAryMap = _this.data.idAryMap
      , incpriceId = e.currentTarget.dataset['incprice_id']
      , price = e.currentTarget.dataset.price
      , isSelected = !_this.data.idAryMap[incpriceId];
    
    idAryMap[incpriceId] = isSelected;
    _this.setData({
      idAryMap: idAryMap
    });
  },
  checkboxchange(e){
    this.setData({
      chooseNum: e.detail.value.length
    });
  },
  // 确认
  inclistSure(){
    let _this = this
      , idAry = _this.data.idAryMap
      , incpriceInfo = {}
      , num = 0
      , price = 0;
    
    Object.keys(idAry).forEach((attr, index) => {
      attr /= 1; 
      if (idAry[attr]) {
        _this.store['priceAry'][attr] /= 1;
        price += _this.store['priceAry'][attr]
        num++;
      }
    });
    wx.setStorageSync('incpriceIds', _this.data.idAryMap);
    wx.setStorageSync('incpriceInfo', {
      price: price,
      num: num
    });
    wx.navigateBack({
      delta: 1
    })
  }
}

Page(pageConfig)
