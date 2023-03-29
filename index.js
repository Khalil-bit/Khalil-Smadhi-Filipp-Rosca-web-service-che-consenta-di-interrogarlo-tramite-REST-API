"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var https_1 = require("https");
var mysql_1 = require("mysql");
var app = (0, express_1.default)();
// Configurazione del database mysql
var db = mysql_1.default.createConnection({
    host: "127.0.0.1:3306",
    user: "root",
    password: "Mama1122@",
    database: "kf_team"
});
// Connessione al database
db.connect(function (err) {
    if (err)
        throw err;
    console.log("Connessione al database riuscita");
});
// Endpoint per sincronizzare il database con il feed
app.get("/sync-db", function (req, res) {
    https_1.default.get("https://22hbg.com/wp-json/wp/v2/posts/", function (resp) {
        var data = "";
        resp.on("data", function (chunk) {
            data += chunk;
        });
        resp.on("end", function () {
            var posts = JSON.parse(data);
            var values = posts.map(function (post) { return [
                post.id,
                post.title.rendered,
                post.content.rendered,
                new Date(post.date).toISOString().slice(0, 19).replace("T", " "),
            ]; });
            var sql = "INSERT INTO posts (id, title, content, date) VALUES ?";
            db.query(sql, [values], function (err, result) {
                if (err) {
                    console.log("Errore nella sincronizzazione del database: " + err.message);
                    res.status(500).send("Errore nella sincronizzazione del database");
                }
                else {
                    console.log("Sincronizzazione del database riuscita");
                    res.send("Sincronizzazione del database riuscita");
                }
            });
        });
    }).on("error", function (err) {
        console.log("Errore nella sincronizzazione del database: " + err.message);
        res.status(500).send("Errore nella sincronizzazione del database");
    });
});
// Endpoint per ottenere l'elenco di tutti i post dal database
app.get("/posts-db", function (req, res) {
    var sql = "SELECT * FROM posts";
    db.query(sql, function (err, result) {
        if (err) {
            console.log("Errore nella lettura del database: " + err.message);
            res.status(500).send("Errore nella lettura del database");
        }
        else {
            console.log("Lettura del database riuscita");
            res.json(result);
        }
    });
});
// Avvio del server
app.listen(3000, function () {
    console.log("Il server è in ascolto sulla porta 3000");
});
