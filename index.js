const credentials = require('./credentials.json')

const _ = require('lodash')
const FeedSub = require('feedsub')
const rssFeed = credentials.rss_feed
let reader = new FeedSub(rssFeed, {
  interval: 0.25, // Check feed every 0.25 minute.
  forceInterval: true
})

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({ feed: [] }).write()

const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const session = require('telegraf/session')
const token = credentials.telegram_bot_token
const bot = new Telegraf(token)

// Register session middleware.
bot.use(session())

// Register logger middleware.
bot.use((ctx, next) => {
  const start = new Date()
  return next().then(() => {
    const ms = new Date() - start
    console.log('response time %sms', ms)
  })
})

var countMessage = 0
reader.on('item', (item) => {
  const itemInDb = db.get('feed').find({ link: item.link }).value()
  if (itemInDb) {
    /* console.log("This item is already exists:")
    console.log(itemInDb.link) */
  } else {
    countMessage++
    db.get('feed').push(item).write()

    var message = "<strong><b>" + item.title + "</b></strong><br /><br />"
    message += item.description
    message = _.replace(
      _.replace(
        _.trim(
          _.unescape(
            _.deburr(message)
          )
        )
      , /\s\s+/g, ' ')
    , /&nbsp;/g, ' ')
    const oldstring = "<br />"
    const newstring = "\n"
    while (message.indexOf(oldstring) > -1) {
      message = message.replace(oldstring, newstring)
    }
    message = _.replace(message, /\n\s*\n\s*\n/g, "\n\n")

    if (countMessage >= 10) countMessage = 1
    setTimeout(() => {
      bot.telegram.sendMessage(credentials.telegram_channel, message, Extra.HTML().markup())
    }, 200 * countMessage);
  }
})

reader.start()
