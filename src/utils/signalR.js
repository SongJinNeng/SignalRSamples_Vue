import * as signalR from '@microsoft/signalr'
const url = "https://localhost:7016/ChatHub"
const signal = new signalR.HubConnectionBuilder()
  .withUrl(url, {
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets
  })
  .configureLogging(signalR.LogLevel.Information)
  .build()
signal.on('SendAll', (res) => {
  console.log(res, '收到消息')
})
signal.start().then(() => {
  if (window.Notification) {
    if (Notification.permission === 'granted') {
      console.log('允许通知')
    } else if (Notification.permission !== 'denied') {
      console.log('需要通知权限')
      Notification.requestPermission((permission) => { console.log("权限通知",permission) })
    } else if (Notification.permission === 'denied') {
      console.log('拒绝通知')
    }
  } else {
    console.error('浏览器不支持Notification')
  }
  console.log('连接成功')
})
signal.onclose((err)=>{
    console.log("连接已经断开 执行函数onclose",err)
})
signal.on('SendCustomUserMessage', (res) => {
    console.log(res, '收到消息')
  })
export default {
  signal
}