const express = require("express");
const app = express();

const fs = require('fs')

const partida = "test";
const mysql = require('mysql');
const bodyParser = require('body-parser')


const cors = require('cors');
const { json } = require("body-parser");

//QUINES DECISIONS PODEN ENTRAR
const whitelist = ["externalitzarProduccio", "queComprar", "salariTreballadors", "horesLliures", "percentatgeMinoristes", "preuMinoristes", "preuMajoristes", "publicitat", "financiacio", "comprarFabrica", "quinaFabricaComprar"]

const crypto = require("crypto")
const jwt = require("jsonwebtoken")

const cookie = require("cookie-parser")

const { promisify } = require('util')

const pool = mysql.createPool({

    host: "mysql5045.site4now.net",
    user: "a7c3e0_rekka",
    password: "guillem78523",
    database: "db_a7c3e0_rekka"
    
})

pool.query = promisify(pool.query)

    



/*
connection.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
  
    console.log('Connexió facherita amb la SQL😎');
});*/

//app.use(express.json());

app.use(cors({ origin: '*' }));
app.use(function(req, res, next){
    res.header('Acess-Control-Allow-Origin', "*")
    res.header('Acess-Control-Allow-Methods', "GET,PUT,POST,DELETE")
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next()
})
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static('public'))

app.listen(4854, () => {
    console.log("Servidor modo facherito al port 4854😎");
});



/* 
/decisions/:usuari

necessita: 
usuari - header
partida
decisions
*/

//LINKS

app.get('/', function(req, res) {
    res.redirect('/auth/login')
})

app.get('/:partida/adminpanel', function(req, res) {
    const { partida } = req.params;

    fs.readFile('/xampp/htdocs/tdr-2021/client/adminpanel.html', async (err, data) => {
        if (err) {
            console.log(err)
        } else {
            any = await getPartidaAny(partida)
            res.send("<script>var partida = '" + partida + "'; var any = '" + any + "'</script>" + data)
        }
    })
})

app.get('/decisions/p/:partida', function(req, res) {
    const { partida } = req.params;
    fs.readFile('/xampp/htdocs/tdr-2021/client/menu.html', async (err, data) => {
        if (err) {
            console.log(err)
        } else {
            any = await getPartidaAny(partida)
            if (any != 0) {
                res.send("<script>var partida = '" + partida + "'; var any = '" + any + "'</script>" + data)
            } else {
                res.send("<link rel='stylesheet' href='/css/menuStyle.css'><div class='encara-no'>Estàs dins la partida, però actualment encara no ha començat</div>")
            }
        }
    })
    //res.sendFile('/xampp/htdocs/tdr-2021/client/index.html');
});

app.post('/decisions/get-diners', async function (req, res) {
    if (req.body.partida == undefined || req.body.usuari == undefined) {
        res.send("Falten arguments!")
    } else {
        try {
            res.send((await getDiners(req.body.partida, req.body.usuari)).toString())
        } catch (err) {
            console.log("/decisions/get-diners [!] ERROR: " + err)

            res.send("Error inesperat, contacti amb l'administrador")
        }
    }
})

app.post('/decisions/fabriques-disponibles', async function (req, res) {
    if (req.body.partida == undefined || req.body.usuari == undefined) {
        res.send("Falten arguments!")
    } else {
        var query = `SELECT * FROM partides WHERE nom='${req.body.partida}'`
        try {
            results = await pool.query(query)
            if (results.length > 1 || results.length < 1) {
                res.send("Partida duplicada o inexistent")
            } else {
                var result = JSON.parse(results[0].stuff)

                for (var i = 0; i < result.length; i++) {
                    if (result[i].usuari.toLowerCase() == req.body.usuari.toLowerCase()) {
                        if (result[i].fabriques == null || result[i].fabriques == undefined) {
                            //En cas de que no existeixi les fabriques del usuari
                            var result2 = result
                            result2[i].fabriques = []

                            var query = `UPDATE partides SET stuff='${JSON.stringify(result2)} WHERE partida='${req.body.partida}'`
                            pool.query(query)
                            res.send(result2[i].fabriques)
                        } else {
                            //En cas de que si
                            res.send(result[i].fabriques)
                        }
                    }
                }
            }
        } catch (err) {
            console.log("/decisions/fabriques-disponibles/ [!] ERROR: " + err)

            res.send("Error inesperat, contacti amb l'administrador")
        }
    }
})

app.post('/decisions/marketing-opcions', async function (req, res) {
    var query = `SELECT * FROM marketing`
    try {
        results = await pool.query(query)
        res.send(JSON.stringify(results))
    } catch (err) {
        console.log("/decisions/marketing-opcions/ [!] ERROR: " + err)

        res.send("Error inesperat, contacti amb l'administrador")
    }
})

app.post('/decisions/afegir-fabrica', async function (req, res) {
    if (req.body.partida == undefined || req.body.usuari == undefined || req.body.tier == undefined || req.body.nom == undefined || typeof req.body.tier != "number" || typeof req.body.nom != "string") {
        res.send("Falten arguments!")
    } else {
        var query = `SELECT * FROM partides WHERE nom='${req.body.partida}'`
        try {
            results = await pool.query(query)
            if (results.length > 1 || results.length < 1) {
                res.send("Partida duplicada o inexistent")
            } else {
                var result = JSON.parse(results[0].stuff)

                for (var i = 0; i < result.length; i++) {
                    if (result[i].usuari.toLowerCase() == req.body.usuari.toLowerCase()) {
                        var id = result[i].fabriques.length + 1

                        var fabrica = {
                            nom: req.body.nom,
                            tier: req.body.tier,
                            treballadors: 0,
                            id: id
                        }

                        var result2 = result 
                        result2[i].fabriques.push(fabrica)
                        result2 = JSON.stringify(result2)
                        var query = `UPDATE partides SET stuff = '${result2}' WHERE nom = '${req.body.partida}'`
                        pool.query(query)
                        res.send("Fàbrica afegida correctament")
                    }
                }
            }
        } catch (err) {
            console.log("/decisions/afegir-fabrica/ [!] ERROR: " + err)

            res.send("Error inesperat, contacti amb l'administrador")
        }
    }
})

