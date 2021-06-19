/*
	Obligatorio - Taller de Programación 1
	Nombre: Sebastián Uriarte Güimil
	Nº de estudiante: 194973
	19/03/2015
	Universidad ORT Uruguay
*/

/*Variables globales.*/
var listaDeFuncionarios = [];
var listaDeConceptos = [];

$(document).ready(inicializacion);

function inicializacion(){
	$(window).resize(ajustarAltura);
	$(".botonesIzq").click(mostrarDiv);
	$("#btningresoLinea").click(mostrarCrearLinea);
	$("#btnconsultaSueldos").click(mostrarConsultaSueldos);
	$("#btnconsultaDinero").click(mostrarConsultaDinero);
	$("input").blur(verificarNoVacio);
	$("#altaFuncionario input").change(verificarFuncionario);
	$("#nFuncionario").unbind().blur(verificarFuncionario);
	$("#fechaFunc").unbind().datepicker({
		onClose: function() {
			validarFechaSelector();
	}});
	$("#selectFuncionario").change(validarLineaEImporte);
	$("#selectConcepto").change(validarLineaEImporte);
	$("#resetFunc").click(botonReset);
	$("#confirmacionFunc").click(crearFuncionario);
	$("#actualizarFoto").click(function(){
		$("#nFuncionario").blur();
	});
	$("#imgFunc").tooltip({
		position: {my: "left+25 center", at: "right center"}
	});
	$("#nomConc").change(verificarConcepto);
	$("#confirmacionConc").click(crearConcepto);
	$("#importe").change(validarImporte).blur(validarImporte);
	$("#importe").click(validarLinea);
	$("#confirmacionLinea").click(crearLinea);
	$("#tabsSueldos").tabs();
	$("#tabsDinero").tabs();
	$("#principal").css("background-color","#000");
}

/*Resetea los campos a llenar por el usuario.*/
function botonReset(){
	if(confirm("¿Está seguro de que desea vaciar los campos superiores?")){
		resetearCampos();
	}	
}

function mostrarConsultaDinero(){
	cargarTabsDinero();
	mostrarDivId($(this).attr("id"));	
}

function cargarFoto(numeroF){
	$("#warningImagen").html("");
	$("#celdaFoto").html("<img src='imagenes/" + numeroF + ".jpg?" + new Date().getTime() + "' class='imgFuncionario' title='La imagen del funcionario deberá estar en formato .jpg, ubicada " + 
			"en la carpeta 'imagenes' del proyecto y tener como nombre de archivo un número de funcionario válido a ingresar en el campo superior.' alt='La foto del Funcionario.' " +
			"onerror='imagenError()'>");
}

function imagenError(){
	$("#celdaFoto").html("<img src='imagenes/errorImagen.jpg' class='imgFuncionario' title='La imagen del funcionario deberá estar en formato .jpg, ubicada en la carpeta 'imagenes' del proyecto " + 
			"y tener como nombre de archivo un número de funcionario válido a ingresar en el campo superior.' alt='Imagen por defecto para el funcionario'>");
	$("#warningImagen").html("<img src='imagenes/warning.png' width='20px' height='20px' class='iconosInf' alt='Icono de alerta'>Imagen no encontrada, se le asignará esta por defecto, o reintente.");
}

/*Función auxiliar para que se validen ambos valores al ingresar una línea.*/
function validarLineaEImporte(){
	validarLinea();
	if($("#importe").val() !== ""){ 				//De otra forma mostraría un error cada vez que se cambia un valor en los <select>, incluso sin haber ingresado nada.
		validarImporte();
	}	
}

function resetearCampos(){
	$("input").val("");
	$(".error").html("");
	$("#selectSecFunc").val("1");
}

function validarLinea(){
	var funcionarioSelec = listaDeFuncionarios[$("#selectFuncionario").val()];
	var conceptoSelec = listaDeConceptos[$("#selectConcepto").val()];
	if(buscarLinea(funcionarioSelec,conceptoSelec["nombre"]) !== -1){
		$("#warningSobreescribe").html("<img src='imagenes/warning.png' width='20px' height='20px' class='iconosInf' alt='Icono de alerta'>Línea ya registrada. "
				+ "De continuar, será sobreescrito su importe.");
	}else{
		$("#warningSobreescribe").html("");
	}
}

