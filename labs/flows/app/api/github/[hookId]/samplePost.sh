curl -X POST http://demo.localhost:3000/api/github/cm4kqh91f0003qu9kwpbiuyto \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -H "X-Hub-Signature-256: sha256=your-signature" \
  -H "X-GitHub-Delivery: your-delivery-id" \
  -d '{
    "ref": "refs/heads/main",
    "before": "9049f1265b7d61be4a8904a9a27120d2064dab3b",
    "after": "0000000000000000000000000000000000000000",
    "repository": {
        "id": 12345678,
        "name": "your-repo",
        "full_name": "your-username/your-repo",
        "private": false,
        "owner": {
            "name": "your-username",
            "email": "your-email@example.com"
        }
    },
    "pusher": {
        "name": "your-username",
        "email": "your-email@example.com"
    },
    "sender": {
        "login": "your-username",
        "id": 12345678,
        "avatar_url": "https://avatars.githubusercontent.com/u/12345678?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/your-username",
        "html_url": "https://github.com/your-username",
        "followers_url": "https://api.github.com/users/your-username/followers",
        "following_url": "https://api.github.com/users/your-username/following{/other_user}",
        "gists_url": "https://api.github.com/users/your-username/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/your-username/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/your-username/subscriptions",
        "organizations_url": "https://api.github.com/users/your-username/orgs",
        "repos_url": "https://api.github.com/users/your-username/repos",
        "events_url": "https://api.github.com/users/your-username/events{/privacy}",
        "received_events_url": "https://api.github.com/users/your-username/received_events",
        "type": "User",
        "site_admin": false
    }
}'