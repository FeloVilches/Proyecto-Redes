/// <reference path="jquery.d.ts"/>
$(document).ready(function () {
    FTP.actualizarListaArchivos();
    NTP.empezarHilo();
    // Crear el evento cuando se envia el correo SMTP
    var frm = $('#smtp_form');
    frm.submit(function (ev) {
        SMTP.enviarMail(ev, frm);
    });
});
var SMTP;
(function (SMTP) {
    function enviarMail(ev, frm) {
        $.ajax({
            type: frm.attr('method'),
            url: frm.attr('action'),
            data: frm.serialize(),
            success: function (response) {
                if (response == 1) {
                    $("#smtp_msg").html("Se ha enviado exitosamente");
                }
                else {
                    $("#smtp_msg").html("No se pudo enviar el correo.<br>" + response);
                }
            },
            error: function (response) {
                $("#smtp_msg").html("Error AJAX");
            }
        });
        ev.preventDefault();
    }
    SMTP.enviarMail = enviarMail;
})(SMTP || (SMTP = {}));
var NTP;
(function (NTP) {
    var timestmp;
    var incremento = 0;
    var thread;
    var url = "ajax/ntp_ajax.php";
    function formatTime(unixTimestamp) {
        var dt = new Date(unixTimestamp * 1000);
        var hours = dt.getHours();
        var minutes = dt.getMinutes();
        var seconds = dt.getSeconds();
        // the above dt.get...() functions return a single digit
        // so I prepend the zero here when needed
        if (hours < 10)
            hours = '0' + hours;
        if (minutes < 10)
            minutes = '0' + minutes;
        if (seconds < 10)
            seconds = '0' + seconds;
        return hours + ":" + minutes + ":" + seconds;
    }
    function empezarHilo() {
        peticionNTP();
        thread = setInterval(function () {
            if (timestmp != undefined) {
                incremento++;
                if (incremento > 0) {
                    $("#ntp_msg").html("");
                }
                $("#ntp_result").html(formatTime(timestmp + incremento));
                if (incremento == 10) {
                    peticionNTP();
                }
            }
        }, 1000);
    }
    NTP.empezarHilo = empezarHilo;
    function peticionNTP() {
        $.ajax({
            url: url,
            type: "POST",
            contentType: false,
            processData: false,
            cache: false,
            success: function (response) {
                if (!isNaN(response)) {
                    incremento = 0;
                    timestmp = Number(response);
                    console.log("Sincronizado");
                }
                else {
                    $("#ntp_result").html("Error en el servidor NTP");
                    clearInterval(thread);
                }
            },
            error: function (response) {
                $("#ntp_result").html("Error AJAX");
                clearInterval(thread);
            }
        });
    }
})(NTP || (NTP = {}));
var FTP;
(function (FTP) {
    function actualizarListaArchivos() {
        var url = "ajax/ftp_obtenerarchivos_ajax.php";
        $.ajax({
            url: url,
            type: "POST",
            contentType: false,
            processData: false,
            cache: false,
            // Cuando el archivo se sube exitosamente
            success: function (response) {
                $('#archivos_ftp').html(response);
            },
            // Cuando hay un error
            error: function (response) {
                $('#archivos_ftp').html("");
                $("#ftp_msg").html("Error al cargar los archivos");
            }
        });
    }
    FTP.actualizarListaArchivos = actualizarListaArchivos;
    // Funcion para subir usando Ajax, a una pagina PHP, para asi subirlo a FTP.
    function uploadAjax() {
        var inputFileImage = $("#ftp_file").get(0);
        var file = inputFileImage.files[0];
        var data = new FormData();
        var url = "ajax/ftp_ajax.php";
        data.append("filename", file);
        $.ajax({
            url: url,
            type: "POST",
            contentType: false,
            data: data,
            processData: false,
            cache: false,
            // Cuando el archivo se sube exitosamente
            success: function (response) {
                if (response == "1") {
                    actualizarListaArchivos();
                    $("#ftp_form")[0].reset();
                    $("#ftp_msg").html("<b>" + file.name + "</b> se ha subido correctamente.");
                }
                else {
                    $("#ftp_msg").html("Error al subir el archivo");
                }
            },
            // Cuando hay un error
            error: function (response) {
                $("#ftp_msg").html("Error AJAX");
            }
        });
    }
    FTP.uploadAjax = uploadAjax;
})(FTP || (FTP = {}));