app.post('/decisions/comprar-treballadors', async function (req, res) {
    if (req.body.partida == undefined || req.body.usuari == undefined || req.body.array == undefined || typeof req.body.array != "object") {
        res.send("Falten arguments!")
    } else {
        var query = `SELECT * FROM partides WHERE nom='${req.body.partida}'`
        try {
            results = await pool.query(query)
            if (results.length > 1 || results.length < 1) {
                res.send("Partida duplicada o inexistent")
            } else {
                var result = JSON.parse(results[0].stuff)
                
                for (var i = 0; i < result.length; i++) {
                    if (result[i].usuari.toLowerCase() == req.body.usuari.toLowerCase()) {
                        var result2 = result
                        for (var x = 0; x < req.body.array.length; x++) { 
                            result2[i].fabriques[req.body.array[x][0] - 1].treballadors = req.body.array[x][1]
                        }
                        
                        //result2[i].fabriques[req.body.id - 1].treballadors = req.body.treballadors
                        result2 = JSON.stringify(result2)
                        
                        query = `UPDATE partides SET stuff = '${result2}' WHERE nom = '${req.body.partida}'`
                        pool.query(query)

                        res.send("Canvis guardats satisfactoriamet")
                    }
                }
            }
        } catch (err) {
            console.log("/decisions/comprar-treballadors/ [!] ERROR: " + err)

            res.send("Error inesperat, contacti amb l'administrador")
        }
    }
})

app.post('/decisions/externalitzar-prices', async function(req, res) {
    if (req.body.partida == undefined) {
        res.send("Falten arguments!")
    } else {
        var query = `SELECT * FROM \`externalitzar-produccio\` WHERE partida = '${partida}'`
        try {
            var results = await pool.query(query)
            var toReturn = [
                [], []
            ]

            if (results.length <= 0) {
                res.send("No s'ha trobat aquesta partida")
            }

            for (var i = 0; i < toReturn.length; i++) {
                var price = []
                var units = []

                for (var x = 0; x < results.length; x++) {
                    if (results[x]["empresa_id"] - 1 == i) {
                        price.push(results[x]["price"])
                        units.push(results[x]["units"])
                    }
                }

                toReturn[i].push(price)
                toReturn[i].push(units)
            }

            res.send(toReturn)

        } catch(err) {
            res.send("/decisions/externalitzar-prices/ [!] ERROR: " + err)
        }
    }
})

app.get('/auth/login', function(req, res) {
    res.sendFile('/xampp/htdocs/tdr-2021/client/login.html')
})

app.get('/partides', function(req, res) {
    res.sendFile('/xampp/htdocs/tdr-2021/client/partides.html')
})


//COSES DE LA API

app.post("/decisions/:usuari", (req, res) => {
    const { usuari } = req.params;
    if (!usuari) {
        res.send("Falten arguments")
    } else {
        let decisions = verificarWhitelist(req.body.decisions)

        //connection
        pool.query('SELECT * FROM usuaris WHERE usuari = "' + usuari + '"', function (error, results, fields) {
            results.forEach(result => { 
                let resultJS = JSON.parse(result.stuff)
                if (buscarPartida(req.body.partida, resultJS.length, resultJS) !== undefined) {
                    let resultJS2 = {...resultJS[buscarIdPartida(req.body.partida, resultJS.length, resultJS)].decisions, ...decisions}
                    resultJS[buscarIdPartida(req.body.partida, resultJS.length, resultJS)].decisions = resultJS2;

                    let resultText = JSON.stringify(resultJS)

                    //connection
                    pool.query("UPDATE usuaris SET stuff = '" + resultText + "' WHERE usuari = '" + usuari + "'", function (error, results, fields) {
                        if (error) throw error;
                        res.send("Les decisions s'han guardat correctement");
                    })
                } else {
                    res.send("Aquesta partida no existeix")
                }
            });
        });
    }
})

app.post("/auth/login", async (req, res) => {
    res.send(await tryLogin(req.body.user, req.body.pass));
})




// API TEMPORAL

//Necessita user (string), partida (string)
app.post("/decisions/u/:usuari", async (req, res) => {
    const { usuari } = req.params;
    if (!usuari || req.body.partida == undefined) {
        res.send("Falten arguments. Es necessita: user (string) i partida (string)")
    } else {
        const query = "SELECT stuff FROM usuaris WHERE usuari = '" + usuari + "'"

        let resultats = await pool.query(query);
        
        if (resultats.lenght >= 1 || 1 >= resultats.lenght) {
            res.send("Hi ha més de un usuari amb aquest nom")
        } else {
            let resultat = JSON.parse(resultats[0].stuff)

            res.send(JSON.stringify(buscarPartida(req.body.partida, resultat.length, resultat).decisions))
        }
    }
})

//Necessita user (string), pass (string)
app.post("/partides", async (req, res) => {
    const user = req.body.user
    
    if (await tryLogin(user, req.body.pass) == true) {
        const query = "SELECT * FROM usuaris WHERE usuari = '" + user + "'"
        let retornar = []
        let resultats = await pool.query(query)

        if (resultats.length > 1 || resultats.length < 1) {
            return retornar;
        } else {
            let resultat = JSON.parse(resultats[0].stuff)

            for (var i = 0; i < resultat.length; i++) {
                retornar.push(await getPartidaInfo(resultat[i].partida))
            }
            res.send(retornar)
        }
        
    } else {
        res.send("Usuari o contrasenya erronis!")
    }
})

//Necessita partida (string)
app.post("/partides/usuaris", async (req, res) => {
    if (req.body.partida == undefined) {
        res.send("Es necessita un nom de partida")
    } else {
        const query = "SELECT * FROM usuaris"
        let count = 0;
        resultats = await pool.query(query)

        for (var i = 0; i < resultats.length; i++) {
            let resultat = JSON.parse(resultats[i].stuff)
            for (var x = 0; x < resultat.length; x++) {
                if (resultat[x].partida == req.body.partida) {
                    count++
                    break
                }
            }
        }
        
        res.send(count.toString())
    }
})

