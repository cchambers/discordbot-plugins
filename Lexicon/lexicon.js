var request = require("request");
var AuthDetails = require("../../auth.json");

var fs = require('fs');
var path = require('path');

var shelf = {
    directory: __dirname,
    lexicon: {
        backgrounds: [],
        classes: [],
        conditions: [],
        feats: [],
        info: [],
        monsters: [],
        races: [],
        shop: [],
        spells: []
    },

    dataFolder: __dirname + '/data',

    init: function () {
        // make this build from the dir structure in the future

        shelf.diretoryTreeToObj(where, function (err, res) {
            if (err)
                console.error(err);
            var types = res;
            for (var type in types) {
                shelf.lexicon[type] = [];
                var where = shelf.dataFolder + "/" + type;
                shelf.getTreeData(type, where);
            }
        });

        
    },

    diretoryTreeToObj: function (dir, done) {
        var results = [];
        fs.readdir(dir, function (err, list) {
            if (err)
                return done(err);

            var pending = list.length;
            if (!pending)
                return done(null, { name: path.basename(dir), type: 'folder', children: results });

            list.forEach(function (file) {
                file = path.resolve(dir, file);
                fs.stat(file, function (err, stat) {
                    if (stat && stat.isDirectory()) {

                    } else {
                        var filename = path.basename(file)
                        results.push(filename.substr(0, filename.length - 9));
                        if (!--pending)
                            done(null, results);
                    }
                });
            });
        })
    },

    getTreeData: function (which, where) {
        shelf.diretoryTreeToObj(where, function (err, res) {
            if (err)
                console.error(err);
            shelf.lexicon[which] = res;
        });
    },

    search: function (term, callback) {
        var results = [];
        var total = [];
        var activeDirectory;
        for (var array in shelf.lexicon) {
            var matches = shelf.lexicon[array].filter(function (entry) {
                return entry.toLowerCase().indexOf(term) !== -1;
            });
            if (matches.length > 0) {
                activeDirectory = array;
                total = total.concat(matches);
                var which = array.toUpperCase();
                var text = ("**in *" + which + "*...** ```" + matches.join(", ") + "```");
                results.push(text);
            }
        }

        results = results.join("");

        if (total.length == 1) {
            var file = shelf.dataFolder + "/" + activeDirectory + "/" + total[0].replace(/\s/g, "-") + ".markdown";
            fs.readFile(file, 'utf8', function (err, data) {
                if (err) throw err;
                results = data;
                callback(results);
            });
        } else {

            if (typeof (callback) == "function") {
                callback(results);
            } else {
                return results;
            }
        }

    },

    deliver: function (bot, channel, message) {
        var messages = message.split("===");
        for (var x = 0; x < messages.length; x++) {
            var delay = 500 * x;
            shelf.sendMessage(bot, channel, messages[x], delay);
        }
    },

    sendMessage: function (bot, channel, message, delay) {
        setTimeout(function () {
            bot.sendMessage(channel, message);
        }, delay);
    }
}

shelf.init();

exports.commands = [
    "find",
    "finds"
];

exports.find = {
    usage: "<search query>",
    description: "Returns data on whatever it finds.",
    process: function (bot, msg, args) {
        var term = args.toLowerCase().replace(/\s/g, "-");
        if (term == "") {
            bot.sendMessage(msg.channel, "The correct syntax is `!find <query>`");
            return;
        }

        var results = shelf.search(term, function (data) {
            shelf.deliver(bot, msg.channel, data);
        });

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
