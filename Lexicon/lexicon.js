var request = require("request");
var AuthDetails = require("../../auth.json");

var fs = require('fs');
var path = require('path');

var lexicon = {
    backgrounds: [],
    classes: [],
    conditions: [],
    feats: [],
    info: [],
    monsters: [],
    races: [],
    shop: [],
    spells: []
}

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
                    results.push(filename.substr(0, filename.length-9));
                    if (!--pending)
                        done(null, results);
                }
            });
        });
    });
};

var dataList;
var dirTree = ('/home/discordbot/plugins/Races/data');
console.log("LEXICON:", __dirname);
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
	"find", 
    "finds"
];

exports.race = {
	usage: "<search query>",
	description: "Returns data on whatever it finds.",
	process: function (bot, msg, args) {
        var term = args.toLowerCase().replace(/\s/g, "-");
        if (term == "") {
            bot.sendMessage(msg.channel, "The correct syntax is `!find <query>`"); 
            return;
        }
        
        var results = search(dataList, term);
        var others = [];
        
        if (results.length != 0 ) {
            var perfect = results.indexOf( args.toLowerCase().replace(/\s/g, "-") );
            if (perfect >= 0) {
                var single = results.splice(perfect, 1);
                others = results;
                results = single;
            }
            
            if (results.length > 1) {
                bot.sendMessage(msg.channel, "I found **" + results.length + "** results matching that term: ```" + results.join (", ") + "```");
            } else {
                var file = results[0].replace(/\s/g, "-") + ".markdown";
                console.log("Trying to pull " + file); 
                var filename = '/home/discordbot/plugins/Races/data/' + file;
                fs.readFile(filename, 'utf8', function (err, data) {
                    if (err) throw err;
                    var meat = data;
                    if (others.length > 0) {
                        bot.sendMessage(msg.channel, "I found **" + others.length + "** other results matching that term: ```" + others.join (", ") + "```");
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


exports.finds = {
	usage: "",
	description: "Short explaination of the Lexicon.",
	process: function (bot, msg, args) {
       // finds what?
       return;
	}
}
