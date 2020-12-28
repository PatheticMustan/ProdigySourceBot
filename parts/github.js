const config = require("../config.json");

const signale = require('signale-logger');
const logger = signale.scope("Github");

const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
    auth: config.tokens.github
});

const githubCheckIfUploaded = async (fileName) => {
    logger.pending(`Looking up ${config.github.repoInfo.owner}/${config.github.repoInfo.repo}/${fileName} on Github...`)

    const listCommits = await octokit.repos.listCommits({
        owner: config.github.repoInfo.owner,
        repo: config.github.repoInfo.repo,
        path: fileName
    })
    .catch(err => logger.fatal(err));

    if (listCommits?.data?.length) {
        logger.warn(`Already uploaded ${fileName} (${listCommits?.data?.[0]?.sha}), exiting`);
        return true;
    } else {
        logger.pending(`Uploading ${fileName}`);
        return false;
    }
}

const githubFileUpload = async (fileName, content, commitMessage) => {
    const contentEncoded = Buffer.from(content).toString("base64");
    const cm = commitMessage || `Update ${fileName}`;
    let error = false;

    logger.log("Uploading to Github...");

    logger.time("File Upload");
    const commitData = await octokit.repos.createOrUpdateFileContents({
        owner: config.github.repoInfo.owner,
        repo: config.github.repoInfo.repo,

        committer: config.github.authorInfo,
        author: config.github.authorInfo,
        path: fileName,

        message: cm,
        content: contentEncoded
    })
    .catch(err => {logger.error(`[ERROR] ${err.message}`); error = true});

    

    logger.timeEnd("File Upload");
    if (!error) {
        logger.log(`${commitMessage}`);
    }
}

module.exports = {
    githubCheckIfUploaded,
    githubFileUpload
}