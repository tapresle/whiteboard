declare var io:any;

class Whiteboard {
  canvas;
  ctx;
  socket;
  offsetTop = 0;
  offsetLeft = 0;
  paint = false;
  preventDrawing = false;
  clickX = new Array();
  clickY = new Array();
  clickDrag = new Array();
  drawingTimeout;

  constructor() {
    this.canvas = document.getElementById('whiteboard');
    this.canvas.height = 800; //document.body.clientHeight;
    this.canvas.width = 1280; //document.body.clientWidth;

    this.offsetTop = this.canvas.offsetTop;
    this.offsetLeft = this.canvas.offsetLeft;

    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "solid";
    this.ctx.strokeStyle = "#438615";
    this.ctx.lineWidth = 5;
    this.ctx.lineCap = "round";

    this.socket = io.connect('http://localhost:4000');
    this.socket.on('draw', (data) => {
      this.clickX = data.clickX;
      this.clickY = data.clickY;
      this.clickDrag = data.clickDrag;
      this.redraw(true);

      this.canvas.style.borderColor = 'red';
      // If someone else is currently drawing, prevent others from interrupting
      this.preventDrawing = true;
      if (this.drawingTimeout) {
        clearTimeout(this.drawingTimeout);
      }
      this.drawingTimeout = setTimeout(() => {
        this.preventDrawing = false;
        this.canvas.style.borderColor = '#E8E8E8';
      }, 5000);
    });
    this.canvas.addEventListener('mousedown', (e) => {
      this.paint = true;
      this.draw(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, false);
    });
    this.canvas.addEventListener('mouseup', () => {
      this.paint = false;
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.paint = false;
    });
    this.canvas.addEventListener('mousemove', (e) => {
      this.draw(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
    });
  }

  draw (x, y, isDragging) {
    if (this.paint && !this.preventDrawing) {
      this.addClick(x, y, isDragging);
      this.redraw(false);
    }
  }

  addClick(x, y, isDragging) {
    this.clickX.push(x);
    this.clickY.push(y);
    this.clickDrag.push(isDragging);
  }

  redraw(isDrawingFromNetwork) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    for (var i = 0; i < this.clickX.length; i++) {
      this.ctx.beginPath();
      if (this.clickDrag[i] && i) {
        this.ctx.moveTo(this.clickX[i-1], this.clickY[i-1]);
      } else {
        this.ctx.moveTo(this.clickX[i], this.clickY[i]);
      }
      this.ctx.lineTo(this.clickX[i], this.clickY[i]);
      this.ctx.closePath();
      this.ctx.stroke();
    }

    if (!isDrawingFromNetwork) {
      this.socket.emit('drawClick', {clickX: this.clickX, clickY: this.clickY, clickDrag: this.clickDrag});
    }
  }
}

let whiteboard = new Whiteboard();
