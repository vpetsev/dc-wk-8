const assert = require('node:assert/strict')
const test = require('node:test')
const Sequelize = require('sequelize')

// Uses an explicit test connection and a unique schema; never the app's DB config.
test('post details and comment creation work against PostgreSQL', {
  skip: !process.env.TEST_DATABASE_URL && 'Set TEST_DATABASE_URL to run the PostgreSQL integration test'
}, async () => {
  const schema = `comment_test_${process.pid}_${Date.now()}`
  const sequelize = new Sequelize(process.env.TEST_DATABASE_URL, {
    logging:false, pool:{max:1,min:0}, define:{schema}
  })
  let server
  try {
    await sequelize.createSchema(schema)
    const models = {
      Post: require('../models/post')(sequelize, Sequelize),
      Comment: require('../models/comment')(sequelize, Sequelize)
    }
    for (const model of Object.values(models)) model.associate(models)
    await sequelize.sync()
    require.cache[require.resolve('../models')] = {exports:models}
    const app = require('../app')
    server = app.listen(0, '127.0.0.1')
    await new Promise(resolve => server.once('listening', resolve))
    const base = `http://127.0.0.1:${server.address().port}`
    const post = await models.Post.create({title:'Regression post',body:'Post body',category:'JS'})
    const details = await fetch(`${base}/post-details/${post.id}`)
    assert.equal(details.status, 200)
    assert.match(await details.text(), new RegExp(`name="postId" value="${post.id}"`))
    const submit = await fetch(`${base}/add-comment`, {
      method:'POST', redirect:'manual', headers:{'content-type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({postId:post.id,title:'A comment',body:'Saved comment body'})
    })
    assert.equal(submit.status, 302)
    assert.equal(submit.headers.get('location'), `/post-details/${post.id}`)
    const saved = await models.Comment.findOne()
    assert.equal(saved.post_id, post.id)
    assert.equal(saved.body, 'Saved comment body')
    const rendered = await (await fetch(base + submit.headers.get('location'))).text()
    assert.match(rendered, /Saved comment body/)
    assert.equal((await fetch(`${base}/comments/${saved.id}`, {redirect:'manual'})).headers.get('location'), `/post-details/${post.id}`)
    assert.equal((await fetch(`${base}/post-details/99999999`)).status, 404)
    assert.equal((await fetch(`${base}/add-comment`, {method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'postId=99999999'})).status, 404)
    assert.equal(await models.Comment.count(), 1)
  } finally {
    if (server) await new Promise(resolve => server.close(resolve))
    await sequelize.dropSchema(schema, {cascade:true})
    await sequelize.close()
  }
})
