$(document).ready(() => {
        console.log("running canvasData");
            const canvas = document.getElementById("canvas"),
                  context = canvas.getContext('2d'),
                  sig = document.getElementsByName('sig')[0];
                  let mouseX,
                  mouseY;

                  canvas.addEventListener("mousedown", onMouseDown);

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
                      sig.value = canvas.toDataURL();
                      canvas.removeEventListener("mousemove", onMouseMove);
                      document.body.removeEventListener("mouseup", onMouseUp);
                  }
});
