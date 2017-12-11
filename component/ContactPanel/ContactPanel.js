// CameraPanel.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    x: 0,
    y: wx.getSystemInfoSync().windowHeight - 110
  },

  /**
   * 组件的方法列表
   */
  methods: {
    resetPos (e) {
      this.setData({
        x: 0
      });
    }
  }
})
