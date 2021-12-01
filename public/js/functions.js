function verificar(json) {
    if (json == "" || json == undefined){
        return false
    }

    data = JSON.parse(json)

    $.ajax({
        type: "POST",
        async: true,
        url: `http://localhost:4854/auth/login`,
        data: data,        

        
        success: function (response) {
            if (response == false) {
                return false
            }
            return true
        }
    });
}

function cargarPartides(user, pass) {
    const cargar = document.getElementById("contenidor-partides")
    

    data = {
        user: user,
        pass: pass
    }

    $.ajax({
        type: "POST",
        async: true,
        url: `http://localhost:4854/partides`,
        data: data,

        
        success: function (response) {

            if (response == []) {
                cargar.innerHTML = "<div class='partida'>Actualment no et trobes en cap partida</div>"

            } else {
                let retornar = ""

                for (var i = 0; i < response.length; i++) {
                    var data2 = {
                        partida: response[i].nom
                    } 

                    retornar += "<div class='partida' onclick='location.href = `/decisions/p/" + response[i].nom + "`'><b>Nom:</b> " + response[i].nom + "<br><b>Creador:</b> " + response[i].creador + "<br><b>Informació:</b> " + response[i].info + " <br><b>Participants:</b> " + response[i].member_count + "</div>"
                    if (response[i].creador.toLowerCase() == user.toLowerCase()) {
                        retornar += `<button onclick='location.href = "${response[i].nom}/adminpanel/"'>Admin</button>`
                    }

                    
                }
                cargar.innerHTML = retornar;
            }
        }
    });
}

function enviar(partida, user, decisions) {
    if (typeof decisions == "object") {
        var send = {
            partida: partida,
            decisions: decisions
        } 

        $.ajax({
            type: "POST",
            async: true,
            url: `http://localhost:4854/decisions/${user}`,
            data: send,        
        });

        return "Les decisions s'han guardat correctement"
    }
}

/*function cargarDecisions(usuari, partida, decisions) {
    if (typeof decisions == "object") {
        let send = {
            partida: partida
        } 

        $.ajax({
            type: "POST",
            async: false,
            url: `http://localhost:4854/decisions/u/${usuari}`,
            data: send,
                
            success: function (res) {
                var object = JSON.parse(res) 
                for (var i = 0; i < decisions.length; i++) {
                    for (const [key, value] of Object.entries(object)) {
                        if (key == decisions[i].name) {
                            decisions[i].value = value
                        }
                    }
                }

                document.getElementById("output").style.border = "1px solid black"
                document.getElementById("output").innerHTML = "Les decisions s'han guardat correctament"   
            }
        });
    } else {
        document.getElementById("output").style.border = "1px solid black"
        document.getElementById("output").innerHTML = "Error al cargar decisions"
    }
}*/

function cargarFabriques() {
    $.ajax({
        type: "GET",
        async: true,
        url: `http://localhost:4854/decisions/fabriques.html`,
        
        success: function (res) {
            document.getElementById("fabriques-display").innerHTML = res
            document.getElementById("fabriques-display").style.border = "1px solid black"
            document.getElementById("fabriques-display").style.padding = "20px"
        }
    });
}

function verificarComprarFabrica(partida, usuari) {
    var send = {
        partida: partida
    }

    $.ajax({
        type: "POST",
        async: true,
        url: `http://localhost:4854/decisions/u/${usuari}`,
        data: send,
        
        success: function (res) {
            res = JSON.parse(res)
            
            $('#fabriques-display')[0].innerHTML = ''
            $('#fabriques-display')[0].style.border = "none"
            $('#fabriques-display')[0].style.padding = "0px"

            if (res.comprarFabrica === "true") {
                var element = document.createElement('span')
                element.innerHTML = 'Comprar: 1 x Fabrica tier ' + res.quinaFabricaComprar.tier.toString()
                $('#fabriques-display')[0].appendChild(element)

                var element2 = document.createElement("button")
                element2.innerHTML = "Cancelar"
                element2.onclick = function () { guardarDecisions('cancelar-comprar-fabrica', partida, usuari) }
                $('#fabriques-display')[0].appendChild(element2)
            } else {
                var element = document.createElement('button')
                element.innerHTML = 'Adquirir una nova fàbrica'
                element.onclick = function () { cargarFabriques() }
                $('#fabriques-display')[0].appendChild(element)
            }
        }
    })
}

