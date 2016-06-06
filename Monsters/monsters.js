var request = require("request");
var AuthDetails = require("../../auth.json");

var fs = require('fs');
var path = require('path');

var diretoryTreeToObj = function (dir, done) {
    var results = [];

    fs.readdir(dir, function (err, list) {
        if (err)
            return done(err);

        var pending = list.length;

        if (!pending)
            return done(null, {name: path.basename(dir), type: 'folder', children: results});

        list.forEach( function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                   
                } else {
                    var filename = path.basename(file)
                    results.push(filename.substr(0, filename.length-9).replace(/-/g, " "));
                    if (!--pending)
                        done(null, results);
                }
            });
        });
    });
};

var mobList;
var dirTree = ('/home/discordbot/plugins/Monsters/data');

diretoryTreeToObj(dirTree, function (err, res){
    if(err)
        console.error(err);
    mobList = res;
});

function search(array, term) {
    var results;
    term = term.toLowerCase();
    results = array.filter( function (entry) {
        return entry.toLowerCase().indexOf(term) !== -1;
    });
    return results;
}


exports.commands = [
	"mob", // gives dnd 5e spell info on anything that matches
    "mobs" // shows data count
];

exports.mob = {
	usage: "<search query> || !mob gob",
	description: "Returns mob data on whatever ",
	process: function (bot, msg, args) {
        var term = args.toLowerCase().replace(/\s/g, "-");
        if (term == "") {
            bot.sendMessage(msg.channel, "The correct syntax is `!mob <query>`"); 
            return;
        }
        var results = search(mobList, term);
        var others = [];
        if (results.length != 0 ) {
            var perfect = results.indexOf( args.toLowerCase() );
             
            if (perfect >= 0) {
                var single = results.splice(perfect, 1);
                others = results;
                results = single;
            }
            if (results.length > 1) {
                bot.sendMessage(msg.channel, "I found **" + results.length + "** mobs matching that term: ```" + results.join (", ") + "```");
            } else {
                var file = results[0].replace(/\s/g, "-") + ".markdown";
                console.log("Trying to pull " + file); 
                var filename = '/home/discordbot/plugins/Monsters/data/' + file;
                fs.readFile(filename, 'utf8', function (err, data) {
                    if (err) throw err;
                    //var title = results[0].toUpperCase();
                    // var tags = edits[1].match(/(?:tags:\s+")(.+)(?:")/g);
                    var meat = data;
                    if (others.length > 0) {
                        bot.sendMessage(msg.channel, "I found **" + others.length + "** other mobs matching that term: ```" + others.join (", ") + "```");
                    }
                    setTimeout( function () {
                         bot.sendMessage(msg.channel, meat);
                    },200);
                });
            }
        } else {
            bot.sendMessage(msg.channel, "I have nothing on that..."); 
        }
	}
}


exports.mobs = {
	usage: "",
	description: "Reloads mobs and shows count.",
	process: function (bot, msg, args) {
        diretoryTreeToObj(dirTree, function (err, res){
            if(err)
                console.error(err);
            mobList = res;
            bot.sendMessage(msg.channel, "I have data on " + mobList.length + " mobs. Search for one with `!mob <mobname>`"); 
        });
	}
}
