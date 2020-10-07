const { Octokit } = require("@octokit/core");

const config = require("./config.json");
const octokit = new Octokit({ auth: config.githubPersonalAccessToken });

const fileUpload = async() => {
    try {
        const contentEncoded = fs.readFileSync("./test.txt", "utf-8").toString("base64");

        const { data } = await octokit.repos.createOrUpdateFileContents({
            owner: "PatheticMustan",
            repo: "ProdigySource",
            path: "OUTPUT.md",
            message: "feat: Added OUTPUT.md programatically",
            content: contentEncoded,
            committer: {
                name: `Octokit Bot`,
                email: "your-email",
            },
            author: {
                name: "Octokit Bot",
                email: "your-email",
            },
        });

        console.log(data);
    } catch (err) {
        console.error(err);
    }

    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner: "PatheticMustan",
        repo: "ProdigySource",
        path: "test.txt",
        message: "git commit message thingy",
        content: "somebody once told me the world was gonna roll me"
    })
}

fileUpload();