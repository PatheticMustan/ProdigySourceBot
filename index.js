// const fs = require("fs");
const fetch = require("node-fetch");

const signale = require('signale-logger');
const logger = signale.scope("Main");

const config = require("./config.json");

const Discord = require("discord.js");
const { js } = require("js-beautify");

const { githubCheckIfUploaded, githubFileUpload } = require("./parts/github");

const getProdigyStatus = async () => {
    return await (await fetch("https://api.prodigygame.com/game-api/status")).json();
}

const getProdigyEducationStatus = async () => {
    return await (await fetch("https://api.prodigygame.com/education-api/status")).json();
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

    const createEmbedObject = (name, color, lastValue, newValue) => ({
        title: `${name}`,
        color: color,
        fields: [{ name: "Last", value: lastValue, inline: true }, { name: "New", value: newValue, inline: true }]
    });

    // taken from Prodigy-Hacking/Redirector/index.ts#L20-L31
    //const interval = setInterval(async () => {
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

        const embeds = [];
        
        if (true || last.version !== version) {
            // 11343081 #AD14E9, no matter where I go, I see her name
            embeds.push(createEmbedObject("Version", 11343081, last.version, version));

            logger.log("\n\n\n");
            logger.success("New Prodigy version detected");

            if (!await githubCheckIfUploaded(`${version}.js`)) {
                logger.pending(`Fetching ${version} game.min.js`);
                const gameMin = await fetch(`https://code.prodigygame.com/code/${version}/game.min.js`);

                if (gameMin.ok) {
                    logger.success("Successfully fetched, beautify-ing");

                    const beautified = js(await gameMin.text());

                    githubFileUpload(`${version}.js`, beautified, `Updated from ${last.version} to ${version}`);
                    
                    // TODO: add twitter bot
                } else {
                    logger.fatal(`Unsuccessfully fetched with error ${gameMin.status}`);
                }
            }
        }

        if (last.build !== build) {
            // 1370388 #14e914
            embeds.push(createEmbedObject("Build", 1370388, last.build, build));
        }

        if (last.educationDataVersion !== educationDataVersion) {
            // 15300372 #e97714
            embeds.push(createEmbedObject("Education Data", 15300372, last.educationDataVersion, educationDataVersion));
        }

        if (last.educationFrontendVersion !== educationFrontendVersion) {
            // 1366249 #14d8e9
            embeds.push(createEmbedObject("Education Frontend", 1366249, last.educationFrontendVersion, educationFrontendVersion));
        }

        // if embeds > 0...
        if (embeds.length) {
            await hook.send("", {
                embeds: embeds
            });
        }
    //}, 10 * 60 * 1000);
}

main();

// testing zone
//(async () => {})();
