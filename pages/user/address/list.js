//address.js
//获取应用实例
let app = getApp();

let pageConfig = {
  data: {
    userInfo: {},
    address: [],
    hasAddress: true,
    choose: false
  },
  // 数据缓存区
  store: {
    url: {
      // 地址列表
      addressListUrl: app.globalData.isDebug ? 'address' : '/wechatapp/address/list',
      // 删除地址
      delAddressUrl: app.globalData.isDebug ? 'delAddress' : '/wechatapp/address/del',
      // 添加地址
      addAddressUrl: app.globalData.isDebug ? 'addAddress' : '/wechatapp/address/add',
      // 设置默认地址
      setDefaultAddressUrl: app.globalData.isDebug ? 'setAddress' : '/wechatapp/address/default',
      // 更改下单地址
      changeMoneyUrl: app.globalData.isDebug ? 'addOrder' : '/wechatapp/order/confirm',
    }
  },
  onLoad(opt){
    let _this = this;

    if (app.globalData.userInfo) {
      _this.setData({
        userInfo: app.globalData.userInfo
      })
    }
    if(opt.choose){
      this.setData({
        choose: true
      })
    }
  },
  onShow: function () {
    let _this = this;
    
    // 获取初始化数据 
    app.ApiConfig.ajax(_this.store['url'].addressListUrl, function (res) {
      if (res.success) {
        if (res.data.length == 0){
          _this.setData({
            hasAddress: false
          });
          return;
        }
        _this.setData({
          address: res.data
        })
      }
    });
  },
  // 事件处理函数
  // 设置默认地址
  radioChange(e) {
    let _this = this
      , address = _this.data.address;

    app.ApiConfig.ajax(_this.store['url'].setDefaultAddressUrl, {
      address_id: e.detail.value
    }, function (res) {
      if (res.success) {
        for (let i = 0; i < address.length; i++){
          if (parseInt(address[i].address_id) == e.detail.value){
            address[i].is_default = 1;
          }else{
            address[i].is_default = 0;
          }
        }
        _this.setData({
          address: address
        })
      }
    }, 'POST');
  },
  chooseAdress(e){
    let _this = this
      , pages = getCurrentPages()
      , prevPage = pages[pages.length - 2]
      , address_id = e.currentTarget.dataset.address_id;
    
    if(_this.data.choose){
      prevPage.store['addressId'] = address_id;
      wx.navigateBack({
        delta: 1
      })
    }
  },
  // 删除地址
  delAddress(e) {
    let _this = this
      , dataset = e.currentTarget.dataset
      , address = _this.data.address;
    
    if (dataset.isdefault == 0) {
      app.ApiConfig.ajax(_this.store['url'].delAddressUrl, {
        address_id: dataset.id
      }, function (res) {
        if (res.success) {
          _this.setData({
            address: app.delElm({ address_id: dataset.id }, address)
          })
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 1000
          })
        }
      }, 'POST');
    } else {
      wx.showModal({
        title: '',
        content: '默认地址不能删除！',
        confirmColor: '#000',
        showCancel: false
      })
    }
  },
  // 导入微信地址
  importAddress(e){
    let wechatAddress = []
      , _this = this;

    wx.chooseAddress({
      success: function (res) {
        if (res.errMsg = "chooseAddress:ok") {
          // 同时存为默认地址到后台
          app.ApiConfig.ajax(_this.store['url'].addAddressUrl, {
            city: res.cityName,
            province: res.provinceName,
            district: res.countyName,
            consignee: res.userName,
            address: res.detailInfo,
            mobile: res.telNumber
          }, function (resInfo) {
            wechatAddress.push({
              address_id: resInfo.data.address_id,
              consignee: res.userName,
              mobile: res.telNumber,
              province: res.provinceName,
              city: res.cityName,
              district: res.countyName,
              address: res.detailInfo,
              is_default: 0
            });
            _this.setData({
              address: _this.data.address.concat(wechatAddress)
            });
          }, 'POST')
        }
      }
    })
  }
}

Page(pageConfig)
