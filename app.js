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

app.get("/post-details/:postId", (req, res) => {
    let postId = req.params.postId
    models.Post.findByPk(postId, {
        include: [
            {
                model: models.Comment,
                as: 'comments'
            }
        ]
    }).then(post => {
            res.render("post-details", post.dataValues)
    })
})

app.get("/comments/:commentId", (req, res)=>{ 
    let commentId = req.params.commentId

    models.Comment.findByPk(commentId, {
        include: [
            {
                model: models.Post,
                as: "post"
            }
        ]
    }).then(comment => {
        console.log(comment)
        res.redirect(`/posts/${postId}`)
    })
})

app.post("/add-comment", (req, res) => {
    let title = req.body.title
    let body = req.body.body
    let postId = req.body.postId

    let comment = models.Comment.build({
        title: title,
        body: body,
        post_id: postId
    })

    review.save().then(savedReview => {
        res.redirect(`/posts/${postId}`)
    })
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

app.listen(3000, () => {
    console.log("server is being hosted on http://localhost:3000")
})