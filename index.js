const { Octokit } = require("@octokit/rest");
const fs = require("fs");

const config = require("./config.json");
const octokit = new Octokit({
    auth: config.githubPersonalAccessToken
});

`https://api.github.com/repos/${config.githubRepoInfo.owner}/${config.githubRepoInfo.repo}/contents/test.txt`

const fileUpload = async () => {
    const fileContent = fs.readFileSync("./test.txt", "utf-8");

    const contentEncoded = Buffer.from(fileContent).toString("base64");

    const fileSha = await octokit.repos.getContent({
        owner: config.githubRepoInfo.owner,
        repo: config.githubRepoInfo.repo,
        path: "deletelater.txt",
    })
    .then(res => res.data.sha)
    .catch(err => console.error(err));

    console.log("eeeeee: " + fileSha);

    /*const commitData = await octokit.repos.createOrUpdateFileContents({
        owner: config.githubRepoInfo.owner,
        repo: config.githubRepoInfo.repo,
        committer: config.githubInfo,
        author: config.githubInfo,

        sha: "",

        path: "deletelater.txt",
        message: "test v2",
        content: contentEncoded
    })
    .then(res => console.log(res))
    .catch(err => console.error(err));*/

    
}

fileUpload();