function validarBotonIngresoL(){
	if(listaDeFuncionarios.length !== 0 && listaDeConceptos.length !== 0){  		//Si se registra un único concepto de salida no podrá ingresar ninguna línea aún con la opción activa,
		$("#btningresoLinea").removeAttr("title");									//mas esto será manejado al intentar registrar la propia línea (sueldo negativo).
		$("#btningresoLinea").attr("disabled",false);
	}
}

function crearFuncionario(){
	$("#altaFuncionario input").trigger("change");
	$("#altaFuncionario input").trigger("blur");
	if($("#altaFuncionario .flagError").length === 0){
		listaDeFuncionarios.push({"nombre":$("#nomFunc").val(),"apellido":$("#apellidoFunc").val(),"numeroF":$("#nFuncionario").val(), 
								"direccion":$("#direccionFunc").val(),"fechaIngreso":$("#fechaFunc").val(),"seccion":$("#selectSecFunc").val(),"listaLineas":[]});
		ordenarFuncionarios();
		alert("Funcionario creado exitosamente.");
		resetearCampos();
		validarBotonIngresoL();
	}else{
		alert("Errores detectados: Revise los campos a llenar y reintente.");
	}
}

function mostrarCrearLinea(){
	var codigoHTML = "";
	var listaF = identificarFuncs();
	for(var i=0;i<listaF.length;i++){
		 codigoHTML+="<option value='" + i + "'>" + listaF[i] + "</option>";
	}
	$("#selectFuncionario").html(codigoHTML);
	var aux = listaDeConceptos[0]["tipo"] === "Salida";
	if(aux){
		codigoHTML = "<optgroup label='Salidas de Dinero'>";
	}else{
		codigoHTML = "<optgroup label='Entradas de Dinero'>";
	}
	for(var i=0;i<listaDeConceptos.length;i++){
		var posicion = listaDeConceptos[i];
		if(aux && posicion["tipo"] === "Entrada"){
			codigoHTML += "</optgroup><optgroup label='Entradas de Dinero'>";
			aux = false;
		}
		codigoHTML+="<option value='" + i + "'>" + posicion["nombre"] + "</option>";
	}
	$("#selectConcepto").html(codigoHTML + "</optgroup>");
	mostrarDivId($(this).attr("id"));
}

function mostrarConsultaSueldos(){
	cargarTabsSueldos();
	mostrarDivId($(this).attr("id"));	
}

function nombresConceptos(){
	var retorno = [];
	for(var i=0;i<listaDeConceptos.length;i++){
		var aux = listaDeConceptos[i];
		retorno.push(aux["nombre"]);
	}
	return retorno;
}

/*Genera un array con información de los funcionarios con propósitos de presentación.*/
function identificarFuncs(){
	return identificarFuncsParam(listaDeFuncionarios);
}

function identificarFuncsParam(lista){
	var retorno = [];
	for(var i=0;i<lista.length;i++){
		var aux = lista[i];
		retorno.push(aux["nombre"] + " " + aux["apellido"] + " (Nº: " + aux["numeroF"] + ")");
	}
	return retorno;
}

function crearConcepto(){
	$("#nomConc").trigger("change");
	$("#nomConc").trigger("blur");
	if($("#regConcepto .flagError").length === 0){
		var tipoC = "";
		if($("#radioS").is(":checked")){
			tipoC = "Salida"						
		}else{
			tipoC = "Entrada";
		}
		listaDeConceptos.push({"nombre":$("#nomConc").val(),"tipo":tipoC});
		ordenarConceptos();
		alert("Concepto creado exitosamente.");
		resetearCampos();
		validarBotonIngresoL();
	}else{
		alert("Errores detectados: Revise los campos a llenar y reintente.");
	}	
}

function ordenarFuncionarios(){
	listaDeFuncionarios.sort(function(func1,func2){
		var nom1 = (func1["nombre"]).toLowerCase();
		var nom2 = (func2["nombre"]).toLowerCase();
		return(nom1.localeCompare(nom2));
	});
}

function ordenarConceptos(){
	listaDeConceptos.sort(function(conc1,conc2){
		var retorno = (conc2["tipo"]).localeCompare(conc1["tipo"]);
		if(retorno === 0){
			var nom1 = (conc1["nombre"]).toLowerCase();
			var nom2 = (conc2["nombre"]).toLowerCase();
			retorno = (nom1.localeCompare(nom2));
		}
		return retorno;	
	});
}

