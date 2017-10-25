//address.js
//获取应用实例
let app = getApp();
import { appendParamForUrl } from '../../../utils/util'
let editId = null;

let pageConfig = {
  data: {
    customItem: "全部",
    userInfo: {},
    address: [],
    isEdit: false,
    region: [],
    addressInfo: {}
  },
  // 数据缓存区
  store: {
    url: {
      addressUrl: app.globalData.isDebug ? 'address' : '/wechatapp/address/list',
      delAddressUrl: app.globalData.isDebug ? 'delAddress' : '/wechatapp/address/del',
      editAddressUrl: app.globalData.isDebug ? 'editAddress' : '/wechatapp/address/edit',
    }
  },
  onLoad: function () {
    let _this = this;

    if (app.globalData.userInfo) {
      _this.setData({
        userInfo: app.globalData.userInfo
      })
    }
    // 地址参数处理
    appendParamForUrl(_this.store['url'], {
      sso: app.globalData.sso
    });
    // 获取初始化数据 
    app.ApiConfig.ajax(_this.store['url'].addressUrl, function (res) {
      if (res.success) {
        _this.setData({
          address: res.data
        })
      }
    });

  },
  //事件处理函数
  // 设置默认地址
  radioChange(e) {
    // app.ApiConfig.ajax('setAddress', {
    //   id: e.detail.value
    // }, function (res) {
    //   if (res) {
    //     _this.setData({
    //       address: res
    //     })
    //   }
    // });
  },
  // 删除地址
  delAddress(e) {
    let dataset = e.target.dataset;

    if (dataset.isdefault == 0) {
      // app.ApiConfig.ajax('delAddress', {
      //   id: e.target.dataset.id
      // }, function (res) {
      //   if (res) {
      //     wx.showModal({
      //       title: '',
      //       content: '删除成功！',
      //       showCancel: false
      //     })
      //   }
      // });
    } else {
      wx.showModal({
        title: '',
        content: '默认地址不能删除！',
        showCancel: false
      })
    }
  },
  // 编辑地址详细信息
  editAddress(e) {
    let _this = this;
    editId = e.target.dataset.id;

    if (editId) {
      app.ApiConfig.ajax('getAddressInfo?id=' + editId, function (res) {
        if (res) {
          _this.setData({
            addressInfo: res,
            region: [res.province, res.city, res.district]
          })
        }
      })
    }
    _this.setData({
      isEdit: true
    })
  },
  // 导入微信地址
  importAddress(e){
    let wechatAddress = [];

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
              mobile: res.mobile,
              adress_info: res.provinceName + res.cityName + res.countyName + res.detailInfo,
              is_default: 0
            });
            _this.setData({
              address: wechatAddress
            });
          }, 'POST')
        }
      }
    })
  },
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
    let dataObj = e.detail.value
      , region = this.data.region;

    dataObj.province = region[0];
    dataObj.city = region[1];
    dataObj.district = region[2];
    if (editId) {
      dataObj.id = editId;
    }
    console.log(dataObj);
    // app.ApiConfig.ajax('postAddressInfo', dataObj, function (res) {
    //   if (res) {

    //   }
    // })
  }
}

Page(pageConfig)
