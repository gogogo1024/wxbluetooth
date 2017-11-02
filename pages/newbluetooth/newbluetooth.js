// pages/newbluetooth/newbluetooth.js
var app = getApp();

var Paho = require('../../utils/mqttNoPort.js');
var host = 'broker.hyecosmart.com';
var port = 443;
var userId = 'qq@163.com';
var userName = '2h65ksf4-c62a-91kl-6527-l2182d87s792';
var password = "?[~,59XnU`sd)p>[J'REQ;|&Tj_)|R";
var topic = "/hi/blue/v1/9036216b-8a06-4103-88f2-1c7b05f3e889/d/" + userId + "/userMqttMsg";
var newTopic = '/hi/blue/v1';
var f = new Paho.Client(host, userId, 1);
var midmsg = '';
// var userName = "8d08aae1-bb5d-46c8-9371-f188cb47e275";
//feC~lilB]4^9CvmN00A3p!*Lj+^lYz
// var password = "?[~,59XnU`sd)p>[J'REQ;|&Tj_)|R";
var mqttFlag = false;
var mqttArrayBufferMsg1 = new ArrayBuffer(12);
var mqttArrayBufferMsg2 = new ArrayBuffer(12);

Page({
  //连接mqtt平台
  connectMqtt: function () {
    f.onMessageArrived = this.onMessageArrived;
    f.onConnectionLost = this.onConnectionLost;
    f.connect({
      useSSL: true,
      cleanSession: false,
      keepAliveInterval: 60,
      userName: userName,
      timeout: 30,
      password: password,
      onFailure: this.onConnectfailure,
      onSuccess: this.onConnectSuccess
    });
  },
  //连接mqtt平台成功后立马订阅topic
  onConnectSuccess: function () {
    console.log("onConnected");
    //订阅主题
    // f.subscribe(topic, { qos: 0 });
    //订阅新主题
    f.subscribe(newTopic, { qos: 0 });
    // var message = new Paho.Message('');
    // message.destinationName = topic;

    let buffer2 = new ArrayBuffer(12);
    let dataview2 = new DataView(buffer2);
    dataview2.setUint8(0, 0x0012);
    dataview2.setUint8(1, 0x0034);
    dataview2.setUint8(2, 0x0056);
    mqttFlag = true;
  },
  //连接失败
  onConnectfailure: function (invocationContext) {
    console.log("invocationContext.errorCode:", invocationContext.errorCode);
    console.log("invocationContext.errorMessage:", invocationContext.errorMessage);
    mqttFlag = false;
  },

  //向mqtt平台发送数据
  publishMessage: function (msg,topic) {
    var message = new Paho.Message(msg);
    message.destinationName = topic;
    f.send(message);
  },
  //接收到mqtt平台的推送消息
  onMessageArrived: function (message) {
    midmsg = message.payloadString;
    console.log('message:', message);
    var now = new Date().toLocaleString();
    console.log('订阅topic返回的mqtt消息:' + message.payloadString + '\r\n' + '当前时间:' + now);
    // mqttArrayBufferMsg1 = message.payloadBytes.slice(0);
    // console.log('mqttArrayBufferMsg1:', mqttArrayBufferMsg1);
    // mqttArrayBufferMsg2 = message.payloadBytes.slice(0);
    // console.log('mqttArrayBufferMsg2:', mqttArrayBufferMsg2)


  },
  //断开与mqtt平台的连接
  onConnectionLost: function (responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:" + responseObject.errorMessage);
      console.log("连接已断开");
    }
  },


  data: {
    status: "",
    sousuo: "",
    connectedDeviceId: "", //已连接设备uuid  
    devices: [],
    services: [], // 连接设备的服务  
    characteristics: "",   // 连接设备的状态值  
    writeServicweId: "", // 可写服务uuid  
    writeCharacteristicsId: "",//可写特征值uuid  
    readServicweId: "", // 可读服务uuid  
    readCharacteristicsId: "",//可读特征值uuid  
    notifyServicweId: "", //通知服务UUid  
    notifyCharacteristicsId: "", //通知特征值UUID  
    inputValue: "",
    characteristics1: "", // 连接设备的状态值  
    characteristices: [],
    disabled: false //默认开锁按钮是禁用的，收到mqtt消息后启用
  },


  onLoad: function () {
    var that = this;
    //mqtt start
    this.connectMqtt();
    //mqtt end

    //wx bluetooth start
    if (wx.openBluetoothAdapter) {
      wx.openBluetoothAdapter();
      console.log('初始化蓝牙适配器')
      this.initBluetooth();
      // console.log('搜索设备')
      // this.openSearchFun();
      // console.log('获取所有已发现的设备');
      var that = this;
      if (that.blueStatue()) {
        var capture = setInterval(function () {
          if (that.data.devices.length > 0) {
            clearInterval(capture);
          } else {
            // that.initBluetooth();
            console.log('搜索设备')
            that.openSearchFun();
            console.log('获取所有已发现的设备');
            that.captureBlueDev();
          }
        }, 250);
      }
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示  
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      });
    }
    //wx bluetooth end
    //f3a6a5bc-8d29-449c-bde5-ae56e7442968
    
    //mqtt onMessageArrived callback
    var interval = setInterval(function () {
      if (midmsg) {
        if (midmsg === 'unlock') { //unlock the door
          that.setData({
            disabled: true
          });
        } else if (midmsg === 'lock') {  //lock the door
          that.setData({
            disabled: false
          });
        }
        clearInterval(interval);
      }
      f.onMessageArrived;
    }, 200)

  },
  // 初始化蓝牙适配器  
  initBluetooth: function () {
    var that = this;
    wx.openBluetoothAdapter({
      success: function (res) {
        that.setData({
          msg: "初始化蓝牙适配器成功！" + JSON.stringify(res),
        });
        wx.showToast({
          title: '初始化蓝牙适配器成功！',
          icon: 'success',
          duration: 500

        })
        //监听蓝牙适配器状态  
        wx.onBluetoothAdapterStateChange(function (res) {
          that.setData({
            sousuo: res.discovering ? "在搜索。" : "未搜索。",
            status: res.available ? "可用。" : "不可用。",
          })
        })
      }
    })
  },
  // 本机蓝牙适配器状态  
  //当前问题是不能立马获取到手机蓝牙的状态
  blueStatue: function () {
    var that = this;
    var flag = true;
    wx.getBluetoothAdapterState({
      success: function (res) {
        if (!res.available || !res.discovering) {
          wx.showToast({
            title: '蓝牙设备不可用或者不在搜索状态！',
            mask: true,
            icon: 'loading',
            duration: 2000

          });
          console.log('获取蓝牙设备状态成功');
          // flag = false;
        }

        that.setData({
          msg: "本机蓝牙适配器状态" + "/" + JSON.stringify(res.errMsg),
          sousuo: res.discovering ? "在搜索。" : "未搜索。",
          status: res.available ? "可用。" : "不可用。",
        });
        //监听蓝牙适配器状态  
        wx.onBluetoothAdapterStateChange(function (res) {
          that.setData({
            sousuo: res.discovering ? "在搜索。" : "未搜索。",
            status: res.available ? "可用。" : "不可用。",
          })
        });
      }
    })
    return flag;

  },
  // 打开搜索设备功能
  openSearchFun: function () {
    var that = this;
    wx.startBluetoothDevicesDiscovery({
      success: function (res) {
        that.setData({
          msg: "搜索设备" + JSON.stringify(res),
        })
      }
    });
    wx.onBluetoothAdapterStateChange(function (res) {


      that.setData({
        sousuo: res.discovering ? "在搜索。" : "未搜索。",
        status: res.available ? "可用。" : "不可用。",
      })
    })
  },

  // 获取所有已发现的设备  
  captureBlueDev: function () {
    var that = this;
    wx.getBluetoothDevices({
      success: function (res) {
        //是否有已连接设备  
        wx.getConnectedBluetoothDevices({
          success: function (res) {
            // console.log(JSON.stringify(res.devices));
            that.setData({
              connectedDeviceId: res.deviceId
            })
          }
        })
        wx.showToast({
          title: '获取蓝牙设备成功！',
          icon: 'success',
          duration: 2000

        })

        that.setData({
          msg: "搜索设备" + JSON.stringify(res.devices),
          devices: res.devices,
        });
        console.log(res.devices[0]);
        // that.connectBuleDev(res.devices[0].deviceId);

        //监听蓝牙适配器状态  
        wx.onBluetoothAdapterStateChange(function (res) {
          that.setData({
            sousuo: res.discovering ? "在搜索。" : "未搜索。",
            status: res.available ? "可用。" : "不可用。",
          })
        })
      }
    });


  },
  //请求开锁
  requestOpen: function (e) {
    publishMessage('设备:'+e.target.id+'\r\n'+'request to open the door', newTopic);
  },
  //连接设备  
  //Interval不能太小，蓝牙设备的连接需要时间
  connectBuleDev: function (e) {
    var that = this;
    var connect = setInterval(function () {

      wx.createBLEConnection({
        deviceId: e.target.id, 
        success: function (res) {
          console.log(res.errMsg);
          that.setData({
            connectedDeviceId: e.target.id,
            msg: "已连接" + e.target.id,
            msg1: "",
          });
          that.getAllServices();
          clearInterval(connect);

        },
        fail: function () {
          console.log(e.target.id);
          console.log("调用失败");
        },
        complete: function () {
          console.log(e.target.id);
          console.log("调用结束");
        }

      });
    }, 450);
  },
  //get all services
  getAllServices: function () {
    var that = this;
    console.log('getAllService', that.data.connectedDeviceId);
    wx.getBLEDeviceServices({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: this.data.connectedDeviceId,
      success: function (res) {
        console.log('device services:', JSON.stringify(res.services));
        that.setData({
          services: res.services,
          msg: JSON.stringify(res.services),
        });
        that.loopFindCharateristics();

      }
    })
  },
  //loop all the services and find the specified characteristics
  loopFindCharateristics: function () {
    var that = this;
    console.log('this.data.services:', this.data.services);
    this.data.services.forEach(function (service) {
      wx.getBLEDeviceCharacteristics({
        // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
        deviceId: that.data.connectedDeviceId,
        // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
        serviceId: service.uuid,
        success: function (res) {
          var uuid = "", read = "", write = "";
          for (var i = 0; i < res.characteristics.length; i++) {
            uuid = res.characteristics[i].uuid;
            read = res.characteristics[i].properties.read;
            write = res.characteristics[i].properties.write;
            console.log('res.characteristics[i]:', res.characteristics[i]);
            if (uuid.toString().indexOf('00002A1A') != -1 && write) {  //123456
              let buffer2 = new ArrayBuffer(12);
              let dataview2 = new DataView(buffer2);
              dataview2.setUint8(0, 0x0012);
              dataview2.setUint8(1, 0x0034);
              dataview2.setUint8(2, 0x0056);
              console.log('flagbluetooth', mqttFlag);
              //如果连接成功就发送消息
              if (mqttFlag) {
                that.publishMessage(buffer2);
              }
              //考虑到mqtt收发消息的时延，定时获取返回的数据
              var interval = function () {
                f.onMessageArrived();
                if (mqttArrayBufferMsg1 && mqttArrayBufferMsg1[0] == 18 &&
                  mqttArrayBufferMsg1[1] == 52 &&
                  mqttArrayBufferMsg1[2] == 86) {
                  clearInterval(interval);
                }
              }
              setInterval(interval, 500);
              console.log('go in mqttArrayBufferMsg1');
              that.sendMsg(service.uuid, uuid, buffer2);

            } else if (uuid.toString().indexOf('00002A1C') != -1 && write) {  //01
              let buffer1 = new ArrayBuffer(12);
              let dataview1 = new DataView(buffer1);
              dataview1.setUint8(0, 0x0001);
              console.log('mqttFlag', mqttFlag);
              if (mqttFlag) {
                that.publishMessage(buffer1);
              }
              var interval = function () {
                f.onMessageArrived();
                if (mqttArrayBufferMsg2[0] == 1) {
                  clearInterval(interval);
                }
              }
              setInterval(interval, 500);
              console.log('go in mqttArrayBufferMsg2');
              that.sendMsg(service.uuid, uuid, buffer1);

            }
          }
        },
        fail: function () {
          console.log("fail");
        },
        complete: function () {
          console.log("complete");
        }
      })
    });


  },
  //断开设备连接  
  lanya0: function () {
    var that = this;
    wx.closeBLEConnection({
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        that.setData({
          connectedDeviceId: "",
        })
      }
    })
  },
  //监听input表单  
  inputTextchange: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  //发送  
  sendMsg: function (serviceId, characteristicId, buffer) {
    var that = this;
    // publishMessage
    wx.writeBLECharacteristicValue({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
      serviceId: serviceId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取  
      characteristicId: characteristicId,
      // 这里的value是ArrayBuffer类型  
      value: buffer,
      success: function (res) {
        console.log('writeBLECharacteristicValue success', res.errMsg);
        console.log('e.target.id,', characteristicId);
      },
      fail: function (err) {
        console.log('写入失败', err);
      }
    });


  },
  //启用低功耗蓝牙设备特征值变化时的 notify 功能  
  lanya9: function () {
    var that = this;
    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能  
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
      serviceId: that.data.notifyServicweId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取  
      characteristicId: that.data.notifyCharacteristicsId,
      success: function (res) {
        console.log('notifyBLECharacteristicValueChange success', res.errMsg)
      },
      fail: function () {
        console.log('shibai');
        console.log(that.data.notifyServicweId);
        console.log(that.data.notifyCharacteristicsId);
      },
    })
  },
  //接收消息  
  lanya10: function () {
    var that = this;
    // 必须在这里的回调才能获取  
    wx.onBLECharacteristicValueChange(function (characteristic) {
      let hex = Array.prototype.map.call(new Uint8Array(characteristic.value), x => ('00' + x.toString(16)).slice(-2)).join('');
      console.log(hex)
      // wx.request({
      //   url: '***/getDecrypt',
      //   data: { hexString: hex },
      //   method: "POST",
      //   header: {
      //     'content-type': 'application/x-www-form-urlencoded'
      //   },
      //   success: function (data) {
      //console.log(data)  
      // var res = data.data.data;
      that.setData({
        jieshou: hex,
      })
    });
    wx.readBLECharacteristicValue({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
      serviceId: that.data.readServicweId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取  
      characteristicId: that.data.readCharacteristicsId,
      success: function (res) {
        console.dir(that.data);
        console.log('readBLECharacteristicValue:', res.errMsg);
      }
    })
  },



})  