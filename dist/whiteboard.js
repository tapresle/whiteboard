class Whiteboard {
    constructor() {
        this.offsetTop = 0;
        this.offsetLeft = 0;
        this.paint = false;
        this.preventDrawing = false;
        this.clickX = new Array();
        this.clickY = new Array();
        this.clickDrag = new Array();
        this.color = new Array();
        this.currentColor = 'black';
        this.canvas = document.getElementById('whiteboard');
        this.canvas.height = 800; //document.body.clientHeight;
        this.canvas.width = 1280; //document.body.clientWidth;
        this.offsetTop = this.canvas.offsetTop;
        this.offsetLeft = this.canvas.offsetLeft;
        this.ctx = this.canvas.getContext('2d');
        this.line(this.currentColor);
        this.socket = io.connect('http://localhost:4000');
        this.socket.on('draw', (data) => {
            this.clickX = data.clickX;
            this.clickY = data.clickY;
            this.clickDrag = data.clickDrag;
            this.color = data.color;
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
            this.draw(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, false, this.currentColor);
        });
        this.canvas.addEventListener('mouseup', () => {
            this.paint = false;
        });
        this.canvas.addEventListener('mouseleave', () => {
            this.paint = false;
        });
        this.canvas.addEventListener('mousemove', (e) => {
            this.draw(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true, this.currentColor);
        });
    }
    draw(x, y, isDragging, color) {
        if (this.paint && !this.preventDrawing) {
            this.addClick(x, y, isDragging, color);
            this.redraw(false);
        }
    }
    addClick(x, y, isDragging, color) {
        this.clickX.push(x);
        this.clickY.push(y);
        this.clickDrag.push(isDragging);
        this.color.push(color);
    }
    redraw(isDrawingFromNetwork) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for (var i = 0; i < this.clickX.length; i++) {
            this.ctx.beginPath();
            if (this.clickDrag[i] && i) {
                this.ctx.moveTo(this.clickX[i - 1], this.clickY[i - 1]);
            }
            else {
                this.ctx.moveTo(this.clickX[i], this.clickY[i]);
            }
            this.ctx.lineTo(this.clickX[i], this.clickY[i]);
            this.ctx.closePath();
            this.ctx.strokeStyle = this.color[i];
            this.ctx.stroke();
        }
        // Reset to last client's color so they don't accidentally hold onto the last from network
        this.ctx.strokeStyle = this.currentColor;
        if (!isDrawingFromNetwork) {
            this.socket.emit('drawClick', {
                clickX: this.clickX,
                clickY: this.clickY,
                clickDrag: this.clickDrag,
                color: this.color
            });
        }
    }
    clear() {
        if (window.confirm('Are you sure you want to clear the board?')) {
            this.clickX = new Array();
            this.clickY = new Array();
            this.clickDrag = new Array();
            this.color = new Array();
            this.redraw(false);
        }
    }
    eraser() {
        this.ctx.fillStyle = 'solid';
        this.currentColor = 'white';
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = 'round';
    }
    line(color) {
        this.ctx.fillStyle = 'solid';
        this.currentColor = color;
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = 'round';
    }
}
let whiteboard = new Whiteboard();
//# sourceMappingURL=whiteboard.js.map