# JobsFinder
A script which parses Upwork RSS feed and sends notifications to Telegram.

- `credentials.json`

```
{
  "rss_feed": "https://www.upwork.com/ab/feed/topics/rss?securityToken=e585719edx78fiej4i4bc2a371f2c911456faaedwf8dw78f0a3eb22866bc5da58c591a2de5c0b1da75d4f0cdfe4a98cf93ff6eda734c77098331ccadf266a&userUid=783174439909315840&orgUid=783172333092510145",
  "telegram_bot_token": "1139290717:AAG_XGrivhLGmU90YQ_owSRmw57QxQ4aPgE",
  "telegram_channel": "@ais8d1xxpw0rkf33d"
}
```

- `index.js`
```js
const credentials = require('./credentials.json')

const FeedSub = require('feedsub')
const rssFeed = credentials.rss_feed
let reader = new FeedSub(rssFeed, {
  interval: 1 // Check feed every 1 minute.
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

reader.on('item', (item) => {
  console.log(item.title)

  const itemInDb = db.get('feed').find({ link: item.link }).value()
  if (itemInDb) {
    console.log("This item is already exists:")
    console.log(itemInDb.link)
  } else {
    db.get('feed').push(item).write()
    var message = item.description
    bot.telegram.sendMessage(credentials.telegram_channel, message, Extra.HTML().markup())
  }
})

reader.start()

```

More information <a href="https://medium.com/@maximbilan/upwork-jobs-finder-telegram-notifier-6d7557015135">here</a>.