app.post("/partides/iniciar", async (req, res) => {
    if (req.body.partida == undefined) {
        res.status(400).send("Falten arguments")
    } else {
        var sql = `SELECT * FROM \`partides\` WHERE nom = '${req.body.partida}'`
        var results = await pool.query(sql)

        if (results.length > 1) {
            res.status(400).send("Partida duplicada")
            return res.end()
        }

        if (parseInt(results[0].any) != 0) {
            res.status(400).send("La partida ja ha començat")
            return res.end()
        } 

        var toAdd = []
        var stuff = JSON.parse(results[0].stuff)

        for (var i = 0; i < stuff.length; i++) {
            toAdd.push(
            {

                usuari: stuff[i].usuari,
                diners: 10000000,

                dinersVentesMajoristes: 0,
                dinersVentesMinoristes: 0,
                dinersVentesTotals: 0,

                costTotal: 0,
                produccioTotal: 0,
                costProduccioTotal: 0,
                costMarketingTotal: 0,
                costVentesTotal: 0,
                ventesTotals: 0,
                ventesMajoristes: [0, 0, 0],
                ventesMinoristes: 0,
                posicionamentMajoristes: [0, 0, 0],
                posicionamentMinoristes: 0,
                benefici: 0
            })
        }

        var final = JSON.parse(results[0].resultats)
        final.push(toAdd)
        final = JSON.stringify(final)

        sql = `UPDATE \`partides\` SET resultats = '${final}' WHERE nom = '${req.body.partida}'`
        await pool.query(sql)

        sql = `UPDATE \`partides\` SET any = '1' WHERE nom = '${req.body.partida}'`
        await pool.query(sql)

        res.send("La partida acaba de començar!")
    }
})

app.post("/partides/posicio", async (req, res) => {
    if (req.body.partida == undefined || req.body.usuari == undefined) {
        res.status(400).send("Falten arguments")
    } else {
        const sql = `SELECT * FROM \`partides\` WHERE nom = '${req.body.partida}'`
        let results = await pool.query(sql)

        if (results.length != 1) {
            res.status(400).send("Partida duplicada o inexistent")
            return res.end()
        }

        const any = parseInt(results[0].any)

        resultatsJugadors = JSON.parse(results[0].resultats)
        resultatsJugadors[any-1].sort((a, b) => {
            return b.diners - a.diners
        })

        for (var i = 0; i < resultatsJugadors[any-1].length; i++) {
            if (resultatsJugadors[any-1][i].usuari.toLowerCase() == req.body.usuari.toLowerCase()) {
                res.send((i+1).toString())
                return res.end()
                break
            }
        }

        res.status(400).send("Aquest usuari no es troba en aquesta partida")
    }
})

app.post("/partides/join", async (req, res) => {
    if (req.body.codi == undefined || req.body.usuari == undefined) {
        res.status(400).send("Falten arguments")
    } else {
        var sql = "SELECT * FROM `partides`"
        var results = await pool.query(sql)

        if (!await verificarUsuari(req.body.usuari)) {
            res.status(400).send("Aquest usuari no existeix")
            return res.end()
        } else {
            for (var i = 0; i < results.length; i++) {
                if (results[i].secret_code == req.body.codi) {
                    var stuff = JSON.parse(results[i].stuff)

                    if (results[i].any != 0) {
                        res.status(400).send("Actualment la partida no admet jugadors nous")
                        return res.end()
                    }

                    for (var x = 0; x < stuff.length; x++) {
                        if (stuff[x].usuari.toLowerCase() == req.body.usuari.toLowerCase()) {
                            res.status(400).send("Ja estàs en aquesta partida")
                            return res.end()
                        }
                    }
                    
                    stuff.push({
                        usuari: req.body.usuari,
                        //per editar, customitzar diners inicials
                        diners: 10000000,
                        fabriques: []
                    })


                    var sql = `UPDATE \`partides\` SET stuff = '${JSON.stringify(stuff)}' WHERE nom = '${results[i].nom}'`
                    await pool.query(sql)

                    sql = `SELECT * FROM usuaris WHERE usuari = '${req.body.usuari.toLowerCase()}'`
                    var results2 = await pool.query(sql)


                    stuff = JSON.parse(results2[0].stuff)

                    //afegir a usuaris
                    stuff.push({
                        partida: results[i].nom,
                        decisions: {}
                    })

                    sql = `UPDATE \`usuaris\` SET stuff = '${JSON.stringify(stuff)}' WHERE usuari = '${req.body.usuari}'`
                    await pool.query(sql)
                    console.log(sql)

                    res.send("Has estat afegit a la partida")
                    return res.end()
                    //await pool.query(sql)
                    
                }
            }
            res.status(400).send("Codi invàlid")
        }
    }
})

app.post("/partides/getUsuaris", async (req, res) => {
    if (req.body.partida == undefined) {
        res.status(400).send("Falten arguments")
    } else {
        var any = await getPartidaAny(req.body.partida)
        if (parseInt(any) == 0) {
            var sql = `SELECT * FROM \`partides\` WHERE nom = '${req.body.partida}'`
            var results = await pool.query(sql)
            
            if (results.length != 1) {
                res.status(400).send("Partida duplicada o inexistent")
            }

            var stuff = JSON.parse(results[0].stuff)

            var toReturn = []
            for (var i = 0; i < stuff.length; i++) {
                toReturn.push(stuff[i].usuari)
            }
            res.send(toReturn)
        } else {
            var sql = `SELECT * FROM \`partides\` WHERE nom = '${req.body.partida}'`
            var results = await pool.query(sql)
            
            if (results.length != 1) {
                res.status(400).send("Partida duplicada o inexistent")
            }

            var resultats = JSON.parse(results[0].resultats)
            res.send(resultats)
        }        
    }
})

