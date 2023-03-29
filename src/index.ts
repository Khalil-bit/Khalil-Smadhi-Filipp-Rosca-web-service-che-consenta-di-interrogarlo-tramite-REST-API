import express, {Request, Response} from "express";
import https from "https";
import mysql from "mysql"

const app = express();

// Configurazione del database mysql
const db = mysql.createConnection({
    host: "127.0.0.1:3306",
    user: "root",
    password: "Mama1122@",
    database: "kf_team"
  });
  

  // Connessione al database
db.connect((err) => {
    if (err) throw err;
    console.log("Connessione al database riuscita");
  });
  
  
// Endpoint per sincronizzare il database con il feed
app.get("/sync-db", (req: Request, res: Response) => {
    https.get("https://22hbg.com/wp-json/wp/v2/posts/", (resp) => {
      let data = "";
      resp.on("data", (chunk) => {
        data += chunk;
      });
      resp.on("end", () => {
        const posts = JSON.parse(data);
        const values = posts.map((post: any) => [
          post.id,
          post.title.rendered,
          post.content.rendered,
          new Date(post.date).toISOString().slice(0, 19).replace("T", " "),
        ]);
        const sql = "INSERT INTO posts (id, title, content, date) VALUES ?";
        db.query(sql, [values], (err, result) => {
          if (err) {
            console.log("Errore nella sincronizzazione del database: " + err.message);
            res.status(500).send("Errore nella sincronizzazione del database");
          } else {
            console.log("Sincronizzazione del database riuscita");
            res.send("Sincronizzazione del database riuscita");
          }
        });
      });
    }).on("error", (err) => {
      console.log("Errore nella sincronizzazione del database: " + err.message);
      res.status(500).send("Errore nella sincronizzazione del database");
    });
  });
    
// Endpoint per ottenere l'elenco di tutti i post dal database
app.get("/posts-db", (req: Request, res: Response) => {
    const sql = "SELECT * FROM posts";
    db.query(sql, (err, result) => {
      if (err) {
        console.log("Errore nella lettura del database: " + err.message);
        res.status(500).send("Errore nella lettura del database");
      } else {
        console.log("Lettura del database riuscita");
        res.json(result);
      }
    });
  });
  
  // Avvio del server
app.listen(3000, () => {
    console.log("Il server è in ascolto sulla porta 3000");
  });
  
