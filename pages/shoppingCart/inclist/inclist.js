// inclist.js
// 获取应用实例
var app = getApp()
import { appendParamForUrl } from '../../../utils/util'

let pageConfig = {
  data: {
    
  }, 
  // 数据缓存区
  store: {
    url: {
      // 购物车详情
      shoppingCartUrl: app.globalData.isDebug ? 'shoppingCart' : '/wechatapp/cart/index',
      // 添加默认地址
      addAddressUrl: app.globalData.isDebug ? 'addAddress' : '/wechatapp/address/add',
      // 下单接口
      addOrderUrl: app.globalData.isDebug ? 'addOrder' : '/wechatapp/order/add',
      // 换购商品列表
      inclistUrl: app.globalData.isDebug ? 'inclist' : '/wechatapp/goods/inclist',
    },
    // 默认地址ID
    addressId: null
  },
  onLoad(){
    let _this = this;

    // 地址参数处理
    appendParamForUrl(_this.store['url'], {
      sso: app.globalData.sso
    });
  },
  onShow: function () {
    let _this = this;

    
  }
}

Page(pageConfig)
