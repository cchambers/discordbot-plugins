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

var dataList;
var dirTree = ('/home/discordbot/plugins/Classes/data');

diretoryTreeToObj(dirTree, function (err, res){
    if(err)
        console.error(err);
    dataList = res;
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
	"class", // gives dnd 5e spell info on anything that matches
    "classes" // shows data count
];

exports.class = {
	usage: "<search query> || !class gob",
	description: "Returns class data on whatever ",
	process: function (bot, msg, args) {
        var results = search(dataList, args);
        var others = [];
        if (results.length != 0 ) {
            var perfect = results.indexOf( args.toLowerCase() );
             
            if (perfect >= 0) {
                var single = results.splice(perfect, 1);
                others = results;
                results = single;
            }
            if (results.length > 1) {
                bot.sendMessage(msg.channel, "I found **" + results.length + "** classes matching that term: ```" + results.join (", ") + "```");
            } else {
                var file = results[0].replace(/\s/g, "-") + ".markdown";
                console.log("Trying to pull " + file); 
                var filename = '/home/discordbot/plugins/Classes/data/' + file;
                fs.readFile(filename, 'utf8', function (err, data) {
                    if (err) throw err;
                    //var title = results[0].toUpperCase();
                    // var tags = edits[1].match(/(?:tags:\s+")(.+)(?:")/g);
                    var meat = data;
                    if (others.length > 0) {
                        bot.sendMessage(msg.channel, "I found **" + others.length + "** other classes matching that term: ```" + others.join (", ") + "```");
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


exports.classes = {
	usage: "",
	description: "Reloads classes and shows count.",
	process: function (bot, msg, args) {
        diretoryTreeToObj(dirTree, function (err, res){
            if(err)
                console.error(err);
            dataList = res;
            bot.sendMessage(msg.channel, "I have data on " + dataList.length + " classes. Search for one with `!class <classname>`  ```" + dataList.join(", ") + "```"); "); 
        });
	}
}
