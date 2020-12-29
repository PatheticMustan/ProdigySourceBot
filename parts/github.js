const config = require("../config.json");
const env = require('dotenv').config().parsed;

const signale = require("signale-logger");
const logger = signale.scope("GH");

const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
    auth: env.githubToken
});

const githubFileUpload = async (fileName, content, commitMessage) => {
    const contentEncoded = Buffer.from(content).toString("base64");
    const cm = commitMessage || `Update ${fileName}`;
    let error = false;

    const commitData = await octokit.repos.createOrUpdateFileContents({
        owner: config.github.repoInfo.owner,
        repo: config.github.repoInfo.repo,

        committer: config.github.authorInfo,
        author: config.github.authorInfo,
        path: fileName,

        message: cm,
        content: contentEncoded
    })
    .catch(err => {
        error = true;
        
        if (err.message === "Invalid request.\n\n\"sha\" wasn't supplied.") {
            logger.warn("File already uploaded.");
        } else {
            logger.fatal(err.message);
        }
    });

    if (!error) {
        logger.success(`${commitMessage}`);
    }
}

module.exports = {
    githubFileUpload
}