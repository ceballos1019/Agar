//Efecto para que se suba el div de escoger
$(document).on("ready",function()
{
  var socket=io.connect();  //Se encarga de la comunicación con el servidor
  var txtMen=$("#txtMensaje");
  var color=$("#color");
  var deleted; //Desaparecer bolitas


  //Para que la lista se recargue cada segundo
  setInterval(sort,1000);

  //Poner de mayor a menor el puntaje
  function sort()
  {
      var $list=$("#listaj");
      $list.find(".test").sort(function(a,b)
    {
      return +a.dataset.percentage - +b.dataset.percentage;
    }).appendTo($list);

    //Poner la lista inversa
    [].reverse.call($("#listaj li")).appendTo("#listaj");
  }

    $("#boton").on("click",function()
  {
      $("#recuadro").slideUp();
  });

//Crear todos los circulos de colores
$("#mapa").on("click",function()
{
  for(var i=1; i<100;i++)
  {
    var c=Math.floor(Math.random()*5) +1; //Número aleatorio del 1 al 5
    var col;  //Va a dar el color de cada bola
    switch (c) {
      case 1:
        col="green";
        break;
      case 2:
        col="blue";
        break;
      case 3:
        col="red";
        break;
      case 4:
        col="purple";
        break;
      case 5:
        col="orange";
        break;
      default:
        col="black";
    }

    //Objetos JSON para la posición de las bolas
    var posBall={ left: Math.floor(Math.random()*2000)+1,
              top: Math.floor(Math.random()*900+1),
              color:col}

    //Creación bolitas
    var balls="<div id='bolita"+i+"' class='bolita' type='bolita' name='bolita' style='background-color:"+posBall.color+";left:"+posBall.left+"px;top:"+posBall.top+"px;'>"+i+"</div>";
    //Poner las bolitas en la "plataforma"
    socket.emit("toSet",balls);
  }
});
//Recibir datos del servidor
socket.on("set",function(data)
{
  $("#plataforma").append(data);

  $("#plataforma div").on("mousemove", doColision);
});

function doColision()
{
  deleted=$(this);
  //Colision con las bolitas
  var $div1=$("#"+$(txtMen).val());
  //Para jugador principal
  var x1 = $div1.offset().left;
  var y1 = $div1.offset().top;
  var h1 = $div1.outerHeight(true);
  var w1 = $div1.outerWidth(true);
  var b1 = y1+h1;
  var r1 = x1+w1;
  //Bolitas(comida)
  var x2 = $(this).offset().left;
  var y2 = $(this).offset().top;
  var h2 = $(this).outerHeight(true);
  var w2 = $(this).outerWidth(true);
  var b2 = y2+h2;
  var r2 = x2+w2;

//Cuando no se está tocando la bolita a eliminar
  if(b1<y2 || y1>b2 || r1 < x2 || x1> r2)
  {
    return false;
  }
  //Hacer que la bola vaya creciendo
  $("#"+$(txtMen).val()).css("height","+=1");
  $("#"+$(txtMen).val()).css("width","+=1");
  $(deleted).remove();

  var objBall={del:$(deleted).text(),
           sum:"#"+$(txtMen).val()+"-",
           name:$(txtMen).val()}
  socket.emit("delete", objBall);

}

//Recibir datos del servidor
socket.on("deleted",function(data)
{
  console.log("El nombre de la bolita es: " +data.del);
  var score = parseInt($(data.sum).text());
  score+=5;
  $(data.sum).text(score);
  $(data.sum).attr("data-percentage", score);
  $(data.sum).append("<span> - " + data.name + "</span>");
  $("#bolita"+data.del).remove();
});

//Capturar el color seleccionado por el usuario
$("#boton").on("click",function()
{
  var  playerColor=$(color).val();
  console.log("color es:" + playerColor);
  var  playerBorder;
  switch (playerColor) {
    case 'green':
      playerBorder="#7fc407";
      break;
    case 'blue':
      playerBorder="#0173a8";
      break;
    case 'red':
      playerBorder="#D21305";
      break;
    default:
      playerBorder="black";
  }

console.log("Borde es:" + playerBorder);
//Objeto JSON correspondiente a los jugadores
  var objPlayer={id: $(txtMen).val(),
                 color: $(color).val(),
                 border: playerBorder}

//Objeto JSON correspondiente  al jugador principal
  var obj={mainPlayer: "<div id='"+objPlayer.id+"' class='player' type='player' name='"+objPlayer.id+"' style='background-color:"+objPlayer.color+";border:5px solid"+objPlayer.border+";'>"+objPlayer.id+"</div>",
           list: "<li id='"+objPlayer.id+"-' class='test' data-percentage='0'>0</li>"}

//Emitir el jugador por un socket
  socket.emit("create", obj);
});

//Recibir datos del servidor
socket.on("created",function(data)
{
  $("body").append(data.mainPlayer);
  $("#listaj").append(data.list);  //Agregar lista de puntajes
});
//Evento para mover la bola
$("body").on("mousemove",function(event)
{
    var myPlayer={player:$(txtMen).val(),
                x:event.pageX,
                y:event.pageY,
                h:parseInt($("#"+$(txtMen).val()).css("height")), //Crecimiento de la bolita
                w:parseInt($("#"+$(txtMen).val()).css("width"))}

  //Movimiento al jugador
  $("#"+$(txtMen).val()).css("left", event.pageX);
  $("#"+$(txtMen).val()).css("top", event.pageY);
  socket.emit("move",myPlayer);
  });
  //Recibir datos del servidor
  socket.on("moving",function(data)
  {
      var move={left:data.x,
                top: data.y,
                height: data.h, //Crecimiento de la bolita
                width: data.w}
      $("#"+data.player).css(move);

      //Un jugador se puede comer a otro, todo jugador posee la clase "player"
      $("body .player").on("mousemove", hit);
  });

  function hit()
  {
    var fdeleted; //finalmente eliminado
    var $enemy=$(this);

    var $typee=$enemy.attr("type"); //player
    var $namee=$enemy.attr("name"); //nick
    var heighte=parseInt($enemy.css("height"));
    var widthe=parseInt($enemy.css("width"));

    console.log("height es: " +heighte)
    var $player=$("#"+$(txtMen).val()); //Id de nuestro jugador
    var $typep=$player.attr("type"); //player
    var $namep=$player.attr("name"); //nick de nuestro jugador
    var heightp=parseInt($player.css("height"));
    var widthp=parseInt($player.css("width"));

    //Cuando yo me seleccione no me elimine
    if( $typee == "player" && $namee!==$player.text())
    {
      //Condicional para absorber sólo a los más pequeños
      if(heighte < heightp && widthe < widthp)
      {
        fdeleted=$enemy;
      }
      else if(heighte > heightp && widthe > widthp)
      {
        fdeleted=$player;
      }
     $(fdeleted).remove();

     //Pasar eliminado por sockets
     socket.emit("playerDeleted",  $(fdeleted).text());
    }
  }

  //Recibir datos del servidor
  socket.on("ok",function(data)
  {
      $("#"+data).remove();
  });

});