function cancelarComprarFabrica() {
    if (typeof localStorage.comprarFabrica != "undefined" && localStorage.comprarFabrica != "") {
        if (JSON.parse(localStorage.comprarFabrica).any == any) {
            document.getElementById("fabriques-display").innerHTML = "<span>Comprar 1 x " + JSON.parse(localStorage.comprarFabrica).fabricaType + "</span><button style='margin-left:5px' onclick='cancelarOrdreComprarFabrica()'>Cancelar</button>"
            document.getElementById("fabriques-display").style.border = ""
            document.getElementById("fabriques-display").style.padding = "0px"
            document.getElementById("fabriques-display").style.fontWeight = "700"
        } else {
            document.getElementById("fabriques-display").innerHTML = "<button onclick='cargarFabriques()'>Adquirir una nova fàbrica</button>"
            document.getElementById("fabriques-display").style.border = ""
            document.getElementById("fabriques-display").style.padding = "0px"
            document.getElementById("fabriques-display").style.fontWeight = "500"
        }
        
    } else {
        document.getElementById("fabriques-display").innerHTML = "<button onclick='cargarFabriques()'>Adquirir una nova fàbrica</button>"
        document.getElementById("fabriques-display").style.border = ""
        document.getElementById("fabriques-display").style.padding = "0px"
        document.getElementById("fabriques-display").style.fontWeight = "500"
    }
    
}

function comprarFabrica(fabricaType) {
    let data = {
        fabricaType: fabricaType,
        any: any
    }

    localStorage.comprarFabrica = JSON.stringify(data)
}

function cancelarOrdreComprarFabrica() {
    localStorage.removeItem("comprarFabrica")
    cancelarComprarFabrica()
}

function carregarProduccio(partida, usuari, radio1, radio2) {
    send = {
        partida: partida
    }
    
    $.ajax({
        type: "POST",
        async: true,
        url: `http://localhost:4854/decisions/u/${usuari}`,
        data: send,
        
        success: function (res) {
            res = JSON.parse(res)
            if (res.externalitzarProduccio === "true") {

                radio1.checked = true
                radio2.checked = false
                carregarExternalitzarProduccio(document.getElementById('carregar'), res)
            } else {
                radio1.checked = false
                radio2.checked = true
                carregarProduccioInterna(document.getElementById('carregar'))
            }
        }
    });
}

function carregarExternalitzarProduccio(on, decisions) {
    $.ajax({
        type: "GET",
        async: true,
        url: `http://localhost:4854/decisions/externalitzar-produccio.html`,
        
        success: function (res) {
            on.innerHTML = res
            localStorage.removeItem("comprarFabrica")
            getExternalitzarPrices(partida, decisions)           
        }
    });
}



function carregarProduccioInterna(on) {
    $.ajax({
        type: "GET",
        async: true,
        url: `http://localhost:4854/decisions/produccio-propia.html`,
        
        success: function (res) {
            //document.getElementById("carregar").innerHTML = res
            on.innerHTML = res
            carregarFabriquesEnPropietat(document.getElementById("carregar-fabriques-en-propietat"), partida, usuari)
        }
    });
}

function carregarDecisionsExternalitzarProduccio(partida, usuari) {

    send = {
        partida: partida
    }
    
    $.ajax({
        type: "POST",
        async: true,
        url: `http://localhost:4854/decisions/u/${usuari}`,
        data: send,
        
        success: function (res) {
            res = JSON.parse(res)
            
            var elements = $('.comandes')

            for (var i = 0; i < res.queComprar.length; i++) {
                elements[parseInt(res.queComprar[i][0]) - 1].value = res.queComprar[i][1]
            }
            
            carregarCostTotalExternalitzarProduccio()
        }
    });
}

function getExternalitzarPrices(partida) {
    var send = {
        partida: partida
    }
    $.ajax({
        type: "POST",
        async: true,
        url: `http://localhost:4854/decisions/externalitzar-prices`,
        data: send,
        
        success: function (res) {
            for (var i = 0; i < res.length; i++) {
                var empresa = i + 1 
                var total = document.getElementById("empresa" + empresa.toString()).innerHTML
            
                for (var x = 0; x < res[i][0].length; x++) {
                    if (i == 0) {
                        id = x + 1
                    } else {
                        id = x + 1 + res[i][0].length
                    }
                     
                    total += "<tr><td>" + res[i][1][x].toLocaleString() + " u</td><td>" + res[i][0][x].toLocaleString() + "€</td><td><input value='0' min='0' max='100' class='comandes' name='" + res[i][1][x] + "-" + res[i][0][x] + "-" + id + "' type='number'></td></tr>"
                }
            

                document.getElementById("empresa" + empresa.toString()).innerHTML = total

                carregarDecisionsExternalitzarProduccio(partida, usuari)
            }
        }   

        
    });
}


