document.addEventListener("DOMContentLoaded", function(){
    ChangePage('all', 0);
    if(document.querySelector("#following") != null){
        document.querySelector("#following").addEventListener("click", () => ChangePage("following", 0));
    }
    if(document.querySelector(".form-button") != null){
        document.querySelector(".form-button").addEventListener("click", () => FormView("on"));
    }
    if(document.querySelector(".close-form") != null){
        document.querySelector(".close-form").addEventListener("click", () => FormView("off"));
    }

    document.querySelector('.left').addEventListener('click', () => PrePage())
    document.querySelector('.right').addEventListener('click', () => NextPage())

    document.querySelector("#post-form").addEventListener('submit', event => {
        event.preventDefault();
        SubmitPost();
    });
});

function NextPage(){
    let postsPages = document.getElementsByClassName('post-type');
    let currentPosts;
    for(let i = 0; i < postsPages.length; i++){
        if(postsPages[i].style.display == "block"){
            currentPosts = postsPages[i];
            
            break;
        }
    }
    currentPage = parseInt(currentPosts.querySelector('#num').innerHTML)
    currentPosts = currentPosts.id.split("-")[0]
    
    if(currentPage < parseInt(document.getElementsByClassName('page')[document.getElementsByClassName('page').length - 1].id)){
        ViewPosts(currentPosts, currentPage + 1);
    }
    else{
        ViewPosts(currentPosts, currentPage);
    }
    
}
function PrePage(){
    let postsPages = document.getElementsByClassName('post-type');
    let currentPosts;
    for(let i = 0; i < postsPages.length; i++){
        if(postsPages[i].style.display == "block"){
            currentPosts = postsPages[i];
            
            break;
        }
    }
    currentPage = parseInt(currentPosts.querySelector('#num').innerHTML)
    currentPosts = currentPosts.id.split("-")[0]

    if(currentPage > 0){
        ViewPosts(currentPosts, currentPage - 1)
    }
    else{
        ViewPosts(currentPosts, currentPage)
    }
}


function ChangePage(pagetype, pageNum){
    const page = document.querySelector(`#${pagetype}-post`);
    const pages = document.getElementsByClassName('post-type');

    for(let i = 0; i < pages.length; i++){
        if(pages[i] == page){
            pages[i].style.display = "block";
            PageNumber(pagetype);
            ViewPosts(pagetype, pageNum);
        }
        else{
            pages[i].style.display = "none";
        }
    }
}

function PageNumber(pagetype){
    let pagination = document.querySelector('.pages')
    pagination.innerHTML = ""

    let currentPage;

    fetch(`/posts/${pagetype}`)
    .then(response => response.json())
    .then(tweets => {
        console.log(Object.keys(tweets).length / 10)
        if(Object.keys(tweets).length % 10 != 0 && Object.keys(tweets).length > 10){
            const num = (Object.keys(tweets).length / 10);
            for(let i = 0; i < num; i++){
                let page = document.createElement('div')
                page.setAttribute('class', 'page');
                page.setAttribute('id', `${i}`);
                page.innerHTML = `${i}`
                pagination.appendChild(page);
                page.addEventListener('click', () => ViewPosts(pagetype, parseInt(page.id)))
            }
        }
        else{
            const num = (Object.keys(tweets).length / 10);
            for(let i = 0; i < num; i++){
                let page = document.createElement('div')
                page.setAttribute('class', 'page');
                page.setAttribute('id', `${i}`);
                page.innerHTML = `${i}`
                pagination.appendChild(page);
            }
        }
    })
}

