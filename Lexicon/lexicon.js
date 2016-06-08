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
    dataList,
    dataFolder: shelf.directory + '/data',
    init: function () {
        // make this build from the dir structure in the future
        for (var type in shelf.lexicon) {
            var where = shelf.dataFolder + "/" + type;
            shelf.getTreeData(type, where);
        }
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
        diretoryTreeToObj(where, function (err, res) {
            if (err)
                console.error(err);
            shelf.lexicon[which] = res;
            console.log(which, shelf.lexicon[which].length);
        });
    },

    search: function (term, callback) {
        var results = [];
        for (var array in shelf.lexicon) {
            var matches = shelf.lexicon[array].filter(function (entry) {
                return entry.toLowerCase().indexOf(term) !== -1;
            });
            if (matches.length > 0) {
                console.log(array + " matches:", matches);
                results.push[matches];
            }
        }
        if (typeof (callback) == "function") {
            callback(results);
        } else {
            return results;
        }
    },

    deliver: function (message, channel, delay) {
        setTimeout(function () {
            bot.sendMessage(channel, message);
        }, delay);
    },

    searchHandler: function (data) {
        console.log("Handled:", data);
    }
}

shelf.init();

// var directory = __dirname;

// var lexicon = {
//     backgrounds: [],
//     classes: [],
//     conditions: [],
//     feats: [],
//     info: [],
//     monsters: [],
//     races: [],
//     shop: [],
//     spells: []
// }

// var types = [];

// var dataList;
// var dataFolder = directory + '/data';

// function diretoryTreeToObj(dir, done) {
//     var results = [];
//     fs.readdir(dir, function (err, list) {
//         if (err)
//             return done(err);

//         var pending = list.length;

//         if (!pending)
//             return done(null, { name: path.basename(dir), type: 'folder', children: results });

//         list.forEach(function (file) {
//             file = path.resolve(dir, file);
//             fs.stat(file, function (err, stat) {
//                 if (stat && stat.isDirectory()) {

//                 } else {
//                     var filename = path.basename(file)
//                     results.push(filename.substr(0, filename.length - 9));
//                     if (!--pending)
//                         done(null, results);
//                 }
//             });
//         });
//     });
// };

// function getTreeData(which, where) {
//     diretoryTreeToObj(where, function (err, res) {
//         if (err)
//             console.error(err);
//         lexicon[which] = res;
//         console.log(which, lexicon[which].length);
//     });
// }

// function search(term, callback) {
//     var results = [];
//     for (var array in lexicon) {
//         types.push(array);
//         var matches = lexicon[array].filter(function (entry) {
//             return entry.toLowerCase().indexOf(term) !== -1;
//         });
//         console.log("><><>< matches:", matches);
//         results.push[matches];
//     }
//     console.log(types);
//     return results;
// }
// function sendMessages(message, channel, delay) {
//     setTimeout(function () {
//         bot.sendMessage(channel, message);
//     }, delay);
// }

// function init() {
//     for (var type in lexicon) {
//         var where = dataFolder + "/" + type;
//         getTreeData(type, where);
//     }
// }

// function handleSearch(data) {
//     console.log("Handled:", data);
// }

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

        var results = shelf.search(term, shelf.handleSearch);
        // var others = [];

        // if (results.length != 0) {
        //     var perfect = results.indexOf(args.toLowerCase().replace(/\s/g, "-"));
        //     if (perfect >= 0) {
        //         var single = results.splice(perfect, 1);
        //         others = results;
        //         results = single;
        //     }

        //     if (results.length > 1) {
        //         bot.sendMessage(msg.channel, "I found **" + results.length + "** results matching that term: ```" + results.join(", ") + "```");
        //     } else {
        //         var file = results[0].replace(/\s/g, "-") + ".markdown";
        //         var filename = '/home/discordbot/plugins/Races/data/' + file;
        //         console.log("Trying to pull " + filename);
        //         fs.readFile(filename, 'utf8', function (err, data) {
        //             if (err) throw err;
        //             var meat = data;
        //             if (others.length > 0) {
        //                 bot.sendMessage(msg.channel, "I found **" + others.length + "** other results matching that term: ```" + others.join(", ") + "```");
        //             }
        //             setTimeout(function () {
        //                 bot.sendMessage(msg.channel, meat);
        //             }, 200);
        //         });
        //     }
        // } else {
        //     bot.sendMessage(msg.channel, "I have nothing on that...");
        // }
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
