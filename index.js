// const fs = require("fs");
const fetch = require("node-fetch");

const signale = require("signale-logger");
const logger = signale.scope("MN");

const env = require('dotenv').config().parsed;

const Discord = require("discord.js");
const { js } = require("js-beautify");

const { githubFileUpload } = require("./parts/github");

let last = {
    version: undefined,
    build: undefined,
    educationDataVersion: undefined,
    educationFrontendVersion: undefined
}

const hook = new Discord.WebhookClient(
    env.discordWebhookID,
    env.discordWebhookToken
);

const createEmbedObject = (name, color, lastValue, newValue) => ({
    title: `${name}`,
    color: color,
    fields: [{ name: "Last", value: lastValue, inline: true }, { name: "New", value: newValue, inline: true }]
});

const main = async () => {
    // taken from Prodigy-Hacking/Redirector/index.ts#L20-L31
    logger.log("new run");
    
    let status,
        educationStatus;

    try {
        status = JSON.parse(
                (await (
                    await fetch("https://play.prodigygame.com/play")
                ).text()).match(/(?<=gameStatusDataStr = ').+(?=')/)[0]
            );
        educationStatus = await (await fetch("https://api.prodigygame.com/education-api/status")).json();
    } catch (e) {
        logger.fatal(e);
    }

    logger.log(status);

    const version = status?.gameClientVersion;
    const build = status?.prodigyGameFlags?.gameDataVersion;
    const educationDataVersion = educationStatus?.data?.educationDataVersion;
    const educationFrontendVersion = educationStatus?.data?.educationFrontendVersion;

    logger.log(version, build, educationDataVersion, educationFrontendVersion);

    // if it's undefined, set it...
    last.version = last.version?? version;
    last.build = last.build?? build;
    last.educationDataVersion = last.educationDataVersion?? educationDataVersion;
    last.educationFrontendVersion = last.educationFrontendVersion?? educationFrontendVersion;

    const embeds = [];
    
    if (last.version !== version) {
        // 11343081 #AD14E9, no matter where I go, I see her name
        embeds.push(createEmbedObject("Version", 11343081, last.version, version));

        logger.log("\n\n\n");
        logger.success(`Prodigy Updated: ${last.version} --> ${version}`);
        
        // https://code.prodigygame.com/code/4-13-0/game.min.js
        const gameMin = await fetch(`https://code.prodigygame.com/code/${version}/game.min.js`);

        if (gameMin.ok) {
            logger.success("Successfully fetched, beautifying");
            const beautified = js(await gameMin.text());

            logger.success("Beautified, uploading to Github")
            githubFileUpload(`${version}.js`, beautified, `Updated from ${last.version} to ${version}`);

            // TODO: add twitter bot
        } else {
            logger.fatal(`Unsuccessfully fetched with error ${gameMin.status}`);
        }

        last.version = version;
    }

    if (last.build !== build) {
        // 1370388 #14e914
        embeds.push(createEmbedObject("Build", 1370388, last.build, build));
        last.build = build;
    }

    if (last.educationDataVersion !== educationDataVersion) {
        // 15300372 #e97714
        embeds.push(createEmbedObject("Education Data", 15300372, last.educationDataVersion, educationDataVersion));
        last.educationDataVersion = educationDataVersion;
    }

    if (last.educationFrontendVersion !== educationFrontendVersion) {
        // 1366249 #14d8e9
        embeds.push(createEmbedObject("Education Frontend", 1366249, last.educationFrontendVersion, educationFrontendVersion));
        last.educationFrontendVersion = educationFrontendVersion;
    }

    // if embeds > 0...
    if (embeds.length) {
        await hook.send("", {
            embeds: embeds
        });
    }
}

let pending = false;
const interval = setInterval(async () => {
    if (pending) return;
    pending = true;
    await main();
    pending = false;
}, 10 * 60 * 1000); // runs every 10 minutes

// testing zone
//(async () => {})()