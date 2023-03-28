import { Component } from '@angular/core';
import { Room } from '../classes/room';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  private selectedFile: File = null;
  private imgURL: any;
  canvas: any;
  context: any;
  products: any;
  roomList = [];
  img = new Image();

  clearProducts() {
      this.context.clearRect(0,0, this.canvas.width, this.canvas.height)
      
      this.canvas.width = this.img.width;
      this.canvas.height = this.img.height;
      this.context.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
      
      this.roomList.forEach(room => {
        this.drawLine(room.linesToDraw);
        this.nameRoom(room.roomName, room.xCenter, room.yCenter, this.context)
      });   

  }

  addProduct(product) {
    //hardcode living room for now
    var xCenter = this.roomList[0].xCenter;
    var yCenter = this.roomList[0].yCenter;

    this.context.beginPath();
    this.context.fillStyle = "#00ff00";
    this.context.globalAlpha = 0.2;
    this.context.fillRect(xCenter, yCenter, product.width, product.height);
    this.context.stroke(); 
    this.context.globalAlpha = 1.0;
  }

  //READ IMAGE FILE
  onImageFileChanged(event) {
    if (event.target.files.length == 0) return;
      this.selectedFile = < File > event.target.files[0];
      var reader = new FileReader();
      reader.readAsDataURL(this.selectedFile);
  
      reader.onload = (_event) => {
        this.imgURL = reader.result;
        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext("2d");

        this.img.src = this.imgURL;

        this.img.onload = () => {
        this.canvas.width = this.img.width;
        this.canvas.height = this.img.height;
        this.context.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
        
      };
    }
  }

  //READ JSON CONFIG FILE
  onConfigFileChanged(event) {

    this.selectedFile = < File > event.target.files[0];
    var reader = new FileReader();
    reader.readAsText(this.selectedFile, "UTF-8");
    reader.onload = () => {
    
    const linesToDraw = JSON.parse(reader.result.toString());
    const keys = Object.keys(linesToDraw);

    //%%%%%%%%%%%%%%%%%%%%%%%%
    //MAIN CALCULATION ROUTER
    //%%%%%%%%%%%%%%%%%%%%%%%%

    this.roomList.push(this.buildRoomObject(linesToDraw.livingRoom, keys[0]));
    this.roomList.push(this.buildRoomObject(linesToDraw.office, keys[1]));

    //%%%%%%%%%%%%%%%%%%%%%%%%
    }
  }

  onProductFileChanged(event) {

    this.selectedFile = < File > event.target.files[0];
    var reader = new FileReader();
    reader.readAsText(this.selectedFile, "UTF-8");
    reader.onload = () => {
    
    const rawProductList = JSON.parse(reader.result.toString());
    this.products = rawProductList.products;
    }
  }

  buildRoomObject(roomJson, name) {
    var roomObj = new Room();    

    roomObj.roomName = name;

    roomObj.linesToDraw = roomJson;

    roomObj = this.findBoundaries(roomJson, roomObj);
    
    roomObj = this.findCenter(roomJson, roomObj);

    //draw the lines
    this.drawLine(roomObj.linesToDraw);
    
    //display the name on the room
    this.nameRoom(roomObj.roomName, roomObj.xCenter, roomObj.yCenter, this.context);

    return roomObj
  }


  findBoundaries(roomJson, roomObj) {
    const xCoordinateList = [];
    const yCoordinateList = [];

   //findBoundaries
   roomJson.forEach(item => {
      item.forEach(tuple => {
        xCoordinateList.push(tuple[0]);
        yCoordinateList.push(tuple[1]);
      });
    });

    //dedupe
    const xboundaryList = xCoordinateList.filter(function(elem, index, self) {
      return index === self.indexOf(elem);
    })
    const yboundaryList = yCoordinateList.filter(function(elem, index, self) {
      return index === self.indexOf(elem);
    })
    roomObj.leftWall = Math.min(xboundaryList[0], xboundaryList[1])
    roomObj.rightWall = Math.max(xboundaryList[0], xboundaryList[1])   
    roomObj.topWall = Math.min(yboundaryList[0], yboundaryList[1])
    roomObj.bottomWall = Math.max(yboundaryList[0], yboundaryList[1])
    
    return roomObj;
  }


  findCenter(roomJson, roomObj) {
    var yCenterList = [];
    var xCenterList = [];

    roomJson.forEach(line => {
      yCenterList.push(line[0][1])
      xCenterList.push(line[0][0])
    });

       //Deduplicate x y values for name centroid
       xCenterList = xCenterList.filter(function(elem, index, self) {
        return index === self.indexOf(elem);
      })
      yCenterList = yCenterList.filter(function(elem, index, self) {
        return index === self.indexOf(elem);
      })
  
      //calculate name location
      const xCenter = (xCenterList.reduce((partialSum, a) => partialSum + a, 0)) /2;  
      const yCenter = (yCenterList.reduce((partialSum, a) => partialSum + a, 0)) / 2;  
  
      //62 highest point
      //372 lowest point
      //(62+372)/2 =  217
      
      //95 left most
      //1031 right most
      //(95+1031)/2 = 563

      roomObj.xCenter = xCenter
      roomObj.yCenter = yCenter
    return roomObj;
  }


//HELPER FUNCTIONS
  nameRoom(name, x, y, context) {
    context.font = "20px Georgia";
    context.fillText(name, x, y);
  }

  drawLine(linesToDraw) { 
        linesToDraw.forEach(line => {
          this.drawLineHelper(line[0],line[1]);
        });
  }
  
  drawLineHelper(start, end) {
    this.context.beginPath();

    this.context.moveTo(start[0], start[1]);
    this.context.lineTo(end[0], end[1])

    this.context.lineWidth = 10;
    this.context.strokeStyle = "red";
    this.context.stroke();
  }
	
}