function ajustarAltura(){
	$("#barraIzq").attr("height",$(window).height());
	$("#principal").attr("height",$(window).height());
}

/*Métodos que muestran y ocultan divs.*/
function mostrarDiv(){
	mostrarDivId($(this).attr("id"));
}

function mostrarDivId(idBoton){
	resetearCampos();
	$("#fondo").children("div").hide();
	$("#" + idBoton.replace(/btn/g,"")).show();
}

/*Validaciones de entradas.*/
function verificarNoVacio(){
	if($(this).val().length === 0){
		errorDet($(this).attr("id"),"No es posible dejar este campo vacío; complételo.");
	}
}

function verificarFuncionario(){
	var contenido = $(this).val();
	var id = $(this).attr("id");
	var mensaje = "";
	switch (id){
		case "nFuncionario":
			mensaje = esNatural(contenido);
			if(estaRepetido(listaDeFuncionarios,"numeroF",contenido)){
				mensaje = "El número es inválido, ya fue registrado anteriormente.";
			}else if(mensaje === ""){
				cargarFoto(contenido);				
			}
			break;
		case "fechaFunc":
			mensaje = validarFecha(contenido);
			break;
		case "nomFunc":
		case "apellidoFunc":
		case "direccionFunc":
			mensaje = validarCaracteresAlfabeticos(contenido);
			break;	
		default:
			alert("Error desconocido.");
	}
	errorDet(id,mensaje);
}

function verificarConcepto(){
	var contenido = $("#nomConc").val();
	var mensaje = validarCaracteresAlfabeticos(contenido);
	if(mensaje === "" && estaRepetido(listaDeConceptos,"nombre",contenido)){
		mensaje = "Error: Nombre de concepto ya registrado, reintente."		
	}
	errorDet("nomConc",mensaje);
}

function estaRepetido(lista,variable,valor){
	var retorno = false;
	for(var i=0;i<lista.length && !retorno;i++){
		retorno = lista[i][variable]==valor;		
	}
	return retorno;
}

function validarCaracteresAlfabeticos(contenido){
	var mensaje = "";
	if(contenido.replace(/[_\W\d]/g,"").search(/\w/g)===-1){  				//No detecta como caracteres alfabéticos letras con tilde o ñ
		mensaje = "Este campo debe contener caracteres alfabéticos.";		//aunque como tampoco sería válida una entrada que los utilizara únicamente, se lo deja así.
	}	
	return mensaje;
}

/*En base a un mensaje, de producirse, muestra en pantalla una alerta de error.*/
function errorDet(id,mensaje){
	if(mensaje==""){
		$("#error"+id).html("<img src='imagenes/ok.png' width='20px' height='20px' class='iconosInf' alt='Icono de resultado correcto'>");
	}else{
		$("#error"+id).html("<img src='imagenes/error.png' width='20px' height='20px' class='iconosInf flagError' alt='Icono de error'><div class='divAux'>" + mensaje + "</div>");
	}	
}

function validarNoNumero(contenido){
	return (isNaN(contenido) || contenido.match(/\[+ -*[/]%]/g));
}

function validarFechaSelector(){
	if ($("#fechaFunc").val() === ""){
		mensaje = "No es posible dejar este campo vacío; complételo.";
	}else{
		mensaje = validarFecha($("#fechaFunc").val());
	}
	errorDet("fechaFunc",mensaje);
}

function validarFecha(contenido){
	contenido = contenido.trim();
	var aux = contenido.replace(/[/]/g,"");
	var retorno = "";
	if(contenido.charAt(5) !== '/' || contenido.charAt(5) !== '/' || validarNoNumero(aux)){ 		//Datepicker debería evitar igual que se ingresaran caracteres inválidos.
		retorno = "Entrada inválida: ingrese una fecha con el formato: DD/MM/AAAA.";
	}else if(aux.length != 8) {
		retorno = "La fecha ingresada es inválida, reintente.";
	}else{
		var dia = parseInt(aux.substring(0,2));
		var mes = parseInt(aux.substring(2,4));
		var año = parseInt(aux.substring(4,8));
		var valida = (dia >= 1) && (año >= 0) && (año <= 2015);
		switch(mes){
			case 1:
			case 3:
			case 5:
			case 7:
			case 8:
			case 10:
			case 12:
				valida = valida && (dia <= 31);
				break;
			case 4:
			case 6:
			case 9:
			case 11:
				valida = valida && (dia <= 30);
				break;
			case 2:
				if(año % 4 === 0){
					valida = valida && (dia <= 29);
				}else{
					valida = valida && (dia <= 28);
				}
				break;
			default:
				valida = false;
				break;	
		}
		if(!valida){
			retorno = "Fecha inválida, revise la consistencia del día y el mes."
		}
	}
	return retorno;
}

