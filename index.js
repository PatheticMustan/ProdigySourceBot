const { Octokit } = require("@octokit/core");
const config = require("config.json");

const octokit = new Octokit({ auth: config.githubAuthToken });

await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner: "PatheticMustan",
    repo: "ProdigySource",
    path: "",
    message: "message",
    content: "content"
})