function calcularCostTotalExternalitzarProduccio() {
    var inputs = document.getElementsByTagName("input")
    var cost = 0
    var unitats = 0 
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].className == "comandes") {
            var tmp = inputs[i].name.split("-")
            if (parseInt(inputs[i].value) < 0) {
                inputs[i].value = 0
            } else if (parseInt(inputs[i].value) > 100) {
                inputs[i].value = 100
            } else if (inputs[i].value == "" || inputs[i].value == undefined || inputs[i].value == null) {
                inputs[i].value = 0
            }
            
            cost += parseInt(inputs[i].value) * parseInt(tmp[1])
            unitats += parseInt(inputs[i].value) * parseInt(tmp[0])
        }
    }
    return [cost, unitats]
}

function carregarCostTotalExternalitzarProduccio() {
    const carregarUnitats = document.getElementById("unitats-totals")
    const carregarPreu = document.getElementById("cost-total")

    var costos = calcularCostTotalExternalitzarProduccio()

    carregarUnitats.innerHTML = costos[1].toLocaleString() + " u"
    carregarPreu.innerHTML = costos[0].toLocaleString() + "€"
}

function loading(on) {
    $.ajax({
        type: "GET",
        async: true,
        url: `http://localhost:4854/decisions/loading.html`,
        data: send,
        
        success: function (res) {
            on.innerHTML = res
        }
    })
}

function carregarFabriquesEnPropietat(on, partida, usuari) {
    send = {
        partida: partida,
        usuari: usuari
    }


    $.ajax({
        type: "POST",
        async: true,
        url: `http://localhost:4854/decisions/fabriques-disponibles`,
        data: send,
        
        success: function (res) {
            var toReturn = "<h4>Fàbriques en propietat:</h4><div style='display: flex;flex-wrap: wrap;'>"
            if (res.length <= 0 || res == undefined) {
                toReturn += "<span>Actualment no disposes de cap fàbrica</span></div>"
            } else {            
                for (var i = 0; i < res.length; i++) {
                    var maxTreballadors = 0
                    var maxProduccio = 0

                    if (res[i].tier == 1) {
                        maxTreballadors = 50
                        maxProduccio = 170
                    } else if (res[i].tier == 2) {
                        maxTreballadors = 80
                        maxProduccio = 210
                    } else if (res[i].tier == 3) {
                        maxTreballadors = 120
                        maxProduccio = 250
                    }

                    toReturn += "<div class='fabrica-en-propietat'><img src='/svg/fabrica-tier" + res[i].tier + ".svg'><h5>" + res[i].nom + "</h5><div><span>Treballadors: </span><div><input class='input-treballadors' type='number' name='" + res[i].tier + "-" + res[i].id + "' value='" + res[i].treballadors + "'><kbd>/" + maxTreballadors + "</kbd></div></div></div>"
                }
            }
            toReturn += "</div><div><h5>Producció total esperada</h5><span id='costProduccioInterna'>0 u</span></br><button onclick='calcularProduccioTotal(document.getElementById(`costProduccioInterna`))' class='calcular-produccio-total'>Calcular</button></div>"
            on.innerHTML = toReturn
            calcularProduccioTotal(document.getElementById(`costProduccioInterna`))
        }
    })
}

function calcularProduccio(tier, treballadors) {
    var maxTreballadors = 0
    var maxProduccio = 0

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



    return ((Math.min(treballadors/(maxTreballadors * 0.7), 1) * maxProduccio) * 1808 * treballadors).toFixed(0)
}

function contarTreballadors(partida, usuari) {
    send = {
        partida: partida,
        usuari: usuari
    }

    on = document.getElementById('nombre-treballadors')

    $.ajax({
        type: "POST",
        async: true,
        url: `http://localhost:4854/decisions/fabriques-disponibles`,
        data: send,
        
        success: function (res) {
            total = 0
            for (var i = 0; i < res.length; i++) {
                total += parseInt(res[i].treballadors)
            }
            on.innerHTML = total + " treballadors * salari = " + (total*parseInt(document.getElementById('slider-sou').value)).toLocaleString() + " €/any"
        }
    })
}

