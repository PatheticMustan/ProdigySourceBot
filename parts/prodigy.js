const fetch = require("node-fetch");

const getProdigyStatus = async () => {
    return await (await fetch("https://api.prodigygame.com/game-api/status")).json();
}

const getProdigyEducationStatus = async () => {
    return await (await fetch("https://api.prodigygame.com/education-api/status")).json();
}

module.exports = {
    getProdigyStatus,
    getProdigyEducationStatus
}