const fetch = require("node-fetch");

(async () => {
    const json = (await (await fetch("https://math.prodigygame.com/play?launcher=true")).text()).match(
            /(?<=gameStatusDataStr = ').+(?=')/
        )[0];

    console.log(JSON.parse(json));
})()