async function ViewPosts(postType, pageNum){
    document.getElementById(`posts-${postType}`).innerHTML = "";

    let userFollowers = [];
    if(document.querySelector('#username') != null){
        // Gathering the Followers of Request User through API
        await fetch(`/followers/${document.querySelector('#username').innerHTML}`)
        .then(response => response.json())
        .then(followers => {
            followers.forEach(follower => {
                userFollowers.push(follower.follows);
            });
        })
    }
    
    
    

    // Creating Posts Boxes
    await fetch(`/posts/${postType}`)
    .then(response => response.json())
    .then(tweets => {
        
        let num = pageNum * 10;
        if(document.querySelector('#username') != null){
            for(let i = num; i < num + 10; i++){
                
                if(tweets[i] != null){
                    let isFollow = false;
                    for(let j = 0; j < userFollowers.length; j++){
                        if(tweets[i].user == userFollowers[j]){
                            isFollow = true
                        }
                    }
                    
                    // Creating Tweet Container
                    let postContainer = document.createElement('div');
                    postContainer.setAttribute('class', 'post');
        
                    // Creating the Content Container for the Posts' Informations
                    let postContent = document.createElement('div');
                    postContent.setAttribute('class', 'content');
        
                    //Creating Container For User Informations
                    let postUser = document.createElement('div');
                    postUser.setAttribute('class', 'user');
                    postUser.innerHTML = `<div class="username">
                                                <a class="name" href="/profile/${tweets[i].user}">${tweets[i].user}</a>
                                            </div>`;
                    if(isFollow == false && document.querySelector('#username').innerHTML != tweets[i].user){ // Checking If The User is Followed by Request User
                        let followBtn = document.createElement('div');
                        followBtn.setAttribute('class', 'follow-btn');
                        followBtn.innerHTML = `<button class="follow" onclick="SetFollower(this)">
                                                    Follow
                                                </button>`;
                        postUser.appendChild(followBtn);
                    }
                    else if(isFollow == true && document.querySelector('#username').innerHTML != tweets[i].user){
                        let unfollowBtn = document.createElement('div');
                        unfollowBtn.setAttribute('class', 'unfollow-btn');
                        unfollowBtn.innerHTML = `<button class="unfollow" onclick="RemoveFollower(this)">
                                                    Unfollow
                                                </button>`;
                        postUser.appendChild(unfollowBtn);
                    }
                    
                    
                    // Creating the Body Information of the Post
                    let postBody = document.createElement('div');
                    postBody.setAttribute('class', 'body');
                    postBody.innerHTML = `${tweets[i].tweet}`;
        
                    // Creating the Status Information of the Post
                    let postStatus = document.createElement('div');
                    postStatus.setAttribute('class', 'status');
                    postStatus.innerHTML = `<div class="post-time">
                                                <p>${ tweets[i].timestamp }</p>
                                            </div>`;

                    let postLikes = document.createElement('div');
                    postLikes.setAttribute('class', 'likes');
                    fetch(`/posts/likedposts-${document.querySelector('#username').innerHTML}`)
                    .then(response => response.json())
                    .then(likedTweets => {
                        let isLiked = false;
                        likedTweets.forEach(likedTweet => {
                            if(tweets[i].id == likedTweet.id){
                                isLiked = true;
                            }
                        });
                        if(isLiked == false){
                            postLikes.innerHTML = `<i class="fa-regular fa-heart"></i>
                                                    <p class="like-amount">${tweets[i].likes}</p>`
                        }
                        else{
                            postLikes.innerHTML = `<i class="fa-solid fa-heart"></i>
                                                    <p class="like-amount">${tweets[i].likes}</p>`
                        }
                    })
                    postStatus.appendChild(postLikes)

                    let postEdit = document.createElement('div');
                    postEdit.setAttribute('class', 'edit');
                    if(document.querySelector('#username').innerHTML == tweets[i].user){
                        postEdit.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`
                        postStatus.appendChild(postEdit)
                        postEdit.addEventListener('click', () => EditPost(tweets[i].id, postEdit));
                    }
                    
        
                    // Appending All the Created Containers to eachother
                    postContent.appendChild(postUser);
                    postContent.appendChild(postBody);
                    postContent.appendChild(postStatus);
                    postContainer.appendChild(postContent);
                    postLikes.addEventListener('click', () => LikePost(tweets[i].id, postStatus));
                    
                    document.getElementById(`posts-${postType}`).appendChild(postContainer);
                }
                else{
                    break;
                }
            };
        
            
        }
        else{
            for(let i = num; i < num + 10; i++){
                if(tweets[i] != null)
                {
                    // Creating Tweet Container
                    let postContainer = document.createElement('div');
                    postContainer.setAttribute('class', 'post');

                    // Creating the Content Container for the Posts' Informations
                    let postContent = document.createElement('div');
                    postContent.setAttribute('class', 'content');

                    //Creating Container For User Informations
                    let postUser = document.createElement('div');
                    postUser.setAttribute('class', 'user');
                    postUser.innerHTML = `<div class="username">
                                                <a class="name" href="/profile/${tweets[i].user}">${tweets[i].user}</a>
                                            </div>`;

                    // Checking If The User is Followed by Request User
                    let followBtn = document.createElement('div');
                    followBtn.setAttribute('class', 'follow-btn');
                    followBtn.innerHTML = `<button class="follow" onclick="SetFollower(this)">
                                                Follow
                                            </button>`;
                    postUser.appendChild(followBtn);


                    // Creating the Body Information of the Post
                    let postBody = document.createElement('div');
                    postBody.setAttribute('class', 'body');
                    postBody.innerHTML = `${tweets[i].tweet}`;

                    // Creating the Status Information of the Post
                    let postStatus = document.createElement('div');
                    postStatus.setAttribute('class', 'status');
                    postStatus.innerHTML = `<div class="post-time">
                                                <p>${ tweets[i].timestamp }</p>
                                            </div>
                                            <div class="likes">
                                                <i class="fa-regular fa-heart"></i>
                                                <p class="like-amount">${tweets[i].likes}</p>
                                            </div>`;

                    // Appending All the Created Containers to eachother
                    postContent.appendChild(postUser);
                    postContent.appendChild(postBody);
                    postContent.appendChild(postStatus);
                    postContainer.appendChild(postContent);
                    postStatus.querySelector('.likes').addEventListener('click', () => {
                        window.location = "http://127.0.0.1:8000/login";
                    })
                    document.getElementById(`posts-${postType}`).appendChild(postContainer);
                }
                else{
                    break;
                }
                
            };
        
            
        }
        
    })

    let pageOpt = document.getElementsByClassName('page')
    for(let i = 0; i < pageOpt.length; i++){
        if(pageOpt[i].id == pageNum){
            document.querySelector(`#${postType}-post`).querySelector('#num').innerHTML = pageNum;
            pageOpt[i].style.color = "#91a1ff";
            pageOpt[i].style.textShadow = "0px 0px 12px #91a1ff";
        }
        else{
            pageOpt[i].style.color = "";
            pageOpt[i].style.textShadow = ""
        }
    }
}

function FormView(state){
    if(document.querySelector('#username') != null){
        const formModal = document.querySelector(".modal");
    
        if(state == "on"){
            formModal.style.display = "block";
            scrollTop = window.scrollY || document.documentElement.scrollTop;
            scrollLeft = window.scrollX || document.documentElement.scrollLeft,

                
            window.onscroll = function () {
                window.scrollTo(scrollLeft, scrollTop);
            };
        }
        else{
            formModal.style.display = "none";
            window.onscroll = function () { };
        }
    }
    else{
        window.location = "http://127.0.0.1:8000/login";
    }
    
}

function SubmitPost(){
    fetch("/posts", {
        method: 'POST',
        body: JSON.stringify({
            body: document.querySelector('#text').value
        })
    })
    .then(response => response.json())
    .then(result => {
        location.reload();
        console.log("Done");
    })
}

function SetFollower(input){
    if(document.querySelector('#username') != null){
        target = input.parentElement.parentElement.querySelector('.username').querySelector('.name').innerHTML;
    
        fetch("/followers/", {
            method: 'POST',
            body: JSON.stringify({
                body: target
            })
        })
        .then(response => response.json())
        .then(result => {
            location.reload(true);
        })
    }
    else{
        window.location = "http://127.0.0.1:8000/login";
    }
    
    
}

function RemoveFollower(input){
    target = input.parentElement.parentElement.querySelector('.username').querySelector('.name').innerHTML;
    fetch(`/followers/${document.querySelector('#username').innerHTML}`)
    .then(response => response.json())
    .then(followers => {
        followers.forEach((follower, index) => {
          
            if (follower.follows === target) {
                followers.splice(index, 1); 
                

                fetch(`/followers/${document.querySelector('#username').innerHTML}`, {
                    method: 'POST', 
                    body: JSON.stringify({
                        body: follower.follows
                    })
                })
                .then(result => {
                    location.reload(true)
                })
            }
        });
    })
    
}

function LikePost(input, likeDisplay){
    let likedPosts;
    fetch(`/posts/likedposts-${document.querySelector('#username').innerHTML}`)
    .then(response => response.json())
    .then(tweets => {
        let isLiked = false;
        tweets.forEach(tweet => {
            if(tweet.id == input){
                isLiked = true
            }
        });

        if(isLiked != true){
            let updatedLikes;
            fetch(`/posts/${input}`)
            .then(response => response.json())
            .then(tweet => {
                updatedLikes = tweet.likes + 1;
        
                fetch(`/posts/${input}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        likes: updatedLikes
                    })
                })
                .then(result => {
                    likeDisplay.querySelector('.likes').innerHTML = `<i class="fa-solid fa-heart"></i>
                                                                    <p class="like-amount">${updatedLikes}</p>`
                })
            })
        }
        else{
            DislikePost(input, likeDisplay);
        }
    })
    
    
}

function DislikePost(input, likeDisplay){
    let likedPosts;
    fetch(`/posts/likedposts-${document.querySelector('#username').innerHTML}`)
    .then(response => response.json())
    .then(tweets => {
        let updatedLikes;
        fetch(`/posts/${input}`)
        .then(response => response.json())
        .then(tweet => {
            
            console.log(tweet.likes)
            if(tweet.likes > 0){
                updatedLikes = tweet.likes - 1;
            }
            else{
                updatedLikes = 0;
            }
            console.log(updatedLikes)
            fetch(`/posts/${input}`, {
                method: "PUT",
                body: JSON.stringify({
                    likes: updatedLikes
                })
            })
            .then(result => {
                likeDisplay.querySelector('.likes').innerHTML = `<i class="fa-regular fa-heart"></i>
                                                                <p class="like-amount">${updatedLikes}</p>`
            })
        })
        
    })
    
    
}

function EditPost(input, element){
    oldPost = element.parentElement.parentElement.querySelector(".body").innerHTML;
    target = element.parentElement.parentElement.querySelector(".body");

    target.innerHTML = `<textarea id="edit-text" style="font-family: Arial; font-size:1rem; border: 1px dotted white; width: 100%; box-sizing: border-box; padding:6px; border-radius: 12px;">${oldPost}</textarea>`
    target.querySelector('#edit-text').addEventListener('keypress', (event) => {
        if(event.keyCode === 13){
            event.preventDefault()
            fetch(`/posts/${input}`, {
                method: "PUT",
                body: JSON.stringify({
                    tweet: target.querySelector('#edit-text').value
                })
            })
            .then(result => {
                target.innerHTML = target.querySelector('#edit-text').value;
            })
        }
        
    })
}