<template>
  <div class="sendmsg">
    <h1>{{ msg }}</h1>
    <div>
      UserName: <input type="text" v-model="username">
      <button @click="onConnectionClickButton">连接</button>
    </div>
    <div>
      Message: <input type="text" v-model="message">
      <button @click="onClickButton">发送</button>
    </div>
    <div>
      Group: <input type="text" v-model="group">
      <button @click="onAddGroupButton">加入组</button>
      <button @click="onRemoveGroupButton">离开组</button>
    </div>
    <div>
      Email: <input type="text" v-model="email">
      Message: <input type="text" v-model="messageData">
      <button @click="onModelClickButton">发送实体</button>
    </div>
  </div>
</template>

<script>
import * as signalR from '@microsoft/signalr'
const url = "https://localhost:7115/ChatHub"
const signal = new signalR.HubConnectionBuilder()
  .withUrl(url, {
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets,
    accessTokenFactory: () => ""
  })
  .configureLogging(signalR.LogLevel.Information)
  .build()
signal.on('SendCustomUserMessage', (res) => {
  console.log(res, '收到消息')
})
signal.on('SendAll', (res) => {
  console.log(res, '收到消息')
})
export default {
  name: 'Index',
  props: {
    msg: String
  },
  data() {
    return {
      username: "sjn",
      message: "",
      timer: null,
      connectionstatus: "init",
      email: "",
      messageData: ""
    }
  },
  mouted() {
    this.timer = setInterval(() => { }, 500)
  },
  destoryed() {
    this.clearInterval(this.timer)
  },
  methods: {
    onClickButton() {
      var e = this
      signal
        .invoke('SendMessage', e.message)
        .catch(function (err) { return console.error(err) })
    },
    async onConnectionClickButton() {
      try {
        let name = this.username
        let result = await this.$http.get(`generatetoken?user=${name}`)
        if (result.status !== 200) {
          console.error("Token 请求失败")
          return
        }
        var token = result.data
        console.log("获得Token", token)
        var e = this
        if (e.connectionstatus == "init") {
          signal.onclose(() => {
            e.connectionstatus = "close"
            signal.stop()
            console.log("连接已关闭")
            e.retryConnection()
          });
        }
        signal.connection._options.accessTokenFactory = () => token
        signal.start().then(() => {
          if (e.connectionstatus == "close") {
            clearInterval(e.timer)
          }
          e.connectionstatus = "start"
          console.log('连接成功')
        })
      } catch (e) {
        if (e.code == "ERR_NETWORK") {
          console.log("Token 请求失败")
        }
      }
    },
    retryConnection() {
      var e = this
      if (this.connectionstatus == "init" || this.connectionstatus == "start") {
        return
      } else if (this.connectionstatus == "close") {
        console.log("正在重试连接...")
        this.timer = setInterval(() => {
          e.onConnectionClickButton()
        }, 10000)
        return
      }
    },
    onAddGroupButton() {
      var e = this
      signal
        .invoke('AddToGroup', e.group)
        .catch(function (err) { return console.error(err) })
    },
    onRemoveGroupButton() {
      var e = this
      signal
        .invoke('RemoveFromGroup', e.group)
        .catch(function (err) { return console.error(err) })
    },
    onModelClickButton() {
      var e = this
      signal
        .invoke('SendCatModelMessage', { messageData: e.messageData, email: e.email })
        .catch(function (err) { return console.error(err) })
    }
  }
}
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>