function calcularProduccioTotal(on) {
    var elements = document.getElementsByClassName("input-treballadors")
    var total = 0; 

    

    for (var i = 0; i < elements.length; i++) {
        var tier = parseInt(elements[i].name.split("-")[0])

        var maxTreballadors = 0
        var maxProduccio = 0

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

        if (elements[i].value != undefined && elements[i].value != "") {
            elements[i].value = Math.max(Math.min(maxTreballadors, parseInt(elements[i].value)), 0)
        } else {
            elements[i].value = 0
        }

        total += parseInt(calcularProduccio(tier, parseInt(elements[i].value)))
    }

    on.innerHTML = total.toLocaleString() + " u"
}

/*function guardarDecisionsProduccio(partida, usuari) {
    var decisions = {}

    if ($('input[type="radio"]:checked')[0].id == "externalitzar-produccio") {
        decisions.externalitzarProduccio = true

        //veure que ha demanat x comprar
        var elements = document.getElementsByTagName("input")
        decisions.queComprar = []
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].className == 'comandes') {
                var values = elements[i].name.split('-')
                decisions.queComprar.push([parseInt(values[2]), parseInt(elements[i].value)])
            }
        }
    } else {
        decisions.externalitzarProduccio = false
        var elements = $(".input-treballadors")

        var treballadorsTotals = []
        for (var i = 0; i < elements.length; i++) {
            var id = parseInt(elements[i].name.split("-")[1])
            var treballadors = parseInt(elements[i].value)

            treballadorsTotals.push([id, treballadors])
        }

        var send = {
            usuari: usuari,
            partida: partida,
            array: treballadorsTotals
        }

        $.ajax({
            type: "POST",
            async: true,
            url: `http://localhost:4854/decisions/comprar-treballadors`,
            data: send
        })
    }


    var enviar = {
        partida: partida,
        decisions: decisions
    }

    $.ajax({
        type: "POST",
        async: true,
        url: `http://localhost:4854/decisions/${usuari}`,
        data: enviar,
        
        success: function (res) {
            $('#output')[0].innerHTML = res
            $('#output')[0].style.display = "block"
        }
    })
}*/

function actualitzarSlidersRRHH() {
    document.getElementById('contador-hores-lliures').innerHTML = parseFloat(document.getElementById('slider-hores-lliures').value).toFixed(1) + " h/dia"
    document.getElementById('contador-sou').innerHTML = parseInt(document.getElementById('slider-sou').value).toLocaleString() + " €/any"

    document.getElementById('slider-sou').oninput = function() {
        document.getElementById('contador-sou').innerHTML = parseInt(document.getElementById('slider-sou').value).toLocaleString() + " €/any"
    }
    document.getElementById('slider-hores-lliures').oninput = function() {
        document.getElementById('contador-hores-lliures').innerHTML = parseFloat(document.getElementById('slider-hores-lliures').value).toFixed(1) + " h/dia"
    }
}

function actualitzarSlidersVenta() {
    document.getElementById('minoristes').innerHTML = document.getElementById('slider-minoristes-majoristes').value + " %"
    document.getElementById('majoristes').innerHTML = 100 - parseInt(document.getElementById('slider-minoristes-majoristes').value) + " %"

    document.getElementById('slider-minoristes-majoristes').oninput = function() {
        document.getElementById('minoristes').innerHTML = document.getElementById('slider-minoristes-majoristes').value + " %"
        document.getElementById('majoristes').innerHTML = 100 - parseInt(document.getElementById('slider-minoristes-majoristes').value) + " %"
    }
}

function moveSelector(top, width, left) {
    var selector = document.getElementById('selector')
    selector.style.top = top
    selector.style.width = width
    selector.style.width = left
}

function carregarMarketing(on) {
    $.ajax({
        type: "POST",
        async: true,
        url: `http://localhost:4854/decisions/marketing-opcions`,
        
        success: function (res) {
            res = JSON.parse(res)
            var toReturn = "<tr><th>Tipus de publicitat</th><th>Preu per inserció</th><th>Nº d'insercions publicitàries</th></tr>"
            for (var i = 0; i < res.length; i++) {
                toReturn += `<tr><td>${res[i].nom}</td><td>${res[i].price.toLocaleString()} €</td><td><div><input name="${res[i].id}-${res[i].price}" class="insercions-input" type="number" placeholder="ex. 100"></div></td></tr>`
            }
            on.innerHTML = toReturn

            carregarDecisions("marketing", partida, usuari)
        }
    })
}

