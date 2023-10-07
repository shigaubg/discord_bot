const http = require('http');
const querystring = require('querystring');
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// role_deprive.jsをインポート
const roleDepriveCommand = require('./commands/role_deprive');

//HTTPサーバーの設立。当部分はGlitchを5分に1度再起動させる為に使用しています。
http.createServer(function(req, res){
  if (req.method === 'POST'){
    let data = "";
    req.on('data', function(chunk){
      data += chunk;
    });
    req.on('end', function(){
      if(!data){
        res.end("No post data");
        return;
      }
      const dataObject = querystring.parse(data);
      console.log("post:" + dataObject.type);
      if(dataObject.type === "wake"){
        console.log("Woke up in post");
        res.end();
        return;
      }
      res.end();
    });
  }
  else if (req.method === 'GET'){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Discord Bot is active now\n');
  }
}).listen(3000);

//discord.client起動時の処理
client.once('ready', async () => {
  console.log('Discord Bot is ready');
  // ボットがログインして準備完了したらスラッシュコマンドを登録
  try {
    const commands = [
      //コマンドの登録場所
      roleDepriveCommand,
    ];

    for (const command of commands) {
      await client.guilds.cache.get('process.env.SERVER_ID')?.commands.create(command.data);
    }

    console.log('スラッシュコマンドを登録しました。');
  } catch (error) {
    console.error('スラッシュコマンドの登録に失敗しました:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ロール剥奪') {
    // 'ロール剥奪' コマンドの処理を実行
    await roleDepriveCommand.execute(interaction);
  }
});


//botがメッセージを受け取った時の処理
client.on('message', message =>{
  if (message.author.id === client.user.id || message.author.bot){
    return;
  }
  if(message.isMemberMentioned(client.user)){
  }
});

if(process.env.DISCORD_BOT_TOKEN === undefined){
 console.log('DISCORD_BOT_TOKENが設定されていません。');
 process.exit(0);
}

client.login( process.env.DISCORD_BOT_TOKEN );

//リプライ送信機能
function sendReply(message, text){
  message.reply(text)
    .then(console.log("リプライ送信: " + text))
    .catch(console.error);
}

//メッセージ送信機能
function sendMsg(channelId, text, option={}){
  client.channels.get(channelId).send(text, option)
    .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}