function esNatural(contenido){
	var retorno = "";
	var aux = contenido.replace(",",".").trim();
	if(aux.length === 0){
		retorno = "Es necesario ingresar un valor numérico válido en este campo."
	}else if (validarNoNumero(aux)){
		retorno = "Utilice caracteres numéricos exclusivamente (no es posible ingresar números negativos).";	//Su ejecución depende del soporte de <input type="number">
	}else if (aux != parseInt(aux) || aux <= 0){																//del browser.
		retorno = "El valor a ingresar debe ser un número entero positivo."
	}
	return retorno;
}

function validarImporte(){
	var contenido = $("#importe").val();
	var conceptoSelec = listaDeConceptos[$("#selectConcepto").val()];
	var mensaje = esNatural(contenido);
	if(mensaje === ""){
		var funcionarioSelec = listaDeFuncionarios[$("#selectFuncionario").val()];
		var posicion = buscarLinea(funcionarioSelec,conceptoSelec["nombre"]);
		var aux = false;
		if(conceptoSelec["tipo"] === "Salida"){
			aux = sueldoNoDefinido(funcionarioSelec);
			if(!aux){
				if(posicion === -1){																//Salida no ingresada.
					aux = funcionarioSelec["sueldoActual"] - parseInt(contenido) < 0;		
				}else{
					aux = funcionarioSelec["sueldoActual"] - funcionarioSelec["listaLineas"][posicion]["importe"] - parseInt(contenido) < 0; 	//Salida a sobreescribir.
				}
			}	
		}else if(posicion !== -1){
			aux = funcionarioSelec["sueldoActual"] - funcionarioSelec["listaLineas"][posicion]["importe"] + parseInt(contenido) < 0 //Entrada a sobreescribir (si es una nueva no hay posibilidad
		}																															//en teoría de que sea negativo el sueldo).
		if(aux){
			mensaje = "Registro de línea inválida: Sueldo resultaría negativo.";
		}
	}	
	errorDet("importe",mensaje);
}

function noDefinido(objeto){
	return (typeof objeto == "undefined");
}

function sueldoNoDefinido(funcionario){
	return noDefinido(funcionario["sueldoActual"]);
}

function crearLinea(){
	$("#ingresoLinea input").trigger("change");
	if($("#ingresoLinea .flagError").length === 0){
		var funcionarioSelec = listaDeFuncionarios[$("#selectFuncionario").val()];
		var conceptoSelec = listaDeConceptos[$("#selectConcepto").val()];
		var importe = parseInt($("#importe").val());
		var posicion = buscarLinea(funcionarioSelec,conceptoSelec["nombre"]);
		if(conceptoSelec["tipo"] === "Salida"){
			importe = -1*importe;
		}
		if(posicion === -1){
			if(sueldoNoDefinido(funcionarioSelec)){					 							//Necesariamente debe ("debería") ser una entrada.
				funcionarioSelec["sueldoActual"] = importe;
			}else{
				funcionarioSelec["sueldoActual"] += importe;
			}
		funcionarioSelec["listaLineas"].push({"concepto":conceptoSelec,"importe":importe});	
		}else{
			var importeAnterior = funcionarioSelec["listaLineas"][posicion]["importe"];
			funcionarioSelec["sueldoActual"] =  funcionarioSelec["sueldoActual"] - importeAnterior + importe;
			funcionarioSelec["listaLineas"][posicion]["importe"] = importe;
		}			
		alert("Línea correctamente agregada a la liquidación del funcionario.");
		resetearCampos();
	}else{
		alert("Errores detectados: Revise los campos a llenar y reintente.");
	}
}

function buscarLinea(funcionario,nombreConcepto){
	var retorno = -1;
	var listaLineas = funcionario["listaLineas"];
	for(var i=0;i<listaLineas.length;i++){
		if(listaLineas[i]["concepto"]["nombre"] === nombreConcepto){
			retorno = i;
			break;			
		}
	}
	return retorno;
}