function calcularCostMarketing(on) {
    var elements = document.getElementsByClassName('insercions-input')
    var total = 0

    for (var i = 0; i < elements.length; i++) {
        if (elements[i].value == undefined || elements[i].value == "" || elements[i].value < 0) {
            elements[i].value = 0
        }

        elements[i].value = parseInt(elements[i].value)

        total += parseInt(elements[i].name.split('-')[1]) * parseInt(elements[i].value)
    }

    on.innerHTML = total.toLocaleString() + " €"
}   

function guardarDecisions(elQue, partida, usuari) {
    var decisions = {}

    if (elQue == "RRHH"){
        decisions.salariTreballadors = $('#slider-sou')[0].value
        decisions.horesLliures = $('#slider-hores-lliures')[0].value

    } else if (elQue == "produccio") {

        if ($('input[type="radio"]:checked')[0].id == "externalitzar-produccio") {
            decisions.externalitzarProduccio = true

            //veure que ha demanat x comprar
            var elements = document.getElementsByTagName("input")
            decisions.queComprar = []
            carregarCostTotalExternalitzarProduccio()

            for (var i = 0; i < elements.length; i++) {
                
                if (elements[i].className == 'comandes') {
                    var values = elements[i].name.split('-')
                    decisions.queComprar.push([parseInt(values[2]), parseInt(elements[i].value)])
                }
            }
        } else {
            decisions.externalitzarProduccio = false
            var elements = $(".input-treballadors")

            var treballadorsTotals = []
            for (var i = 0; i < elements.length; i++) {
                var id = parseInt(elements[i].name.split("-")[1])
                var treballadors = parseInt(elements[i].value)

                treballadorsTotals.push([id, treballadors])
            }

            var send = {
                usuari: usuari,
                partida: partida,
                array: treballadorsTotals
            }

            $.ajax({
                type: "POST",
                async: true,
                url: `http://localhost:4854/decisions/comprar-treballadors`,
                data: send
            })

            var enviar = {
                partida: partida,
                decisions: decisions
            }
    
            $.ajax({
                type: "POST",
                async: true,
                url: `http://localhost:4854/decisions/${usuari}`,
                data: enviar,
                
                success: function (res) {
                    $('#output')[0].innerHTML = res
                    $('#output')[0].style.display = "block"
                    $('#output')[0].style.height = "auto"
                    $('#output')[0].style.opacity = "1"
                }
            })
        }
    } else if (elQue == "venta") {
        
        decisions.percentatgeMinoristes = $('#slider-minoristes-majoristes')[0].value
        
        if ($('#minoristes-input')[0].value == "" || $('#minoristes-input')[0].value == undefined) {
            $('#minoristes-input')[0].value = (0).toFixed(2)
        }

        decisions.preuMinoristes = $('#minoristes-input')[0].value
        
        var elements = $("td div input")
        decisions.preuMajoristes = []

        for (var i = 0; i < elements.length / 3; i++) {
            decisions.preuMajoristes.push([])
        }

        for (var i = 0; i < elements.length; i++) {
            if (elements[i].value == "" || elements[i].value == undefined) {
                elements[i].value = (0).toFixed(2)
            }
            
            if (parseInt(elements[i].name.split('-')[1]) == 0) {
                elements[i].value = Math.max(Math.min(parseFloat(elements[i].value), 0.5), 0).toFixed(2)
            } else if (parseInt(elements[i].name.split('-')[1]) == 1) {
                elements[i].value = Math.max(Math.min(parseFloat(elements[i].value), 10000000), 0).toFixed(2)
            } else if (parseInt(elements[i].name.split('-')[1]) == 2) {
                elements[i].value = Math.max(Math.min(parseFloat(elements[i].value), 3), 0).toFixed(2)
            }

            decisions.preuMajoristes[parseInt(elements[i].name.split('-')[0])][parseInt(elements[i].name.split('-')[1])] = elements[i].value
        }
    } else if (elQue == "marketing") {
        decisions.publicitat = []
        var elements = $('.insercions-input')

        for (var i = 0; i < elements.length; i++) {
            if (elements[i].value == "" || elements[i].value == undefined) {
                elements[i].value = "0"
            }

            calcularCostMarketing(document.getElementById('cost-total'))
            elements[i].value = parseInt(elements[i].value)
            decisions.publicitat[parseInt(elements[i].name.split('-')[0]) - 1] = elements[i].value
        }

    } else if (elQue == "financiacio") {
        decisions.financiacio = $('#financiacio-input')[0].name

    } else if (elQue == "cancelar-comprar-fabrica") {
        decisions.comprarFabrica = false
        carregarDecisions('produccio', partida, usuari)
    } else if (elQue == "comprar-fabrica") {
        var altoke = false
        if ($('#nom-fabrica')[0].value == undefined || $('#nom-fabrica')[0].value == "") {
            notyf("alert", "Falta omplir el nom de la fàbrica")
        } else {
            decisions.comprarFabrica = true
            decisions.quinaFabricaComprar = {nom: $('#nom-fabrica')[0].value, tier: $('input[name=selectorFabrica]:checked')[0].value}
            carregarDecisions('produccio', partida, usuari)
            altoke = true
        }
    }

    var enviar = {
        partida: partida,
        decisions: decisions
    }

    $.ajax({
        type: "POST",
        async: true,
        url: `http://localhost:4854/decisions/${usuari}`,
        data: enviar,
        
        success: function (res) {
            $('#output')[0].innerHTML = res
            $('#output')[0].style.display = "block"
            $('#output')[0].style.height = "auto"
            $('#output')[0].style.opacity = "1"
            setTimeout(() => { alertAnimation() }, 100)
        }
    })
}

