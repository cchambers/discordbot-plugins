var request = require("request");
var AuthDetails = require("../../auth.json");

var fs = require('fs');
var path = require('path');

var shelf = {
    directory: __dirname,
    lexicon: {},

    init: function () {
        // make this build from the dir structure in the future

        var dataDir = __dirname + "/data";

        shelf.getCategories(dataDir, function (err, res) {
            if (err) console.log(err);

            var types = res;
            for (var type in types) {
                var name = types[type];
                shelf.lexicon[name] = [];
                var where = dataDir + "/" + name;
                shelf.getTreeData(name, where);
            }
        });
    },

    transformMap: {
        spells: function (title, data) {
            var edits = data.split("---");
            title = title.toUpperCase();
            // var tags = edits[1].match(/(?:tags:\s+")(.+)(?:")/g);
            var tags = edits[1].split("tags:")[1];
            var meat = edits[2];
            var cleaned = "__**" + title + "**__ ```" + tags + "``` " + meat;
            return cleaned;
        }

    },

    getCategories: function (dir, done) {
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
                    var filename = path.basename(file)
                    results.push(filename);
                    if (!--pending)
                        done(null, results);
                });
            });
        })
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
        var wheres = [];
        var activeDirectory;
        var perfect = false;
        for (var array in shelf.lexicon) {
            var matches = shelf.lexicon[array].filter(function (entry) {
                return entry.toLowerCase().indexOf(term) !== -1;
            });
            if (matches.length > 0) {
                activeDirectory = array;
                for (var i = 0; i < matches.length; i++) {
                    wheres.push(activeDirectory);
                }
                total = total.concat(matches);
                var which = array.toUpperCase();
                var text = ("**in *" + which + "*...** ```" + matches.join(", ") + "```");
                results.push(text);
            }
        }

        for (var x = 0; x < total.length; x++) {
            if (total[x] == term) {
                perfect = term;
            }
        }

        results = results.join("");

        if (total.length == 1 || perfect) {
            var thing = perfect || total[0];
            thing = thing.replace(/\s/g, "-");
            if (perfect) {
                var t = total.indexOf(perfect);
                activeDirectory = wheres[t];
            } else if (total.length > 1) {
                var pos = total.indexOf(thing);
                var others = total.slice(thing, thing);
                // "I found other items matching that query: ```" + others.join(", ") + "```");
            }
            var file = __dirname + "/data/" + activeDirectory + "/" + thing + ".markdown";
            fs.readFile(file, 'utf8', function (err, data) {
                if (err) throw err;
                results = data;
                if (activeDirectory == "spells") {
                    var title = thing.replace(/-/g, " ");
                    results = shelf.transformMap.spells(title, results);
                }
                callback(results);
            });
        } else {
            if (total.length == 0) {

            }

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
    "find"
];

exports.find = {
    usage: "<search query>",
    description: "Returns data on whatever it finds.",
    process: function (bot, msg, args) {
        var term = args.toLowerCase().replace(/\s/g, "-");
        if (term == "") { var array = [];
            for (var item in shelf.lexicon) {
                array.push(item);
            }
            bot.sendMessage(msg.channel, "The correct syntax is `!find <query>` -- I have information for these categories: ```" + array.join(", ") + "```");
            return;
        }

        var results = shelf.search(term, function (data) {
            shelf.deliver(bot, msg.channel, data);
        });

    }
}
