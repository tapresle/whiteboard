class Whiteboard {
    constructor() {
        this.offsetTop = 0;
        this.offsetLeft = 0;
        this.paint = false;
        this.preventDrawing = false;
        this.whiteboardModel = new WhiteboardModel();
        this.currentColor = 'black';
        this.currentRoom = 'default';
        this.canvas = document.getElementById('whiteboard');
        this.canvas.height = 800; //document.body.clientHeight;
        this.canvas.width = 1280; //document.body.clientWidth;
        this.offsetTop = this.canvas.offsetTop;
        this.offsetLeft = this.canvas.offsetLeft;
        this.ctx = this.canvas.getContext('2d');
        this.line(this.currentColor);
        this.socket = io.connect('http://localhost:4000');
        this.socket.on('draw', (data) => {
            this.whiteboardModel = data.whiteboardModel;
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
        // join default room at startup
        this.joinRoom();
        this.socket.on('joinedRoom', (data) => {
            alert('Joined room: ' + data.roomId);
            this.currentRoom = data.roomId;
            this.whiteboardModel = data.whiteboardModel;
            this.redraw(true);
        });
    }
    draw(x, y, isDragging, color) {
        if (this.paint && !this.preventDrawing) {
            this.addClick(x, y, isDragging, color);
            this.redraw(false);
        }
    }
    addClick(x, y, isDragging, color) {
        this.whiteboardModel.clickX.push(x);
        this.whiteboardModel.clickY.push(y);
        this.whiteboardModel.clickDrag.push(isDragging);
        this.whiteboardModel.color.push(color);
    }
    redraw(isDrawingFromNetwork) {
        //this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (var i = 0; i < this.whiteboardModel.clickX.length; i++) {
            this.ctx.beginPath();
            if (this.whiteboardModel.clickDrag[i] && i) {
                this.ctx.moveTo(this.whiteboardModel.clickX[i - 1], this.whiteboardModel.clickY[i - 1]);
            }
            else {
                this.ctx.moveTo(this.whiteboardModel.clickX[i], this.whiteboardModel.clickY[i]);
            }
            this.ctx.lineTo(this.whiteboardModel.clickX[i], this.whiteboardModel.clickY[i]);
            this.ctx.closePath();
            this.ctx.strokeStyle = this.whiteboardModel.color[i];
            this.ctx.stroke();
        }
        // Reset to last client's color so they don't accidentally hold onto the last from network
        this.ctx.strokeStyle = this.currentColor;
        if (!isDrawingFromNetwork) {
            this.socket.emit('drawClick', {
                whiteboardModel: this.whiteboardModel,
                roomId: this.currentRoom
            });
        }
    }
    clear() {
        if (window.confirm('Are you sure you want to clear the board?')) {
            this.whiteboardModel = new WhiteboardModel();
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
    joinRoom() {
        let room = document.getElementById('room').value;
        this.socket.emit('joinRoom', {
            room: room
        });
    }
    saveWhiteboard() {
        let downloadLink = document.createElement('a');
        downloadLink.download = 'whiteboard';
        downloadLink.href = this.canvas.toDataURL('image/png');
        downloadLink.dataset.downloadurl = ['image/png', downloadLink.download, downloadLink.href].join(':');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
}
class WhiteboardModel {
    constructor() {
        this.clickX = new Array();
        this.clickY = new Array();
        this.clickDrag = new Array();
        this.color = new Array();
    }
}
// Do the thing
let whiteboard = new Whiteboard();
//# sourceMappingURL=whiteboard.js.map