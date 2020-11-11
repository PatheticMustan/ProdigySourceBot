const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const fetch = require('node-fetch');
const Discord = require("discord.js");
const config = require("./config.json");
const octokit = new Octokit({
    auth: config.tokens.github
});

const getProdigyStatus = async () => {
    return await (await fetch("https://api.prodigygame.com/game-api/status")).json();
}

const getProdigyEducationStatus = async () => {
    return await (await fetch("https://api.prodigygame.com/education-api/status")).json();
}

const githubFileUpload = async (fileName, content) => {
    const contentEncoded = Buffer.from(content).toString("base64");

    console.log(`Looking up ${config.github.repoInfo.owner}/${config.github.repoInfo.repo}/${fileName} on Github...`)
    const fileData = await octokit.repos.getContent({
        owner: config.github.repoInfo.owner,
        repo: config.github.repoInfo.repo,
        path: fileName,
    })
    .catch(err => console.error(err));

    if (fileData?.data?.sha) {
        console.log(`File sha: ${fileData.data.sha}.`);
    } else {
        console.log("File doesn't exist!")
    }

    const commitData = await octokit.repos.createOrUpdateFileContents({
        owner: config.githubRepoInfo.owner,
        repo: config.githubRepoInfo.repo,
        committer: config.githubInfo,
        author: config.githubInfo,

        // If the sha exists, put it in! Otherwise just meh
        sha: (fileData?.data?.sha ? fileData.data.sha : ""),

        path: fileName,
        message: `Update ${fileName}`,
        content: contentEncoded
    })
    .then(res => console.log(res))
    .catch(err => console.error(err));
}

const main = async () => {
    let last = {
        version: undefined,
        build: undefined,
        educationDataVersion: undefined,
        educationFrontendVersion: undefined
    }

    const hook = new Discord.WebhookClient(
        config.discord.webhookID,
        config.discord.webhookToken
    );

    const sendNew = async (name, color, lastValue, newValue) => {
        await hook.send({
            "title": `New Prodigy ${name}`,
            "color": color,
            "fields": [
                { "name": `Last ${name}`, "value": lastValue, "inline": true },
                { "name": `New ${name}`, "value": newValue, "inline": true }
            ]
        });
    }

    // taken from Prodigy-Hacking/Redirector/index.ts#L20-L31
    const interval = setInterval(async () => {
        const status = await getProdigyStatus();
        const educationStatus = await getProdigyEducationStatus()

        const version = status?.data?.gameClientVersion;
        const build = status?.data?.prodigyGameFlags?.gameDataVersion;
        const educationDataVersion = educationStatus?.data?.educationDataVersion;
        const educationFrontendVersion = educationStatus?.data?.educationFrontendVersion;

        // if it's undefined, set it...
        last.version = last.version?? version;
        last.build = last.build?? build;
        last.educationDataVersion = last.educationDataVersion?? educationDataVersion;
        last.educationFrontendVersion = last.educationFrontendVersion?? educationFrontendVersion;

        
        if (last.version !== version) {
            // 11343081 #AD14E9, why is her name everywhere
            sendNew("Version", 11343081, last.version, version);
        }

        if (last.build !== build) {
            // 1370388 #14e914
            sendNew("Build", 1370388, last.build, build);
        }

        if (last.educationDataVersion !== educationDataVersion) {
            // 15300372 #e97714
            sendNew("Education Data Version", 15300372, last.educationDataVersion, educationDataVersion);
        }

        if (last.educationFrontendVersion !== educationFrontendVersion) {
            // 1366249 #14d8e9
            sendNew("Education Frontend Version", 1366249, last.educationFrontendVersion, educationFrontendVersion);
        }
    }, 10 * 60 * 1000);

    // githubFileUpload()
}

main();