const express = require('express')
const app = express()
const mustacheExpress = require('mustache-express')
const models = require('./models')

app.use(express.urlencoded())

app.engine('mustache', mustacheExpress())
app.set('views', './views')
app.set('view engine', 'mustache')


app.get('/posts', (req, res)=>{
    models.Post.findAll().then(posts => {
        res.render('index', {posts: posts})
    })
})

app.get('/add-post', (req, res) => {
    res.render('add-post')
})

app.post('/add-post', (req, res)=>{
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

app.post("/delete-post", (req, res) =>{
    let postId = req.body.postId
    console.log("postid is " + postId)

    models.Post.destroy({
        where: {
            id: postId
        }
    }).then(deletedPost => { 
        console.log(deletedPost)
        res.redirect("posts")
    })
})

app.post("/update-post", (req, res) => {
    let title = req.body.postTitle
    let category = req.body.postCategory
    let body = req.body.postBody
    let postId = req.body.postId
    models.Post.update({
        title: title,
        category: category,
        body: body
     }, { 
        where: {
            id: postId
     }
    }).then(post => {
        console.log(post + " updated")
        res.redirect("posts")
    }) 
})

app.get("/post-details/:postId", (req, res) =>{
    let postId = req.params.postId
    models.Post.findByPk(postId)
    .then(updatedPost => {
        console.log(updatedPost)
        res.render("post-details", updatedPost)
    })
})

app.post("/filter-posts", (req, res)=>{
    let filterCategory = req.body.postCategory
    console.log(filterCategory)
    models.Post.findAll({
        where: {
            category: filterCategory
        }
    }).then(filteredPosts => {
        console.log(filteredPosts)
        res.render("filter", {filteredPosts: filteredPosts})
    })
})

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000")
})