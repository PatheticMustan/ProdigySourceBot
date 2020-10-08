const { Octokit } = require("@octokit/rest");
const fs = require("fs");

const config = require("./config.json");
const octokit = new Octokit({
    auth: config.githubPersonalAccessToken
});

const fileUpload = async () => {
    const fileContent = fs.readFileSync("./test.txt", "utf-8");

    const contentEncoded = Buffer.from(fileContent).toString("base64");
    console.log(contentEncoded);

    const { data } = await octokit.repos.createOrUpdateFileContents({
        owner: "PatheticMustan",
        repo: "ProdigySource",

        path: "test.txt",
        message: "test",
        content: contentEncoded,
        
        committer: config.githubInfo,
        author: config.githubInfo
    })
    .then(res => console.log(res))
    .catch(err => console.error(err));
}

fileUpload();