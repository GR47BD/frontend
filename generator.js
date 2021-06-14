let nEdges = process.argv[2];
let nNodes = process.argv[3];
let nJobs = process.argv[4];
let file = process.argv[5];

if(nEdges === undefined) return console.log(nEdges);
if(nNodes === undefined) return console.log(nNodes);
if(nJobs === undefined || nJobs > 26) return console.log(nJobs);
if(file === undefined) return console.log(file);

const {uniqueNamesGenerator, names} = require('unique-names-generator');
const fs = require("fs");
const path = require("path");

const jobList = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
const messageTypes = ["TO", "CC"];
const startDate = new Date("1998-1-1").getTime();
const endDate = new Date("2002-1-1").getTime();
const dateToString = date => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const randomIndex = array => Math.floor(Math.random() * array.length);
const randomItem = array => array[randomIndex(array)];
const distributedItem = (array, f=x => -((x-1)*(x-1)*(x-1))) => {
    const index = randomIndex(array);
    const x = index / array.length
    const upper = f(x);
    
    if(Math.random() < upper) return array[index];
    else return distributedItem(array);
}
const getNonSelectedItem = (array, item) => {
    const selection = distributedItem(array);

    if(selection === array) return getNonSelectedItem(array, item);

    return selection;
}

let edges = [];
let nodes = [];
let jobs = [];

for(let i = 0; i < nJobs; i++) {
    jobs.push(jobList[i]);
}

for(let i = 0; i < nNodes; i++) {
    const id = i;
    const email = `${uniqueNamesGenerator({dictionaries: [names], style: "lowerCase"})}@enron.com`;
    const jobtitle = randomItem(jobs);

    nodes.push({id, email, jobtitle});
}

fs.writeFileSync(path.join(__dirname, file), "date,fromId,fromEmail,fromJobtitle,toId,toEmail,toJobtitle,messageType,sentiment\n");
let str = "";

for(let i = 0; i < nEdges; i++) {
    const date = dateToString(new Date(Math.round(Math.random() * (endDate-startDate) + startDate)));
    const fromNode = distributedItem(nodes);
    const fromId = fromNode.id;
    const fromEmail = fromNode.email;
    const fromJobtitle = fromNode.jobtitle;
    const toNode = getNonSelectedItem(nodes, fromNode);
    const toId = toNode.id;
    const toEmail = toNode.email;
    const toJobtitle = toNode.jobtitle;
    const messageType = randomItem(messageTypes);
    const sentiment = Math.random() * 2 - 1;

    str += `${[date, fromId, fromEmail, fromJobtitle, toId, toEmail, toJobtitle, messageType, sentiment].join(",")}\n`;

    if(i%(Math.round(nEdges/100))===0) {
        console.log(`Now at ${(i/nEdges).toFixed(2) * 100}%`);
        fs.appendFileSync(path.join(__dirname, file), str);
        str = "";
    }
}

fs.appendFileSync(path.join(__dirname, file), str);