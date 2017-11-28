// inclist.js
// 获取应用实例
var app = getApp()
import { appendParamForUrl } from '../../../utils/util'

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
    incpriceInfo: wx.getStorageSync('incpriceInfo') || {
      price: 0.00,
      num: 0
    }
  },
  onLoad(){
    let _this = this;

    // wx.clearStorage();
    // 地址参数处理
    appendParamForUrl(_this.store['url'], {
      sso: app.globalData.sso
    });
    app.ApiConfig.ajax(_this.store['url'].inclistUrl, function (res) {
      if (res.success) {
        let inclist = res.data
          , idAry = wx.getStorageSync('incpriceIds') || {}
          , num = _this.store['incpriceInfo']['num'];

        _this.setData({
          inclist: inclist
        });
        for (let i = 0; i < inclist.length; i++) {
          if (idAry[inclist[i].incprice_id] === undefined) {
            idAry[inclist[i].incprice_id] = false;
          }
        }
        _this.setData({
          idAryMap: idAry,
          chooseNum: num
        });
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

    if (isSelected){
      _this.store['incpriceInfo']['price'] += parseFloat(price);
      _this.store['incpriceInfo']['num']++;
    }else{
      _this.store['incpriceInfo']['price'] -= parseFloat(price);
      _this.store['incpriceInfo']['num']--;
    }
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
  inclistSure(){
    let _this = this;

    wx.setStorageSync('incpriceIds', _this.data.idAryMap);
    wx.setStorageSync('incpriceInfo', _this.store['incpriceInfo']);
    wx.navigateBack({
      delta: 1
    })
  }
}

Page(pageConfig)
