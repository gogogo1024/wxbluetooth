//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: [],
    config:{
      "appId": "36487372-4570-4499-83a4-1c437da092a1",
      "appToken": "33a7fbd3-e7ee-4e61-a6c0-75dd67500a8b",
      "accountId": "9036216b-8a06-4103-88f2-1c7b05f3e900",
    }
  },
  onLoad: function () {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    });
    //add user manage


  },

})