function carregarDecisions(elQue, partida, usuari) {
    var send = {
        partida: partida
    }
    
    $.ajax({
        type: "POST",
        async: true,
        url: `http://localhost:4854/decisions/u/${usuari}`,
        data: send,
        
        success: function (res) {
            res = JSON.parse(res)
            
            if (elQue == "RRHH") {
                if (res.salariTreballadors != undefined) {
                    $('#slider-sou')[0].value = res.salariTreballadors
                }
                if (res.horesLliures != undefined) {
                    $('#slider-hores-lliures')[0].value = res.horesLliures
                }
                
                actualitzarSlidersRRHH()
                contarTreballadors(partida, usuari)
            } else if (elQue == "venta") {
                var elements = $("td div input")

                if (res.percentatgeMinoristes != undefined) {
                    $('#slider-minoristes-majoristes')[0].value = res.percentatgeMinoristes
                }
                
                if (res.preuMinoristes != undefined) {
                    $('#minoristes-input')[0].value = res.preuMinoristes
                }                

                if (res.preuMajoristes != undefined) {
                    for (var i = 0; i < elements.length; i++) {
                        elements[i].value = res.preuMajoristes[parseInt(elements[i].name.split("-")[0])][parseInt(elements[i].name.split("-")[1])]
                    }
                }

                actualitzarSlidersVenta()
            } else if (elQue == "marketing") {
                var elements = $('.insercions-input')

                if (res.publicitat != undefined) {
                    for (var i = 0; i < elements.length; i++) {
                        elements[i].value = res.publicitat[parseInt(elements[i].name.split('-')[0]) - 1]
                    }
                }

                calcularCostMarketing(document.getElementById('cost-total'))
            } else if (elQue == "financiacio") {
                if (res.financiacio != undefined) {
                    $('#financiacio-input')[0].value = parseInt(res.financiacio).toLocaleString()
                    $('#financiacio-input')[0].name = res.financiacio
                }
            } else if (elQue == "produccio") {
                if (res.comprarFabrica != undefined && res.quinaFabricaComprar != undefined) {
                    //$('#fabriques-display')[0].innerHTML = ""
                    verificarComprarFabrica(partida, usuari)
                }
            }
        }
    });
}

function carregarDiners(partida, usuari) {
    var send = {
        partida: partida,
        usuari: usuari
    }
    
    $.ajax({
        type: "POST",
        async: true,
        url: `http://localhost:4854/decisions/get-diners`,
        data: send,
        
        success: function (res) {
            $('#diners-disponibles')[0].innerHTML = parseFloat(res).toLocaleString() + "€"
        }
    })
}

function alertAnimation() {
    on = document.getElementById('output')

    lastHeight = on.style.marginTop
    on.style.marginTop = parseInt(on.style.marginTop) + 20 + "px"
    setTimeout(() => {  on.style.marginTop = parseInt(lastHeight) - 16 + "px"; setTimeout(() => {  on.style.marginTop = lastHeight; }, 90);}, 80);
}

