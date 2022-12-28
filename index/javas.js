window.addEventListener("load", cargarDatos())

async function cargarDatos() {
    // Realiza la petición a la API REST
    const response = await fetch("",{
        method: "GET",
        headers: {
            'Accept': 'application/json'
        }
    });
    // Parsea la respuesta a un formato legible
    const datos = await response.json();
        
  
    // Itera sobre los datos y crea una fila para cada uno de ellos
    let filas = "";
    datos.persons.forEach(personas => {
      filas += `
        <tr>
          <td>${personas.idPersona}</td>
          <td>${personas.nombre}</td>
          <td>${personas.pais}</td>
          <td>${personas.edad}</td>
          <td>
            <div class="text-center">
            <div class="btn-group">
                <button class="btn btn-primary btnEditar">Editar</button>
                <button class="btn btn-danger btnBorrar" onClick="deletePerson(${personas.idPersona})">Borrar</button>
            </div>
            </div> 
          </td>
        </tr>
      `;
    });
    tablaBody.innerHTML = filas
  }
  

$(document).ready(function(){
    tablaPersonas = $("#tablaPersonas").DataTable({
       "columnDefs":[{
        "targets": -1,
        "data":null,
        "defaultContent": "<div class='text-center'><div class='btn-group'><button class='btn btn-primary btnEditar'>Editar</button><button class='btn btn-danger btnBorrar'>Borrar</button></div></div>"  
       }],
        
        //Para cambiar el lenguaje a español
    "language": {
            "lengthMenu": "Mostrar _MENU_ registros",
            "zeroRecords": "No se encontraron resultados",
            "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
            "infoFiltered": "(filtrado de un total de _MAX_ registros)",
            "sSearch": "Buscar:",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast":"Último",
                "sNext":"Siguiente",
                "sPrevious": "Anterior"
             },
             "sProcessing":"Procesando...",
             cargarDatos() {}
        }
    });
    
$("#btnNuevo").click(function(){
    $("#formPersonas").trigger("reset");
    $(".modal-header").css("background-color", "#28a745");
    $(".modal-header").css("color", "white");
    $(".modal-title").text("Nueva Persona");            
    $("#modalCRUD").modal("show");        
    id=null;
    opcion = 1; //alta
});    
    
var fila; //capturar la fila para editar o borrar el registro
    
//botón EDITAR    
$(document).on("click", ".btnEditar", function(){
    fila = $(this).closest("tr");
    idPersona = parseInt(fila.find('td:eq(0)').text());
    nombre = fila.find('td:eq(1)').text();
    pais = fila.find('td:eq(2)').text();
    edad = parseInt(fila.find('td:eq(3)').text());
    
    $("#idPersona").val(idPersona);
    $("#nombre").val(nombre);
    $("#pais").val(pais);
    $("#edad").val(edad);
    opcion = 2; //editar
    $.ajax({
        url: "",
        type: "PATCH",
        dataType: "json",
        data: JSON.stringify({idPersona:idPersona})
    })
    $(".modal-header").css("background-color", "#007bff");
    $(".modal-header").css("color", "white");
    $(".modal-title").text("Editar Persona");            
    $("#modalCRUD").modal("show");  
    
});


$("#formPersonas").submit(function(e){
    e.preventDefault();  
    idPersona = $.trim($("#idPersona").val());
    nombre = $.trim($("#nombre").val());  
    pais = $.trim($("#pais").val());
    edad = $.trim($("#edad").val());    
    $.ajax({
        url: "", // Tu api
        type: "POST",
        dataType: "json",
        data: JSON.stringify({idPersona:idPersona, nombre:nombre, pais:pais, edad:edad}),
        success: function(data){  
            const response = data.Item
            id = response.idPersona;  
            nombre = response.nombre;    
            pais = response.pais;
            edad = response.edad;
            if(opcion == 1){tablaPersonas.row.add([id,nombre,pais,edad]).draw();}
            else{tablaPersonas.row(fila).data([id,nombre,pais,edad]).draw();}            
        }        
    });
    $("#modalCRUD").modal("hide");    
    window.location.reload();
    cargarDatos()
})

})

function deletePerson(id) {
    var respuesta = confirm("¿Está seguro de eliminar el registro: "+id+"?");
    if(respuesta){
        $.ajax({
            url: "", // Tu api
            type: "DELETE",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ "idPersona": id.toString()}),
            success: function(){
                $("#modalCRUD").modal("hide");  
                cargarDatos()

            }
        });
    } 
    }
