const { Octokit } = require("@octokit/rest");
const fs = require("fs");

const config = require("./config.json");
const octokit = new Octokit({
    auth: config.tokens.github
});

const fileUpload = async () => {
    const fileContent = fs.readFileSync("./test.txt", "utf-8");

    const contentEncoded = Buffer.from(fileContent).toString("base64");

    const fileData = await octokit.repos.getContent({
        owner: config.github.repoInfo.owner,
        repo: config.github.repoInfo.repo,
        path: "doesn't exist.txt",
    })
    .catch(err => console.error(err));

    if (fileData?.data?.sha) {
        console.log("file sha: " + fileData.data.sha);
    } else {
        console.log("file doesn't exist!")
    }

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