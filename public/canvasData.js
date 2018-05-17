$(document).ready(() => {

    //==================declaring all my variables, comas seperate them==============
console.log("running canvasData");
    const canvas = document.getElementById("canvas"), //canvas
          context = canvas.getContext('2d'),
          sig = document.getElementsByName('sig')[0];//the hidden input name
          let mouseX,
          mouseY;

          canvas.addEventListener("mousedown", onMouseDown); //(event, recursive function)

          function onMouseDown(event) {
              mouseX = event.offsetX;
              mouseY = event.offsetY;
              canvas.addEventListener("mousemove", onMouseMove);
              document.body.addEventListener("mouseup", onMouseUp);
          }

          function onMouseMove(event) {
              context.beginPath();
              context.moveTo(mouseX, mouseY);
              mouseX = event.offsetX;
              mouseY = event.offsetY;
              context.lineTo(mouseX, mouseY);
              context.stroke();
          }

          function onMouseUp(event) {

              //here we turn the signature to a string
              sig.value = canvas.toDataURL();
              canvas.removeEventListener("mousemove", onMouseMove);
              document.body.removeEventListener("mouseup", onMouseUp);
          }
});