function revisarInput() {
    /*$('#financiacio-input').on('input',function (e) {
        $this = $(this);
        const val = $this.val();
        if (val === "") {
            return;
        }
        let end = "";
        if (val.charAt(val.length-1) === ".") {
            end = ".";22222222222
        }
        $this.val(parseFloat($this.val()).toLocaleString() + end);
    });*/

    document.querySelector("#financiacio-input").oninput =  (function(e){
        var input = document.getElementById('financiacio-input')
        input.name = input.value.replaceAll('.', '')
        if (input.value == "" || input.value == undefined || isNaN(parseInt(input.name)) == true) {
            input.value = 0
            input.name =  "0"
        } else {
            input.value = parseInt(input.name).toLocaleString()
        }        
    })
}

function notyf(tipus, text) {
    var element = document.createElement('div')
    element.innerHTML = text
    element.style.width = "100%"
    element.style.height = "60px"
    element.style.border = "1px solid black"
    element.style.padding = "20px"
    element.style.marginBottom = "10px"
    element.style.color = "white"
    element.style.fontWeight = "600"
    element.style.borderRadius = "3px" 
    element.style.marginTop = "3px"

    if (tipus == "alert") {        
        element.style.backgroundColor = "#E94F37"
    } else if (tipus == "oke") {
        element.style.backgroundColor = "#44BBA4"
    }

    setTimeout(() => {element.remove()}, 5000)
        
    $('.notificacio2')[0].appendChild(element)
}

function logOff() {
    localStorage.removeItem("auth")
    location.href = "/auth/login"
}

function unirPartida(codi) {
    
    var data = {
        usuari: JSON.parse(localStorage.auth).user,
        codi: codi
    }

    $.ajax({
        type: "POST",
        async: true,
        url: `/partides/join`,
        data: data,
        
        success: function (res) {
            $('.debugger')[0].innerHTML = res
        },
        error: (xhr) => {
            $('.debugger')[0].innerHTML = xhr.responseText
        }
    })
}

function carregarLlistaJugadors(on) {
    var data = {
        partida: partida
    }

    $.ajax({
        type: "POST",
        async: true,
        url: `/partides/getUsuaris`,
        data: data,
        
        success: function (res) {
            var toReturn = ""
            if (parseInt(any) == 0) {
                toReturn += "<tr><th>Usuari</th><th>Accions</th></tr>"
                for (var i = 0; i < res.length; i++) {
                    toReturn += `<tr><td>${res[i]}</td><td><button>Expulsar</button></td></tr>`
                }
                on.innerHTML = toReturn
            } else {
                toReturn += "<tr><th>Posició</th><th>Usuari</th><th>Diners</th><th>Diferència any anterior</th></tr>"

                //ordenar array
                


                //calcular variació anual
                for (var i = 0; i < res[parseInt(any)-1].length; i++) {
                    if (res[parseInt(any)-2] == undefined) {
                        res[parseInt(any)-1][i].variacio = "-"
                    } else {
                        res[parseInt(any)-1][i].variacio = ((((parseFloat(res[parseInt(any)-1][i].diners) / parseFloat(res[parseInt(any)-2][i].diners))-1) * 100).toFixed(2)).toString() + " %"
                    }
                }

                res[parseInt(any)-1].sort((a, b) => {
                    return parseInt(b.diners) - parseInt(a.diners)
                })

                for (var i = 0; i < res[parseInt(any)-1].length; i++) {
                    toReturn += `<tr><td>${i + 1}</td><td>${res[parseInt(any)-1][i].usuari}</td><td>${res[parseInt(any)-1][i].diners.toLocaleString()}€</td><td>${res[parseInt(any)-1][i].variacio}</td></tr>`
                }
                on.innerHTML = toReturn
            }
        },
        error: (xhr) => {
            $('.debugger')[0].innerHTML = xhr.responseText
        }
    })
}

function iniciarPartida(partida) {

    $('#buttons button')[0].disabled = true

    var data = {
        partida: partida
    }

    $.ajax({
        type: "POST",
        async: true,
        url: `/partides/iniciar`,
        data: data,
        
        success: function (res) {
            notyf('oke', res)
            carregarLlistaJugadors(document.getElementById('llista'))
            
        },
        error: (xhr) => {
            //$('.debugger')[0].innerHTML = xhr.responseText
            notyf('alert', xhr.responseText)
            carregarLlistaJugadors(document.getElementById('llista'))
        }
    })
}

function simularPartida(partida) {

    $('#buttons button')[0].disabled = true

    var data = {
        partida: partida
    }

    $.ajax({
        type: "POST",
        async: true,
        url: `/partides/simular`,
        data: data,
        
        success: function (res) {
            notyf('oke', res)
            carregarLlistaJugadors(document.getElementById('llista'))
        },
        error: (xhr) => {
            //$('.debugger')[0].innerHTML = xhr.responseText
            notyf('alert', xhr.responseText)
            carregarLlistaJugadors(document.getElementById('llista'))
        }
    })
}