app.post('/partides/simular', async (req, res) => {
    if (req.body.partida == undefined) {
        res.status(400).send("Falten arguments")
    } else {
        if (await getPartidaAny(req.body.partida) < 1) {
            res.status(400).send("La partida encara no ha començat")
            return res.end()
        } 
        res.send(await simular(req.body.partida))
    }
})

app.post('/partides/resultats', async (req, res) => {
    if (req.body.usuari == undefined || req.body.partida == undefined) {
        res.status(400).send("Falten arguments")
    } else {
        var sql = `SELECT * FROM \`partides\` WHERE nom = '${req.body.partida}'`
        var results = await pool.query(sql)

        if (results.length != 1) {
            res.status(400).send("Partida duplicada o inexistent")
            return res.end()
        }


        results = JSON.parse(results[0].resultats)
        var toReturn = []

        for (var i = 0; i < results.length; i++) {
            for (var x = 0; x < results[i].length; x++) {
                if (req.body.usuari.toLowerCase() == results[i][x].usuari.toLowerCase()) {
                    toReturn.push(results[i][x])
                    break
                }
            } 
        }

        res.send(toReturn)
    }
})



//FUNCIONS TEMPORALS

async function verificarUsuari(usuari) {
    const sql = "SELECT * FROM usuaris"
    const results = await pool.query(sql)

    for (var i = 0; i < results.length; i++) {
        if (results[i].usuari.toLowerCase() == usuari.toLowerCase()) {
            return true
        }
    }
    return false
}

async function getPartidaInfo(partida) {
    const query = `SELECT * FROM partides WHERE nom = '${partida}'`

    let resultats = await pool.query(query)
    
    if (resultats.length > 1 || resultats.length < 1) {
        return false
    } else {
        let resultat = resultats[0]
        let participants = await getNombreParticipants(partida)

        let retornar = {nom: resultat.nom, creador: resultat.creador, info: resultat.info, member_count: participants, any: resultat.any}

        return retornar
    }
}

async function getNombreParticipants(partida) {
    const query = "SELECT * FROM usuaris"
    let count = 0;
    resultats = await pool.query(query)

    for (var i = 0; i < resultats.length; i++) {
        let resultat = JSON.parse(resultats[i].stuff)
        for (var x = 0; x < resultat.length; x++) {
            if (resultat[x].partida == partida) {
                count++
                break
            }
        }
    }
    
    return count.toString()
}

function buscarGentEnPartida(nomPartida, total, array) {
    for (var i = 0; i < total; i++) {
        if (array[i].partida == nomPartida) {
            return array[i];
            break;
        }
    }
}

function buscarPartida(nomPartida, total, array) {
    for (var i = 0; i < total; i++) {
        if (array[i].partida == nomPartida) {
            return array[i];
            break;
        }
    }
}

function buscarIdPartida(nomPartida, total, array) {
    for (var i = 0; i < total; i++) {
        if (i !== total - 1) {
            if (array[i].partida == nomPartida) {
                return i;
                break;
            }
        } else {
            if (array[i].partida == nomPartida) {
                return i;
                break;
            } else {
                return null
            }
        }
    }
}

async function getDiners(partida, usuari) {
    var sql = `SELECT * FROM \`partides\` WHERE nom='${partida}'`
    var results = await pool.query(sql)
    
    if (results.length > 1 || results.length < 1) {
        return "Partida duplicada o inexistent"
    } 

    var resultats = JSON.parse(results[0].resultats)
    for (var i = 0; i < resultats[parseInt(results[0].any) - 1].length; i++) {
        if (resultats[parseInt(results[0].any) - 1][i].usuari.toLowerCase() == usuari.toLowerCase()) {
            return resultats[parseInt(results[0].any) - 1][i].diners
        }
    }
    return 'No results'
}

async function tryLogin (user, pass) {   
    if (user !== undefined && pass !== undefined) {
        let query = 'SELECT * FROM usuaris WHERE usuari="' + user + '"'
        
        let resultats = await pool.query(query);

        if (resultats.length > 1 || resultats.length <= 0) {
            return false
        } else {
            const user = resultats[0]
            if (crypto.createHash("md5").update(pass).digest('hex') == user.md5) {
                return true
                
            } else {
                return false
            }
        }
        
    } else {
        return false;
    }
}


function verificarWhitelist(object) {
    let retornar = object

    if (typeof object === "object" && typeof object !== null) {
        for (const [key, value] of Object.entries(object)) {
            for (var i = 0; i < whitelist.length; i++) {
                if (i == whitelist.length - 1) {
                    if (key == whitelist[i]){
                        
                    } else {
                        delete retornar[key]
                        break
                    }
                } else {
                    if (key == whitelist[i]){
                        break
                    }
                }
            }
        }

        return retornar;
    } 
}

async function getPartidaAny(partida) {
    const query = "SELECT * FROM partides WHERE nom = '" + partida + "'"

    let resultats = await pool.query(query)
    
    if (resultats.length > 1 || resultats.length < 1) {
        return false
    } else {
        let resultat = resultats[0]
        
        retornar = resultat.any

        return retornar
    }
}