function buscarFuncionarioNumero(numeroF){
	var retorno;
	for(var i=0;i<listaDeFuncionarios.length;i++){
		var posicion = listaDeFuncionarios[i];
		if(posicion["numeroF"] == numeroF){
			retorno = posicion;
			break;			
		}
	}
	return retorno;	
}

/*Carga los datos de los Funcionarios en los divs correspondientes.*/
function cargarTabsSueldos(){
	for(var i=1;i<=4;i++){
		procesarArrayF(i,separarFuncionarios(i));
	}
}

function procesarArrayF(seccion,lista){
	var idDestino = "#tabsSueldos-" + seccion;
	if(lista[0] != null){
		var codigoHTML = "<table class='tablaAncha linearGradient'><thead><tr><th class='encabezado'>Funcionario:</th><th class='encabezado'>" + 
						 "Sueldo líquido a cobrar:</th><th class='encabezado'>Más información:</th></tr></thead><tbody>";
		var nombres = identificarFuncsParam(lista);
		for(var i=0;i<lista.length;i++){
			var posicion = lista[i];
			codigoHTML+="<tr><td class='celda'>" + nombres[i] + "</td><td class='celda'>"; 
			if(sueldoNoDefinido(posicion)){
				codigoHTML+="Sueldo no ingresado.";
			}else{
				codigoHTML+="$ " + posicion["sueldoActual"];
			}
			codigoHTML+="</td><td class='celda'><img src='imagenes/lupa.png' " + 
						"width='45px' height='45px' class='iconosInf masInfo' alt='Icono de más información' onclick='masInformacion(" + posicion["numeroF"] + ")'></td></tr>";
		}
		$(idDestino).html(codigoHTML + "</tbody></table>");
	}else{
		$(idDestino).html("<br><br><br><br><br><br><h2>Sin datos para mostrar</h2>");
	}	
}

function separarFuncionarios(seccion){
	var retorno = [];
	for(var i=0;i<listaDeFuncionarios.length;i++){
		var posicion = listaDeFuncionarios[i];
		if(posicion["seccion"] == seccion){
			retorno.push(posicion);
		}
	}
	return retorno;
}

/*Carga la ampliación de la información del funcionario.*/
function masInformacion(numeroF){
	var funcionario = buscarFuncionarioNumero(numeroF);
	cargarFotoInfo(numeroF);
	$("#nMasInfo").text(numeroF);
	$("#nomMasInfo").text(funcionario["nombre"]);
	$("#apellidoMasInfo").text(funcionario["apellido"]);
	$("#direccionMasInfo").text(funcionario["direccion"]);
	$("#seccionMasInfo").text(obtenerTextoSeccion(funcionario["seccion"]));
	$("#fechaMasInfo").text(funcionario["fechaIngreso"]);
	var listaLineas = funcionario["listaLineas"];
	if(listaLineas.length === 0){
		$("#divLineas").html("<div class='sinDatos'>Sin datos para mostrar</div>");
	}else{
		var codigoHTML = "<table class='tablaAncha linearGradient' id='tablaLineas'><thead><tr><th class='encabezado'>Concepto:</th><th class='encabezado'>" + 
						 "Importe:</th></tr></thead><tfoot><tr><td class='celda celdaCampo pie'>Sueldo Total</td><td class='celda celdaCampo pie'>$ " + funcionario["sueldoActual"] + 
						 "</td></tr></tfoot><tbody>";
		for(var i=0;i<listaLineas.length;i++){
			var posicion = listaLineas[i];
			var importe = posicion["importe"];
			codigoHTML+="<tr><td class='celda'>" + posicion["concepto"]["nombre"] + "</td><td class='celda celdaCampo'>";
			if(importe<0){
				codigoHTML+="<span class='negativo'>- $" + (-1*importe) + "</span>";
			}else{
				codigoHTML+="$" + importe;
			}
			codigoHTML+="</td></tr>"
		}
		$("#divLineas").html(codigoHTML + "</tbody></table>");
	}
	$("#fondo").children("div").hide();
	$("#masInformacion").show();
}

