const express = require('express')
const app = express()
const mustacheExpress = require('mustache-express')
const models = require('./models')

app.use(express.urlencoded())

// tell express to use mustache templating engine
app.engine('mustache', mustacheExpress())
// the pages are located in views directory
app.set('views', './views')
// extension will be .mustache
app.set('view engine', 'mustache')

app.get("/posts", (req, res) => {
    models.Post.findAll().then(posts => {
        res.render("index", {posts: posts})
    })
})

app.get("/add-post", (req, res) => {
    res.render("add-post")
})

app.post("/add-post", (req, res) => {
    let title = req.body.postTitle
    let category = req.body.postCategory
    let body = req.body.postBody

    let blogPost = models.Post.build({
        title: title,
        category: category,
        body: body
    })

    blogPost.save().then(savedPost => {
        res.redirect("/posts")
    })
})

app.post("/delete-post", (req, res) => {
    let postId = req.body.postId
    models.Post.destroy({
        where: {
            id: postId
        }
    }).then(deletedPost => {
        res.redirect("posts")
    })
})

app.get("/post-details/:postId", async (req, res, next) => {
    try {
        const post = await models.Post.findByPk(req.params.postId, {
            include: [{ model: models.Comment, as: 'comments' }]
        })
        if (!post) return res.status(404).send("Post not found")
        res.render("post-details", post.get({ plain: true }))
    } catch (error) { next(error) }
})

app.get("/comments/:commentId", async (req, res, next) => {
    try {
        const comment = await models.Comment.findByPk(req.params.commentId)
        if (!comment) return res.status(404).send("Comment not found")
        res.redirect(`/post-details/${comment.post_id}`)
    } catch (error) { next(error) }
})

app.post("/add-comment", async (req, res, next) => {
    const postId = Number(req.body.postId)
    if (!Number.isInteger(postId) || postId < 1) {
        return res.status(400).send("A valid postId is required")
    }
    try {
        const post = await models.Post.findByPk(postId)
        if (!post) return res.status(404).send("Post not found")
        await models.Comment.create({ title: req.body.title, body: req.body.body, post_id: postId })
        res.redirect(`/post-details/${postId}`)
    } catch (error) { next(error) }
})

// app.post("/update-post", (req, res) => {
//     let title = req.body.postTitle
//     let category = req.body.postCategory
//     let body = req.body.postBody
//     let postId = req.body.postId
//     models.Post.update({
//         title: title,
//         category: category,
//         body: body
//     }, {
//             where: {
//             id: postId
//         }
//     }).then(post => {
//         res.redirect("posts")
//     })
// })

app.post("/filter-posts", (req, res) => {
    let filterCategory = req.body.postCategory
    models.Post.findAll({
        where: {
            category: filterCategory
        }
    }).then(filteredPosts => {
        res.render("filter", {filteredPosts: filteredPosts})
    })
})

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error)
    res.status(500).send("Unable to complete the request")
})

if (require.main === module) {
    app.listen(process.env.PORT || 3000, () => console.log("Blog server started"))
}
module.exports = app
