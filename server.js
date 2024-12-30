
const express = require("express") ;
const url = require("url")  ;
const app = express() ;
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');


const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('./'));
app.use(express.json()) ;




let generateHTML = function(data) {
    let content = "" ;
    content = '<table cellpadding=0 cellspacing=0>' ;
    content +='<tr>'  ;
    content +='<th>Compétence</th>'  ;
    content +='<th style="background:#CCCCCC">Titre</th>'  ;
    content +='<th colspan="3">Niveau d\'acquisition</th>'  ;

    content +='</tr>'  ;

    content +='<tr>'  ;
    content +='<th></th>'  ;
    content +='<th></th>'  ;
    content +='<th> 0 </th>'  ;
    content +='<th> 1 </th>'  ;
    content +='<th> 2 </th>'  ;
    content +='</tr>'  ;

    let tailleDonnees = data.length ;


    for (let i=0;i<tailleDonnees;i++) {
       content += '<tr>' ;
       content += '<td class="intitule_competence '+data[i][0]+'">'+data[i][0]+'</td>' ;
       content += '<td class="label_competence">'+data[i][2]+'</td>' ;
       if (data[i][1] == 0) {
          content += '<td class="niveau">x</td>' ;
       } else {
          content += '<td class="niveau"> </td>' ;
       }
       
       if (data[i][1] == 1) {
          content += '<td class="niveau">x</td>' ;
       } else {
          content += '<td class="niveau"> </td>' ;
       }
      if (data[i][1] == 2) {
          content += '<td class="niveau">x</td>' ;
       } else {
          content += '<td class="niveau"> </td>' ;
       }
       content += '</tr>' ;
    }
    content += '</table>' ;

    let htmlContent = `
            <!DOCTYPE html>
              <html lang="fr">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
             ${content} 
          </body></html>  
        `;
      
    
    return htmlContent ;
}


app.post("/generate-pdf", async (req, res) => {
    const data = req.body.text ;
    


    try {
        // Lancer Puppeteer pour générer le PDF
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Charger le contenu HTML dans la page de Puppeteer
        htmlContent = generateHTML(data)  ; 




        await page.setContent(htmlContent);
        await page.addStyleTag({ path: './css/pdf.css' });

        // Générer le PDF
        const pdfBuffer = await page.pdf({ format: "A4" ,printBackground: true });

        await browser.close();

        // Envoyer le fichier PDF au client

        //console.log(pdfBuffer) ;
        res.writeHead(200, {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="generated.pdf"',
            "Content-Length": pdfBuffer.length
        }) ;
        res.write(pdfBuffer, 'binary') ;
        res.end() ;
    } catch (err) {
        console.error("Erreur lors de la génération du PDF :", err);
        res.status(500).send("Erreur lors de la génération du PDF");
    }
});

app.get("/", function(request, response) {
   var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);



    var lien = request.url ;


    fs.stat(filename, function(err,stats) {
      if (err) {
        response.writeHead(404, {'Content-Type': 'text/plain'})
        response.write('404 Not Found\n')
        response.end()
        return
      }
  
      if (stats.isDirectory()) filename += '/index.html'
  
      fs.readFile(filename, 'binary', function(err, file) {
        if(err) {
          response.writeHead(500, {'Content-Type': 'text/plain'})
          response.write(err + '\n')
          response.end()
          return
        }
        if(filename.includes("//index.html")) {
          const apiKey = process.env.LLM_API_KEY ? process.env.LLM_API_KEY.slice(1,-2) : "";
          file =  '<script>const process={env: {LLM_API_KEY: "'+apiKey+'"}}</script>' + file;
          response.writeHead(200)
          response.write(file, 'binary')
          response.end()
        } else {
          response.writeHead(200)
          response.write(file, 'binary')
          response.end()
        }
      })
    })
}) ;

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});


/*var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    { exec } = require('child_process'),
    port = process.argv[2] || 8888;



http.createServer(function(request, response) {
     

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri); 

    var lien = request.url ;



    fs.stat(filename, function(err,stats) {
      if (err) {
        response.writeHead(404, {'Content-Type': 'text/plain'})
        response.write('404 Not Found\n')
        response.end()
        return
      }
  
      if (stats.isDirectory()) filename += '/index.html'
  
      fs.readFile(filename, 'binary', function(err, file) {
        if(err) {
          response.writeHead(500, {'Content-Type': 'text/plain'})
          response.write(err + '\n')
          response.end()
          return
        }
        if(filename.includes("//index.html")) {
          const apiKey = process.env.LLM_API_KEY ? process.env.LLM_API_KEY.slice(1,-2) : "";
          file =  '<script>const process={env: {LLM_API_KEY: "'+apiKey+'"}}</script>' + file;
          response.writeHead(200)
          response.write(file, 'binary')
          response.end()
        } else {
          response.writeHead(200)
          response.write(file, 'binary')
          response.end()
        }
      })
    })
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");

// Ouvrir automatiquement l'URL dans le navigateur
const localUrl = `http://localhost:${port}/`;
  
// Déterminer la commande en fonction du système d'exploitation
const startCommand = process.platform === 'win32' ? 'start' :
                     process.platform === 'darwin' ? 'open' :
                     'xdg-open'; // Linux

exec(`${startCommand} ${localUrl}`, (err) => {
  if (err) {
    console.error(`Failed to open browser: ${err}`);
  }
});*/