function cargarFotoInfo(numeroF){
	$("#celdaFotoInfo").html("<img src='imagenes/" + numeroF + ".jpg?" + new Date().getTime() + "' class='imgFuncionario' alt='La foto del Funcionario.' onerror='imagenErrorInfo()'>");
}

function imagenErrorInfo(){
	$("#celdaFotoInfo").html("<img src='imagenes/errorImagen.jpg' class='imgFuncionario' title='Fotografía por defecto; de existir, es posible que se haya movido o eliminado la fotografía" + 
								" asociada con este funcionario' alt='La foto del Funcionario.'>");
}

function obtenerTextoSeccion(seccion){
	switch(seccion){
		case "1":
			seccion+=" - Administración";
			break;
		case "2":
			seccion+=" - Fábrica";
			break;
		case "3":
			seccion+=" - Ventas";
			break;
		case "4":
			seccion+=" - Directorio";
			break;
		default:
			seccion+="Error";
			break;			
	}
	return seccion;
}

/*Carga las tabs de consultaDinero, utilizando los métodos auxiliares presentados debajo.*/
function cargarTabsDinero(){
	for(var i=1;i<=4;i++){
		dineroSeccion(i);
	}
}

function dineroSeccion(seccion){
	var importes = sueldosPorSeccion(seccion);
	if(importes.length !== 0){
		var codigoHTML ="<fieldset class='fieldsetDinero' id='billetes'><legend>Billetes</legend><table class='tablasDinero linearGradient'><tr>" +
							"<th class='encabezado'>Importe:</th><th class='encabezado'>Cantidad:</th></tr>";
		var billetes = [2000,1000,500,200,100,50,20];
		var monedas = [10,5,2,1];
		var aux = procesarArrayImportes(importes,billetes,"billetes");
		var total = aux["totalC"];
		codigoHTML+=aux["codigo"] + "<fieldset class='fieldsetDinero' id='monedas'><legend>Monedas</legend><table class='tablasDinero linearGradient'><tr><th class='encabezado'>"
					+"Importe:</th><th class='encabezado'>Cantidad:</th></tr>";
		aux = procesarArrayImportes(aux["restosC"],monedas,"monedas");
		total+=aux["totalC"];
		codigoHTML+=aux["codigo"];		
		$("#tabsDinero-" + seccion).html(codigoHTML + "<div id='granTotalSueldos'>Total por sueldos para esta sección: $ " + total + "</div>");
	}else{
		$("#tabsDinero-" + seccion).html("<br><br><br><br><br><br><h2>Sin datos para mostrar</h2>");
	}
}

function sueldosPorSeccion(seccion){
	var retorno = [];
	var funcionarios = separarFuncionarios(seccion);
	for(var i=0;i<funcionarios.length;i++){
		var posicion = funcionarios[i];
		if(!sueldoNoDefinido(posicion)){
			retorno.push(posicion["sueldoActual"]);
		}
	}
	return retorno;
}

function procesarArrayImportes(arrayAProcesar,arrayImp,tipo){				//Se pretende que las cantidades a retornar sean para cada funcionario idividualmente, por ej.
	var codigo = "";														//si dos funcionarios ganan $15 no es posible pagar un billete de 20 y una moneda de 10 sino que 
	var total = 0;															//se espera que retorne 2 monedas de 10 y 2 de 5.
	var cantidades = [];
	var restos = [];
	for(var i=0;i<arrayAProcesar.length;i++){
		var importeLocal = arrayAProcesar[i];
		for(var j=0;j<arrayImp.length;j++){
			var posicion = arrayImp[j];
			var cantidad = Math.floor(importeLocal/posicion);
			total+=posicion*cantidad;
			if(noDefinido(cantidades[j])){
				cantidades.push(cantidad);
			}else{
				cantidades[j]+=cantidad;
			}
			importeLocal = importeLocal % posicion;
		}
		restos.push(importeLocal);
	}
	for(var h=0;h<cantidades.length;h++){
		codigo+="<tr><td class='celda celdaCampo'>$ " + arrayImp[h] + "</td><td class='celda celdaCampo'>" + cantidades[h] + "</td></tr>";
	}
	codigo+="<tr><td class='celda celdaCampo pie'>Total en "+ tipo +":</td><td class='celda celdaCampo pie'>$ " + total + "</td></tr></table></fieldset>";
	return ({"codigo":codigo,"totalC":total,"restosC":restos});
}