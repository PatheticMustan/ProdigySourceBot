const fetch = require("node-fetch");

(async () => {
    const json = (await (await fetch("https://play.prodigygame.com/play")).text()).match(
            /(?<=gameStatusDataStr = ').+(?=')/
        )[0];

    console.log(JSON.parse(json));
})()