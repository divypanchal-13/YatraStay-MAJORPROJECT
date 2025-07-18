const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

main()
    .then(() => {
        console.log(" 😀connected to DB🫡 ");
    }).catch((err) => {
        console.error("ERROR in Connection with DB😓 : ", err);
    });

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/YatraStay');
}

const initDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();