//address.js
//获取应用实例
let app = getApp();
import { appendParamForUrl } from '../../../utils/util'

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
      // 地址列表
      addressListUrl: app.globalData.isDebug ? 'address' : '/wechatapp/address/list',
      // 删除地址
      delAddressUrl: app.globalData.isDebug ? 'delAddress' : '/wechatapp/address/del',
      // 编辑地址
      editAddressUrl: app.globalData.isDebug ? 'editAddress' : '/wechatapp/address/edit',
      // 添加地址
      addAddressUrl: app.globalData.isDebug ? 'addAddress' : '/wechatapp/address/add',
      // 设置默认地址
      setDefaultAddressUrl: app.globalData.isDebug ? 'setAddress' : '/wechatapp/address/default'
    },
    // 编辑地址ID
    editId: null
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
    app.ApiConfig.ajax(_this.store['url'].addressListUrl, function (res) {
      if (res.success) {
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
  // 删除地址
  delAddress(e) {
    let _this = this
      , dataset = e.target.dataset
      , address = _this.data.address;

    if (dataset.isdefault == 0) {
      app.ApiConfig.ajax(_this.store['url'].delAddressUrl, {
        address_id: e.target.dataset.id
      }, function (res) {
        if (res.success) {
          _this.setData({
            address: app.delElm({ address_id: e.target.dataset.id }, address)
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
        showCancel: false
      })
    }
  },
  // 编辑地址详细信息
  editAddress(e) {
    let _this = this
      , address = _this.data.address;
    _this.store['editId'] = e.target.dataset.id;
    
    for (let i = 0; i < address.length; i++){
      if (address[i].address_id == _this.store['editId']) {
        _this.setData({
          addressInfo: address[i],
          region: [address[i].province, address[i].city, address[i].district],
          isEdit: true
        });
        break;
      }
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
    let _this = this
      , dataObj = e.detail.value
      , region = _this.data.region
      , url
      , wechatAddress = [];

    if (_this.store['editId']) {
      dataObj.id = _this.store['editId'];
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
      if (res.success) {
        wechatAddress.push({
          address_id: resInfo.data.address_id,
          consignee: dataObj.consignee,
          mobile: dataObj.mobile,
          province: dataObj.province,
          city: dataObj.city,
          district: dataObj.district,
          address: dataObj.address,
          is_default: 0
        });
        _this.setData({
          isEdit: false,
          address: _this.data.address.concat(wechatAddress)
        });
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 1000
        });
      }
    }, 'POST')
  }
}

Page(pageConfig)
