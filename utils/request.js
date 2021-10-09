/*
    封装功能函数
 */
import request from './config'
export default (url, data = {}, method = "GET") => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: request.mobileHost + url,
      data,
      method, 
      header:{
        cookie:wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1):''
      },
      success(res) {
        if (data.isLogin) {
          wx.setStorage({
            key: 'cookies',
            data: res.cookies
          })
        }
        resolve(res)
      },
      fail(err) {
        reject(err)
      }
    })

  })

}