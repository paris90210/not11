require("dotenv").config();
module.exports = {
  token: process.env.Token || "",// here goes your token
  mongo: process.env.MongoDb || "", // here goes your mongodb link
  prefix: ".",
  audionodes: [
    {
      name: "Main",
      url: "lavalink.fluiddev.xyz:80",
      auth: "fluiddev",
    },
  ],
  embed_color: process.env.Color || "#2f3136",
  icon: process.env.Icon || "https://media.discordapp.net/attachments/1010015550786777189/1015204559288795206/image_23.jpg?width=689&height=689",
  links: {
    support: `https://media.discordapp.net/attachments/1010015550786777189/1015204559288795206/image_23.jpg?width=689&height=689`,
    invite: `https://media.discordapp.net/attachments/1010015550786777189/1015204559288795206/image_23.jpg?width=689&height=689`,
    vote: `https://media.discordapp.net/attachments/1010015550786777189/1015204559288795206/image_23.jpg?width=689&height=689`
  }
};
