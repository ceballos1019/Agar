//Creación de tiempo real
var express=require("express");
app=express();
server=require("http").createServer(app);
//Importar socket io
io=require("socket.io").listen(server);

//Puerto en que va a correr nuestro server
server.listen(4000);
//Recibir todo lo de nuestros archivos
app.use(express.static(__dirname+"/"));
app.get("/",function(req,res)
{
    res.sendfile(__dirname+"/index.html");
});

//Funcion para escuhar todo lo que se emite desde el JQuery
//data son las bolitas emitidas desde el cliente
io.sockets.on("connect",function(socket)
{
  socket.on("create", function(data)
{
  io.sockets.emit("created",data);
});

  socket.on("toSet", function(data)
{
  io.sockets.emit("set",data);
});
socket.on("move", function(data)
{
io.sockets.emit("moving",data);
});
socket.on("delete", function(data)
{
io.sockets.emit("deleted",data);
});

socket.on("playerDeleted", function(data)
{
io.sockets.emit("ok",data);
});

});