function recollirResultats(partida, usuari, any) {
    var data = {
        partida: partida,
        usuari: usuari
    }

    $.ajax({
        type: "POST",
        async: true,
        url: `/partides/resultats`,
        data: data,
        
        success: function (res) {
            //res = JSON.parse(res)


            any = parseInt(any)

            benefici = document.getElementById('benefici-total-obtingut')

            costTotal = document.getElementById('cost-total')
            costTotal2 = document.getElementById('cost-total2')

            produccioTotal = document.getElementById('produccio-total')
            produccioTotal2 = document.getElementById('produccio-total2')
            
            costProduccioTotal = document.getElementById('cost-produccio')
            costMarketingTotal = document.getElementById('cost-marketing')
            costVentesTotal = document.getElementById('cost-ventes')
            
            costPerUnitat = document.getElementById('cost-unitat')


            ventesMajoristes = document.getElementById('ventes-majoristes')
            dinersVentesMajoristes = document.getElementById('diners-ventes-majoristes')
            posicionamentGransSuperficies = document.getElementById('posicionament-grans-superficies')
            posicionamentSupermercats = document.getElementById('posicionament-supermercats')
            posicionamentGasolineres = document.getElementById('posicionament-gasolineres')

            ventesMinoristes = document.getElementById('ventes-minoristes')
            dinersVentesMinoristes = document.getElementById('diners-ventes-minoristes')
            posicionamentMinoristes = document.getElementById('posicionament-minoristes')


            //aplicar finalment els resultats
            benefici.innerHTML = parseFloat((res[any-1].benefici.toFixed(2))).toLocaleString()+"€"
            costTotal.innerHTML = parseFloat((res[any-1].costTotal.toFixed(2))).toLocaleString()+"€"
            costTotal2.innerHTML = parseFloat((res[any-1].costTotal.toFixed(2))).toLocaleString()+"€"
            produccioTotal.innerHTML = res[any-1].produccioTotal.toLocaleString() + " u"
            produccioTotal2.innerHTML = res[any-1].produccioTotal.toLocaleString() + " u"

            costProduccioTotal.innerHTML = parseFloat((res[any-1].costProduccioTotal.toFixed(2))).toLocaleString()+"€"
            costMarketingTotal.innerHTML = parseFloat((res[any-1].costMarketingTotal.toFixed(2))).toLocaleString()+"€"
            costVentesTotal.innerHTML = parseFloat((res[any-1].costVentesTotal.toFixed(2))).toLocaleString()+"€"

            costPerUnitat.innerHTML = parseFloat(res[any-1].costTotal) / parseFloat(res[any-1].produccioTotal).toFixed(2) + "€ / u"

            ventesMajoristesTotals = res[any-1].ventesMajoristes[0] + res[any-1].ventesMajoristes[1] + res[any-1].ventesMajoristes[2]

            dinersVentesMajoristes.innerHTML = parseFloat(res[any-1].dinersVentesMajoristes.toFixed(0)).toLocaleString() + "€"
            dinersVentesMinoristes.innerHTML = parseFloat(res[any-1].dinersVentesMinoristes.toFixed(0)).toLocaleString() + "€"

            ventesMajoristes.innerHTML = parseFloat(ventesMajoristesTotals.toFixed(0)).toLocaleString() + " u"
            posicionamentGransSuperficies.innerHTML = parseFloat((res[any-1].posicionamentMajoristes[0].toFixed(2))).toLocaleString()+" pts"
            posicionamentSupermercats.innerHTML = parseFloat((res[any-1].posicionamentMajoristes[1].toFixed(2))).toLocaleString()+" pts"
            posicionamentGasolineres.innerHTML = parseFloat((res[any-1].posicionamentMajoristes[2].toFixed(2))).toLocaleString()+" pts"

            ventesMinoristes.innerHTML = parseFloat((res[any-1].ventesMinoristes.toFixed(0))).toLocaleString()+" u"
            posicionamentMinoristes.innerHTML = parseFloat(res[any-1].posicionamentMinoristes.toFixed(0)).toLocaleString() + " pts"
        },
        error: (xhr) => {
            //$('.debugger')[0].innerHTML = xhr.responseText
            notyf('alert', xhr.responseText)
        }
    })
}