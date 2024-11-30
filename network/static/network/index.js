document.addEventListener("DOMContentLoaded", function(){
    ChangePage('all');
    if(document.querySelector("#following") != null){
        document.querySelector("#following").addEventListener("click", () => ChangePage("following"));
    }
    
    document.querySelector(".form-button").addEventListener("click", () => FormView("on"));
    document.querySelector(".close-form").addEventListener("click", () => FormView("off"));
    document.querySelector("#post-form").addEventListener('submit', event => {
        event.preventDefault();
        SubmitPost();
    });
});

function ChangePage(pagetype){
    const page = document.querySelector(`#${pagetype}-post`);
    const pages = document.getElementsByClassName('post-type');

    for(let i = 0; i < pages.length; i++){
        if(pages[i] == page){
            pages[i].style.display = "block";
            ViewPosts(pagetype);
        }
        else{
            pages[i].style.display = "none";
        }
    }
}

function ViewPosts(postType){
    document.getElementById(`posts-${postType}`).innerHTML = "";
    let userFollowers = [];
    console.log(postType)
    // Gathering the Followers of Request User through API
    fetch(`/followers/${document.querySelector('#username').innerHTML}`)
    .then(response => response.json())
    .then(followers => {
        followers.forEach(follower => {
            userFollowers.push(follower.follows);
        });
        console.log(userFollowers)
    })

    // Creating Posts Boxes
    fetch(`/posts/${postType}`)
    .then(response => response.json())
    .then(tweets => {
        tweets.forEach(tweet => {
            let isFollow = false;
            for(let i = 0; i < userFollowers.length; i++){
                if(tweet.user == userFollowers[i]){
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
                                        <p class="name">${tweet.user}</p>
                                    </div>`;
            if(isFollow == false && document.querySelector('#username').innerHTML != tweet.user){ // Checking If The User is Followed by Request User
                let followBtn = document.createElement('div');
                followBtn.setAttribute('class', 'follow-btn');
                followBtn.innerHTML = `<button class="follow" onclick="SetFollower(this)">
                                            Follow
                                        </button>`;
                postUser.appendChild(followBtn);
            }
            else if(isFollow == true && document.querySelector('#username').innerHTML != tweet.user){
                let unfollowBtn = document.createElement('div');
                unfollowBtn.setAttribute('class', 'unfollow-btn');
                unfollowBtn.innerHTML = `<button class="Unfollow" onclick="RemoveFollower(this)">
                                            Unfollow
                                        </button>`;
                postUser.appendChild(unfollowBtn);
            }
            
            
            // Creating the Body Information of the Post
            let postBody = document.createElement('div');
            postBody.setAttribute('class', 'body');
            postBody.innerHTML = `${tweet.tweet}`;

            // Creating the Status Information of the Post
            let postStatus = document.createElement('div');
            postStatus.setAttribute('class', 'status');
            postStatus.innerHTML = `<div class="post-time">
                                        <p>${ tweet.timestamp }</p>
                                    </div>
                                    <div class="likes">
                                        <i class="fa-regular fa-heart"></i>
                                        <p class="like-amount">${tweet.likes}</p>
                                    </div>`;

            // Appending All the Created Containers to eachother
            postContent.appendChild(postUser);
            postContent.appendChild(postBody);
            postContent.appendChild(postStatus);
            postContainer.appendChild(postContent);
            document.getElementById(`posts-${postType}`).appendChild(postContainer);
        });
    
        
    })
}

function FormView(state){
    if(document.querySelector('#username') != null){
        const formModal = document.querySelector(".modal");
    
        if(state == "on"){
            formModal.style.display = "block";
        }
        else{
            formModal.style.display = "none";
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
    target = input.parentElement.parentElement.querySelector('.username').querySelector('.name').innerHTML;
    
    fetch("/followers/", {
        method: 'POST',
        body: JSON.stringify({
            body: target
        })
    })
    .then(response => response.json())
    .then(result => {
        input.innerHTML = "Followed";
        input.style.opacity = "0.8";
        console.log("done");
    })
    
}

function RemoveFollower(input){
    target = input.parentElement.parentElement.querySelector('.username').querySelector('.name').innerHTML;
    fetch(`/followers/${document.querySelector('#username').innerHTML}`)
    .then(response => response.json())
    .then(followers => {
        followers.forEach((follower, index) => {
            console.log(follower);
            console.log(target);

            if (follower.follows === target) {
                //Remeber t write a put method to delete objects
            }
        });
    })
    
}