async function simular(partida) {
    if (partida !== undefined) {
        //connection
        var sql = "SELECT * FROM usuaris"
        results = await pool.query(sql)

        var usuaris = []

        var sql1 = "SELECT * FROM `externalitzar-produccio`" 
        var resultsExternalitzarProduccio = await pool.query(sql1)

        var sql2 = `SELECT * FROM \`partides\` WHERE nom='${partida}'`
        var resultsPartides = await pool.query(sql2)

        var sql3 = `SELECT * FROM \`marketing\` ORDER BY 'id'`
        var resultsMarketing = await pool.query(sql3)


        //get all users
        for (var i = 0; i < results.length; i++) {
            var stuff = JSON.parse(results[i].stuff)
            for (var x = 0; x < stuff.length; x++) {
                if (stuff[x].partida == partida) {
                    var toReturn = results[i]
                    toReturn.stuff = stuff[x] 
                    usuaris.push(results[i])
                }
            }
        }


        //Verificar dades decisions
        for (var i = 0; i < usuaris.length; i++) {
            if (usuaris[i].stuff.decisions.externalitzarProduccio != "false" && usuaris[i].stuff.decisions.externalitzarProduccio != "true") {
                usuaris[i].stuff.decisions.externalitzarProduccio = "false"
            }

            if (usuaris[i].stuff.decisions.queComprar == undefined) {
                toAdd = []
                for (var x = 0; x < resultsExternalitzarProduccio.length; x++) {
                    toAdd.push([resultsExternalitzarProduccio[i].id, "0"])
                }
                usuaris[i].stuff.decisions.queComprar = toAdd
            }

            if (usuaris[i].stuff.decisions.salariTreballadors == undefined || parseInt(usuaris[i].stuff.decisions.salariTreballadors) > 27000 || parseInt(usuaris[i].stuff.decisions.salariTreballadors) < 17000) {
                usuaris[i].stuff.decisions.salariTreballadors = "17000"
            }

            if (usuaris[i].stuff.decisions.horesLliures == undefined || parseFloat(usuaris[i].stuff.decisions.horesLliures) > 2 || parseFloat(usuaris[i].stuff.decisions.horesLliures) < 0) {
                usuaris[i].stuff.decisions.horesLliures = "0"
            }

            if (usuaris[i].stuff.decisions.percentatgeMinoristes == undefined || parseFloat(usuaris[i].stuff.decisions.percentatgeMinoristes) > 100 || parseFloat(usuaris[i].stuff.decisions.percentatgeMinoristes) < 0) {
                usuaris[i].stuff.decisions.percentatgeMinoristes = "0"
            }

            if (usuaris[i].stuff.decisions.preuMinoristes == undefined || parseFloat(usuaris[i].stuff.decisions.preuMinoristes) > 3 || parseFloat(usuaris[i].stuff.decisions.preuMinoristes) < 0.01) {
                usuaris[i].stuff.decisions.preuMinoristes = "3"
            }

            if (usuaris[i].stuff.decisions.preuMajoristes == undefined) {
                usuaris[i].stuff.decisions.preuMajoristes = [["0","0","3"],["0","0","3"],["0","0","3"]]
            }

            if (typeof usuaris[i].stuff.decisions.preuMajoristes == "object") {
                for (var x = 0; x < usuaris[i].preuMajoristes; x++) {
                    if (parseFloat(usuaris[i].stuff.decisions.preuMajoristes[x][0]) > 0.50 || parseFloat(usuaris[i].stuff.decisions.preuMajoristes[x][0]) < 0) {
                        usuaris[i].stuff.decisions.preuMajoristes[x][0] = 0
                    }
                    if (parseFloat(usuaris[i].stuff.decisions.preuMajoristes[x][1]) > 10000000 || parseFloat(usuaris[i].stuff.decisions.preuMajoristes[x][1]) < 0) {
                        usuaris[i].stuff.decisions.preuMajoristes[x][1] = 0
                    }
                    if (parseFloat(usuaris[i].stuff.decisions.preuMajoristes[x][2]) > 3 || parseFloat(usuaris[i].stuff.decisions.preuMajoristes[x][2]) < 0.01) {
                        usuaris[i].stuff.decisions.preuMajoristes[x][2] = 0.01
                    }                    
                }
            }
            
            if (usuaris[i].stuff.decisions.publicitat == undefined) {
                toAdd = []
                for (var x = 0; x < resultsMarketing.length; x++) {
                    toAdd.push("0")
                }
                usuaris[i].stuff.decisions.publicitat = toAdd
            }

            if (typeof usuaris[i].stuff.decisions.publicitat == "object") {
                for (var x = 0; x < resultsMarketing.length; x++) {
                    if (usuaris[i].stuff.decisions.publicitat.length != resultsMarketing.length) {
                        for (var x = 0; x < resultsMarketing.length; x++) {
                            toAdd.push("0")
                        }
                    } else {
                        if (parseFloat(usuaris[i].stuff.decisions.publicitat[x]) > 1000 || parseFloat(usuaris[i].stuff.decisions.publicitat[x] < 0)) {
                            usuaris[i].stuff.decisions.publicitat[x] = "0"
                        }
                    }
                }
            }
            
            if (usuaris[i].stuff.decisions.quinaFabricaComprar == undefined || parseFloat(usuaris[i].stuff.decisions.quinaFabricaComprar.tier) > 3 || parseFloat(usuaris[i].stuff.decisions.quinaFabricaComprar.tier) < 1) {
                usuaris[i].stuff.decisions.quinaFabricaComprar = {nom: "default name", tier: "1"}
            }
        }

        var dades = {
            //Produccio
            personesQueExternalitzen: 0,
            produccioTotal: 0,

            //RRHH
            mitjanaSous: 0,
            mitjanaHoresLliures: 0,
            totalSous: 0,
            totalHoresLliures: 0,

            //Venta
            totalPreuMinoristes: 0,
            mitjanaPreuMinoristes: 0,
            totalPreuMajoristes: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
            mitjanaPreuMajoristes: [[], [], []],

            posicionamentMinoristes: [],
            posicionamentMajoristes: [[], [], []],

            //Marketing
            totalPublicitat: [],
            mitjanaPublicitat: [],


            //DEMANDA
            demandaTotal: (Math.floor(Math.random() * 40000000) + 40000000) + (usuaris.length * (6000000 * parseInt(await getPartidaAny(partida)))),
            percentatgeMinoristes: (Math.random() * 0.35) + 0.3,
            demandaRestantMinoristes: 0,
            demandaRestantMajoristes: 0
        }

        console.log(dades.demandaTotal)

        //dades.demandaTotal = 30000

        dades.percentatgeMinoristes = (Math.random() * 0.35) + 0.3

        //dades.percentatgeMinoristes = 0

        dades.demandaRestantMinoristes = dades.demandaTotal * dades.percentatgeMinoristes
        dades.demandaRestantMajoristes = [(dades.demandaTotal * (1 - dades.percentatgeMinoristes)) / 3, (dades.demandaTotal * (1 - dades.percentatgeMinoristes)) / 3, (dades.demandaTotal * (1 - dades.percentatgeMinoristes)) / 3]

        //dades.demandaRestantMajoristes = dades.demandaTotal * (1 - dades.percentatgeMinoristes)

        //calcular mitjanes RRHH
        for (var i = 0; i < usuaris.length; i++) {
            if (usuaris[i].stuff.decisions.externalitzarProduccio === "true") {
                dades.personesQueExternalitzen++
            } else {
                dades.totalSous += parseInt(usuaris[i].stuff.decisions.salariTreballadors)
                dades.totalHoresLliures += parseFloat(usuaris[i].stuff.decisions.horesLliures)
            }
        }
        
        //RRHH
        dades.mitjanaSous = dades.totalSous / Math.max(1, usuaris.length - dades.personesQueExternalitzen)
        dades.mitjanaHoresLliures = dades.totalHoresLliures / Math.max(1, usuaris.length - dades.personesQueExternalitzen)

        

        //calcular costos i produccio
        for (var i = 0; i < usuaris.length; i++) {
            //Externalitzar producció
            usuaris[i].costTotal = 0;
            usuaris[i].produccioTotal = 0;

            usuaris[i].costProduccioTotal = 0;
            usuaris[i].costMarketingTotal = 0;
            usuaris[i].costVentesTotal = 0;
            
            usuaris[i].ventesTotals = 0;
            usuaris[i].ventesMajoristes = [0, 0, 0]
            usuaris[i].ventesMinoristes = 0

            usuaris[i].dinersVentesTotals = 0
            usuaris[i].dinersVentesMajoristes = 0
            usuaris[i].dinersVentesMinoristes = 0

            usuaris[i].benefici = 0

            if (usuaris[i].stuff.decisions.externalitzarProduccio === "true") {
                var results = resultsExternalitzarProduccio

                for (var x = 0; x < results.length; x++) {
                    if (results[x].partida == partida) {
                        usuaris[i].costTotal += usuaris[i].stuff.decisions.queComprar[results[x].id - 1][1] * results[x].price
                        usuaris[i].costProduccioTotal += usuaris[i].stuff.decisions.queComprar[results[x].id - 1][1] * results[x].price

                        usuaris[i].produccioTotal += usuaris[i].stuff.decisions.queComprar[results[x].id - 1][1] * results[x].units
                        dades.produccioTotal += usuaris[i].stuff.decisions.queComprar[results[x].id - 1][1] * results[x].units
                    }
                }
            } else {
                //produccio interna
                var results = resultsPartides
                var stuff = JSON.parse(results[0].stuff)

                for (var x = 0; x < stuff.length; x++) {
                    if (stuff[x].usuari == usuaris[i].usuari) {
                        for (var z = 0; z < stuff[x].fabriques.length; z++)  {
                            
                            var maxTreballadors = 0
                            var maxProduccio = 0
                            
                            var tier = parseInt(stuff[x].fabriques[z].tier)

                            if (tier == 1) {
                                maxTreballadors = 50
                                maxProduccio = 170
                            } else if (tier == 2) {
                                maxTreballadors = 80
                                maxProduccio = 210
                            } else if (tier == 3) {
                                maxTreballadors = 120
                                maxProduccio = 250
                            }

                            var treballadors = parseInt(stuff[x].fabriques[z].treballadors)

                            var potenciador = (((parseFloat(usuaris[i].stuff.decisions.horesLliures) / Math.max(dades.mitjanaHoresLliures, 0.0000001)) - 1) / 5) + ((parseInt(usuaris[i].stuff.decisions.salariTreballadors) / Math.max(dades.mitjanaSous, 0.0000001)) - 1) + 1
                            usuaris[i].potenciador = potenciador

                            var horesTotals = 1808 - (226 * parseFloat(usuaris[i].stuff.decisions.horesLliures))

                            usuaris[i].produccioTotal += (((Math.min(treballadors/(maxTreballadors * 0.7), 1) * maxProduccio) * horesTotals) * potenciador) * treballadors
                            dades.produccioTotal += usuaris[i].produccioTotal
                            usuaris[i].costTotal += (treballadors * parseInt(usuaris[i].stuff.decisions.salariTreballadors)) + (0.2 * ((((Math.min(treballadors/(maxTreballadors * 0.7), 1) * maxProduccio) * horesTotals) * potenciador) * treballadors))
                            usuaris[i].costProduccioTotal += (treballadors * parseInt(usuaris[i].stuff.decisions.salariTreballadors)) + (0.2 * ((((Math.min(treballadors/(maxTreballadors * 0.7), 1) * maxProduccio) * horesTotals) * potenciador) * treballadors))
                        }
                    }
                }
            }
        }

        //calcular mitana preus majoristes i minoristes
        for (var i = 0; i < usuaris.length; i++) {
            for (var x = 0; x < usuaris[i].stuff.decisions.preuMajoristes.length; x++) {
                for (var z = 0; z < usuaris[i].stuff.decisions.preuMajoristes[x].length; z++) {
                    if (z == 1) {
                        usuaris[i].costVentesTotal += parseInt(usuaris[i].stuff.decisions.preuMajoristes[x][z])
                        usuaris[i].costTotal += parseInt(usuaris[i].stuff.decisions.preuMajoristes[x][z])
                    }
                    dades.totalPreuMajoristes[x][z] += parseFloat(usuaris[i].stuff.decisions.preuMajoristes[x][z]) * usuaris[i].produccioTotal
                }
            }
            dades.totalPreuMinoristes += parseFloat(usuaris[i].stuff.decisions.preuMinoristes) * usuaris[i].produccioTotal

            //calcular total anuncis
            for (var x = 0; x < usuaris[i].stuff.decisions.publicitat.length; x++) {
                if (dades.totalPublicitat[x] == undefined) {
                    dades.totalPublicitat[x] = 0
                }
                dades.totalPublicitat[x] += parseInt(usuaris[i].stuff.decisions.publicitat[x])
                /**/
                usuaris[i].costTotal += parseInt(usuaris[i].stuff.decisions.publicitat[x]) * parseInt(resultsMarketing[x].price)
                usuaris[i].costMarketingTotal += parseInt(usuaris[i].stuff.decisions.publicitat[x]) * parseInt(resultsMarketing[x].price)
            }
        }

        //calcular mitjana anuncis
        for (var i = 0; i < dades.totalPublicitat.length; i++) {
            dades.mitjanaPublicitat[i] = dades.totalPublicitat[i] / Math.max(usuaris.length, 1)
        }

        dades.mitjanaPreuMinoristes = dades.totalPreuMinoristes / Math.max(1, dades.produccioTotal)
        for (var i = 0; i < dades.totalPreuMajoristes.length; i++) {
            for (var x = 0; x < dades.totalPreuMajoristes[i].length; x++) {
                dades.mitjanaPreuMajoristes[i][x] = dades.totalPreuMajoristes[i][x] / Math.max(1, dades.produccioTotal)
            }
        }


        //calcular posicionament
        for (var i = 0; i < usuaris.length; i++) {
            usuaris[i].posicionamentMajoristes = [1000, 1000, 1000]
            usuaris[i].posicionamentMinoristes = 1000
            usuaris[i].ofertaMajoristes = usuaris[i].produccioTotal * ((100 - parseFloat(usuaris[i].stuff.decisions.percentatgeMinoristes)) / 100)
            usuaris[i].ofertaMinoristes = usuaris[i].produccioTotal * (parseFloat(usuaris[i].stuff.decisions.percentatgeMinoristes) / 100)

            //Majoristes
            for (var x = 0; x < usuaris[i].stuff.decisions.preuMajoristes.length; x++) {
                var bonus = 1
                for (var z = 0; z < usuaris[i].stuff.decisions.preuMajoristes[x].length; z++) {
                    if (z == 2) {
                        bonus += ((dades.mitjanaPreuMajoristes[x][z] / Math.max(usuaris[i].stuff.decisions.preuMajoristes[x][z], 0.000001)) - 1) * 2
                    } else {
                        bonus += (usuaris[i].stuff.decisions.preuMajoristes[x][z] / Math.max(dades.mitjanaPreuMajoristes[x][z], 0.000001)) - 1
                    }                    
                }
                usuaris[i].posicionamentMajoristes[x] = usuaris[i].posicionamentMajoristes[x] * bonus
            }

            //Minoristes
            var bonus = 1 
            bonus += (dades.mitjanaPreuMinoristes / usuaris[i].stuff.decisions.preuMinoristes) * usuaris[i].stuff.decisions.publicitat.length
            for (var x = 0; x < usuaris[i].stuff.decisions.publicitat.length; x++) {
                bonus += parseInt(usuaris[i].stuff.decisions.publicitat[x]) - dades.mitjanaPublicitat[x], 0.00001
            }
            usuaris[i].posicionamentMinoristes = usuaris[i].posicionamentMinoristes * bonus

            for (var x = 0; x < usuaris[i].posicionamentMajoristes.length; x++) {
                dades.posicionamentMajoristes[x].push([usuaris[i].posicionamentMajoristes[x], i])
            }
            dades.posicionamentMinoristes.push([usuaris[i].posicionamentMinoristes, i])
        }

        //calcular posicionament
        for (var i = 0; i < dades.posicionamentMajoristes.length; i++) {
            dades.posicionamentMajoristes[i] = dades.posicionamentMajoristes[i].sort(function (a, b) {return b[0] - a[0]})         
        }
        dades.posicionamentMinoristes = dades.posicionamentMinoristes.sort(function (a, b) {return b[0] - a[0]})

        
        //calcular ventes
        for (var i = 0; i < dades.posicionamentMajoristes.length; i++) {
            for (var x = 0; x < dades.posicionamentMajoristes[i].length; x++) {
                if (dades.demandaRestantMajoristes[i] - usuaris[dades.posicionamentMajoristes[i][x][1]].ofertaMajoristes < 0) {
                    var ventes = dades.demandaRestantMajoristes[i] - usuaris[dades.posicionamentMajoristes[i][x][1]].ofertaMajoristes
                    usuaris[dades.posicionamentMajoristes[i][x][1]].ventesTotals += usuaris[dades.posicionamentMajoristes[i][x][1]].ofertaMajoristes - Math.abs(ventes)
                    usuaris[dades.posicionamentMajoristes[i][x][1]].ventesMajoristes[i] += usuaris[dades.posicionamentMajoristes[i][x][1]].ofertaMajoristes - Math.abs(ventes)
                    usuaris[dades.posicionamentMajoristes[i][x][1]].ofertaMajoristes -= usuaris[dades.posicionamentMajoristes[i][x][1]].ofertaMajoristes - Math.abs(ventes)
                    
                    dades.demandaRestantMajoristes[i] = 0
                } else {
                    usuaris[dades.posicionamentMajoristes[i][x][1]].ventesTotals += usuaris[dades.posicionamentMajoristes[i][x][1]].ofertaMajoristes
                    usuaris[dades.posicionamentMajoristes[i][x][1]].ventesMajoristes[i] += usuaris[dades.posicionamentMajoristes[i][x][1]].ofertaMajoristes
                    dades.demandaRestantMajoristes[i] -= usuaris[dades.posicionamentMajoristes[i][x][1]].ofertaMajoristes
                    usuaris[dades.posicionamentMajoristes[i][x][1]].ofertaMajoristes = 0
                }
            }
        }

        
        for (var i = 0; i < dades.posicionamentMinoristes.length; i++) {
            if ((dades.demandaRestantMinoristes - usuaris[dades.posicionamentMinoristes[i][1]].ofertaMinoristes) < 0) {
                var ventes = dades.demandaRestantMinoristes - usuaris[dades.posicionamentMinoristes[i][1]].ofertaMinoristes
                usuaris[dades.posicionamentMinoristes[i][1]].ventesTotals += usuaris[dades.posicionamentMinoristes[i][1]].ofertaMinoristes - Math.abs(ventes)
                usuaris[dades.posicionamentMinoristes[i][1]].ventesMinoristes += usuaris[dades.posicionamentMinoristes[i][1]].ofertaMinoristes - Math.abs(ventes)
                usuaris[dades.posicionamentMinoristes[i][1]].ofertaMinoristes -= usuaris[dades.posicionamentMinoristes[i][1]].ofertaMinoristes - Math.abs(ventes)

                dades.demandaRestantMinoristes = 0
            } else {
                usuaris[dades.posicionamentMinoristes[i][1]].ventesTotals += usuaris[dades.posicionamentMinoristes[i][1]].ofertaMinoristes
                usuaris[dades.posicionamentMinoristes[i][1]].ventesMinoristes += usuaris[dades.posicionamentMinoristes[i][1]].ofertaMinoristes
                dades.demandaRestantMinoristes -= usuaris[dades.posicionamentMinoristes[i][1]].ofertaMinoristes
                usuaris[dades.posicionamentMinoristes[i][1]].ofertaMinoristes = 0
            }
        }

        //calcular guanys
        for (var i = 0; i < usuaris.length; i++) {
            for (var x = 0; x < usuaris[i].ventesMajoristes.length; x++) {
                usuaris[i].dinersVentesTotals += usuaris[i].ventesMajoristes[x] * parseFloat(usuaris[i].stuff.decisions.preuMajoristes[i][2]) - (usuaris[i].ventesMajoristes[x] * parseFloat(usuaris[i].stuff.decisions.preuMajoristes[i][0]))
                usuaris[i].dinersVentesMajoristes += usuaris[i].ventesMajoristes[x] * parseFloat(usuaris[i].stuff.decisions.preuMajoristes[i][2]) - (usuaris[i].ventesMajoristes[x] * parseFloat(usuaris[i].stuff.decisions.preuMajoristes[i][0]))
            }
            
            usuaris[i].dinersVentesMinoristes += usuaris[i].ventesMinoristes * (parseFloat(usuaris[i].stuff.decisions.preuMinoristes)-0.2)
            usuaris[i].dinersVentesTotals += usuaris[i].ventesMinoristes * (parseFloat(usuaris[i].stuff.decisions.preuMinoristes)-0.2)
            usuaris[i].benefici = usuaris[i].dinersVentesTotals - usuaris[i].costTotal
        }

        //crear fabriques
        var partidesStuff = JSON.parse(resultsPartides[0].stuff)
        var toAdd = partidesStuff

        for (var i = 0; i < usuaris.length; i++) {
            if (usuaris[i].stuff.decisions.comprarFabrica == "true") {
                for (var x = 0; x < partidesStuff.length; x++) {
                    if (partidesStuff[x].usuari === usuaris[i].usuari) {
                        var decisions = usuaris[i].stuff.decisions.quinaFabricaComprar
                        if (decisions.tier < 1 || decisions.tier > 3) {
                            decisions.tier = 1
                        }
                        toAdd[x].fabriques.push({nom: decisions.nom, treballadors: 0, tier: decisions.tier, id: toAdd[x].fabriques.length + 1})
                        usuaris[i].stuff.decisions.comprarFabrica = "false"
                    }
                }
            }
        }
        var sql = `UPDATE \`partides\` SET stuff = '${JSON.stringify(toAdd)}' WHERE nom = '${partida}'`
        await pool.query(sql)

        var resultatsPartidaJugadors = JSON.parse(resultsPartides[0].resultats)
        var resultatsAAfegir = []
        var anyPartida = parseInt(resultsPartides[0].any)
        //aplicar resultats
        for (var i = 0; i < usuaris.length; i++) {
            for (var x = 0; x < resultatsPartidaJugadors[anyPartida - 1].length; x++) {
                //console.log(resultatsPartidaJugadors)
                if (resultatsPartidaJugadors[anyPartida - 1][x].usuari.toLowerCase() == usuaris[i].usuari.toLowerCase()) {
                    dinersJugador = resultatsPartidaJugadors[anyPartida - 1][x].diners
                }
            }
            resultatsAAfegir.push({
                usuari: usuaris[i].usuari,
                diners: dinersJugador + usuaris[i].benefici,

                dinersVentesMajoristes: usuaris[i].dinersVentesMajoristes,
                dinersVentesMinoristes: usuaris[i].dinersVentesMinoristes,
                dinersVentesTotals: usuaris[i].dinersVentesTotals,

                costTotal: usuaris[i].costTotal,
                produccioTotal: usuaris[i].produccioTotal,
                costProduccioTotal: usuaris[i].costProduccioTotal,
                costMarketingTotal: usuaris[i].costMarketingTotal,
                costVentesTotal: usuaris[i].costVentesTotal,
                ventesTotals: usuaris[i].ventesTotals,
                ventesMajoristes: usuaris[i].ventesMajoristes,
                ventesMinoristes: usuaris[i].ventesMinoristes,
                posicionamentMajoristes: usuaris[i].posicionamentMajoristes,
                posicionamentMinoristes: usuaris[i].posicionamentMinoristes,
                benefici: usuaris[i].benefici
            })
        }

        resultatsPartidaJugadors.push(resultatsAAfegir)
        //console.log(resultatsAAfegir)


        //console.log(resultatsPartidaJugadors[anyPartida])
        //Aplicar definitivament els resultats
        var sql = `UPDATE \`partides\` SET resultats = '${JSON.stringify(resultatsPartidaJugadors)}' WHERE nom = '${partida}'`
        await pool.query(sql)

        var sql = `UPDATE \`partides\` SET any = '${JSON.stringify(anyPartida + 1)}' WHERE nom = '${partida}'`
        await pool.query(sql)

        return "S'ha simulat la partida"
        //afegir definitivament les fàbriques

        //console.log(dades.posicionamentMajoristes)
        //console.log(usuaris, dades.demandaRestantMinoristes)
    } else {
        console.log("Simular - Falta el paràmatre de 'partida'")
    }
}

//simular('test')

/*function buscarUsuarisEnPartida(array, partida) {
    for (var i = 0; i < result.stuff.length; i++) {
        if (result.stuff[i].partida == partida) {
            return result.stuff[i]
        }
    }
    
}*/