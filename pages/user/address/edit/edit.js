// address_edit.js
// 获取应用实例
let app = getApp();
import { appendParamForUrl } from '../../../../utils/util'

let pageConfig = {
  data: {
    customItem: "全部",
    region: [],
    addressInfo: {},
    
  },
  // 数据缓存区
  store: {
    url: {
      // 编辑地址
      editAddressUrl: app.globalData.isDebug ? 'editAddress' : '/wechatapp/address/edit',
      // 添加地址
      addAddressUrl: app.globalData.isDebug ? 'addAddress' : '/wechatapp/address/add',
      // 地址详情
      addressDetailUrl: app.globalData.isDebug ? 'addressDetail' : '/wechatapp/address/detail',
    },
    // 编辑地址ID
    editId: null
  },
  onLoad: function (opt) {
    let _this = this;
    
    _this.store['editId'] = opt.address_id;
    // 地址参数处理
    appendParamForUrl(_this.store['url'], {
      sso: app.globalData.sso
    });
    // 获取初始化数据 
    app.ApiConfig.ajax(_this.store['url'].addressDetailUrl + '&address_id=' + _this.store['editId'], function (res) {
      if (res.success) {
        _this.setData({
          addressInfo: res.data,
          region: [res.data.province, res.data.city, res.data.district],
        })
      }
    });
  },
  // 事件处理函数
  // 地区选择
  bindChange(e) {
    let cityAry = e.detail.value
      , customItem = this.data.customItem;

    for (let i = 0; i < cityAry.length; i++) {
      if (cityAry[i] == customItem) {
        cityAry[i] = '';
      }
    }
    this.setData({
      region: cityAry
    })
  },
  // 保存
  formSubmit(e) {
    let _this = this
      , dataObj = e.detail.value
      , region = _this.data.region
      , url;

    if (_this.store['editId']) {
      dataObj.address_id = _this.store['editId'];
      url = _this.store['url'].editAddressUrl;
    }else{
      url = _this.store['url'].addAddressUrl
    }
    app.ApiConfig.ajax(url, {
      city: region[1],
      province: region[0],
      district: region[2],
      ...dataObj
    }, function (resInfo) {
      if (resInfo.success) {
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 1000
        });
        setTimeout(function(){
          wx.redirectTo({
            url: '../list'
          })
        }, 1000)
      }
    }, 'POST')
  }
}

Page(pageConfig)
