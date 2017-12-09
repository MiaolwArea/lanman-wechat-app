// comment.js
// 获取应用实例
var app = getApp();

let pageConfig = {
  data: {
    goodList: null,
    chooseIndex: {},
    thoughtWord: '非常好',
    imageList: []
  },
  // 数据缓存区
  store: {
    url: {
      // 订单详情
      orderDetailUrl: app.globalData.isDebug ? 'orderDetail' : '/wechatapp/order/detail',
      // 资源上传
      uploadUrl: app.globalData.isDebug ? 'uploadUrl' : '/wechatapp/media/upload',
      // 发表评论
      commentUrl: app.globalData.isDebug ? 'commentUrl' : '/wechatapp/goods/comment',
    },
    orderId: '',
    thought: [],
    commentAry: [],
    midAry: []
  },
  onLoad: function (opt) {
    let _this = this;

    _this.store['orderId'] = opt.order_id;
    // 获取初始化数据 
    app.ApiConfig.ajax(_this.store['url'].orderDetailUrl + '?order_id=' + _this.store['orderId'], function (res) {
      if (res.success) {
        let goodList = res.data.goods
          , chooseIndexObj = {};

        // 初始化提交内容
        for(let i = 0; i < goodList.length; i++){
          _this.store['commentAry'].push({
            "star": 5, 
            "mid": "", 
            "bgid": (goodList[i].package || goodList[i].bn_goods_id), 
            "gid": goodList[i].goods_id, 
            "msg": "" 
          })
          chooseIndexObj[i] = 5;
          _this.store['thought'].push({
            1: '很差',
            2: '差',
            3: '一般',
            4: '好',
            5: '非常好'
          })
        }
        _this.setData({
          goodList: res.data.goods,
          chooseIndex: chooseIndexObj
        });
      }
    });
  },
  // 打分
  chooseStar(e){
    let _this = this
      , index = e.target.dataset.index
      , indexP = e.currentTarget.dataset.index_p
      , chooseIndex = _this.data.chooseIndex
      , thoughtWord = _this.data.thoughtWord;
    
    chooseIndex[indexP] = index - 1;
    // 数据存储
    _this.store['commentAry'][indexP]['star'] = index;
    _this.setData({
      chooseIndex: chooseIndex,
      thoughtWord: _this.store['thought'][indexP][index]
    });
  }, 
  // 保存评价内容
  saveText(e){
    let _this = this
      , indexP = e.currentTarget.dataset.index_p;

    _this.store['commentAry'][indexP]['msg'] = e.detail.value;
  },
  // 图片选择
  chooseImg(e) {
    let _this = this
      , indexP = e.currentTarget.dataset.index_p;

    wx.chooseImage({
      sizeType: ['original', 'compressed'],  
      sourceType: ['album', 'camera'], 
      success: function (res) {
        let tempFilePaths = res.tempFilePaths;
        
        if ((tempFilePaths.length + _this.data.imageList.length) > 9){
          wx.showToast({
            title: '不能超过9张',
            icon: 'loading',
            duration: 1000
          })
          return;
        }
        _this.uploadimg({
          index: indexP,
          path: tempFilePaths
        })
      }
    }) 
  },
  // 多张图片上传
  uploadimg(data){
    let _this = this,
      i = data.i ? data.i : 0,
      success = data.success ? data.success : 0,
      fail = data.fail ? data.fail : 0;
    
    wx.showLoading({
      mask: true
    })
    wx.uploadFile({
      url: 'https://api.lanman.cn/wechatapp/media/upload',
      filePath: data.path[i],
      header: {
        sso: app.globalData.sso,
        token: app.globalData.token,
      },
      name: 'media',//这里根据自己的实际情况改
      formData: null,
      success: (resp) => {
        let info = JSON.parse(resp.data);
        
        if (info.success){
          success++;
        }
      },
      fail: (res) => {
        fail++;
        console.log('fail:' + i + "fail:" + fail);
      },
      complete: (res) => {
        let info = JSON.parse(res.data)
          , dataInfo = info.data;

        i++; 
        if (i == data.path.length) { 
          _this.store['midAry'].push(dataInfo.media_id);
          _this.store['commentAry'][data.index]['mid'] = _this.store['midAry'].toString();
          _this.setData({
            imageList: _this.data.imageList.concat(data.path),
          });
          wx.hideLoading();
        } else {
          data.i = i;
          data.success = success;
          data.fail = fail;
          _this.store['midAry'].push(dataInfo.media_id);
          _this .uploadimg(data);
        }
      }
    });
  },
  // 预览图片
  // previewImage(e) {
  //   let imgsUrl = e.target.dataset.imgs;
    
  //   wx.previewImage({
  //     urls: imgsUrl
  //   })
  // },
  delImage(e){
    let _this = this
      , indexP = e.currentTarget.dataset.index_p
      , indexAry = e.currentTarget.dataset.index_ary;

    wx.showModal({
      content: '确定删除？',
      cancelColor: '#808080',
      confirmColor: '#000',
      success: function (res) {
        if (res.confirm) {
          _this.store['commentAry'][indexP]['mid'].splice(indexAry, 1);
        }
      },
    })
  },
  // 发布评论
  sendComment(){
    let _this = this;

    app.ApiConfig.ajax(_this.store['url'].commentUrl, {
      order_id: _this.store['orderId'],
      comment: _this.store['commentAry'],
    },function (res) {
      if(res.success){
        wx.showToast({
          title: '发表成功',
          duration: 1000
        })
        setTimeout(function () {
          wx.redirectTo({
            url: '../order/list?order_status=4'
          })
        }, 1000)
      }
    })
  }
}

Page(pageConfig)
