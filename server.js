var m_slack_config = require('./package').config.slack;

// Require
var Slack = require('slack-client')
var CleverBot = require('cleverbot-node');

// For constants
var BOT_TOKEN = m_slack_config.bot_token;

var mSlack = new Slack(BOT_TOKEN, true, true)
var mCleverBots = {};

//
// Listeners
mSlack.on('message', function(message) {
  var channel, channelType, user, type;
  
  channel = mSlack.getChannelGroupOrDMByID(message.channel);
  user = mSlack.getUserByID(message.user);

  type = message.type;
  text = message.text;
  channelType = message.getChannelType();
  
  if (type === 'message' 
    && (text != null) 
    && (channel != null) 
    && (message.user != mSlack.self.id))
  {
    // Send
    var send = function(msg)
    {    
        //Get clever bot
        var key = message.channel;
        var cleverBot = mCleverBots[key];
        if (cleverBot == null)
        {
            mCleverBots[key] = new CleverBot();
            cleverBot = mCleverBots[key];
        }
        //Send request to clever bot
        cleverBot.write(msg,function(resp)
        {            
             channel.send(resp['message']);
        });  

    }

    //Check if bot is tagged || message is directed to bot
    var tag = '<@' + mSlack.self.id + '>';
    if ((channelType == 'Channel' && ~text.indexOf(tag)))
    {       
        text = text.replace(tag, '');  
        send(text);
    }
    else if (channelType == 'DM')
    {
        send(text);
    }
  } 
  
});

mSlack.on('error', function(error) {
  return console.error("Error: " + error);
});


//Login
mSlack.login();
