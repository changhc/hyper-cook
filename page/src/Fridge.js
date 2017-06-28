import React, { Component } from 'react';
class Fridge extends Component {
  constructor(){
    super();
    this.createList = this.createList.bind(this);
    this.intoQueue=this.intoQueue.bind(this);
  }
  intoQueue(e,id,name,chosen){
    //console.log(e.target.className);
    if(!this.props.deletemode){
      if(e.target.className==="fridge-block-day"){

      }
      else
        this.props.intoQueue(id,name,chosen);
    }
    else{
      this.props.deleteFridge(id);
    }
  }
  createList(fridgeBlock){
    let blockType = "fridge-block-container"
    if (this.props.deletemode){
      blockType="fridge-block-container deletemode"
    }
    let day = fridgeBlock.day;
    var colorPick;
    switch(day){
      case 5:
        colorPick='#d7ffce';
        break;
      case 4:
        colorPick='#ebffce';
        break;
      case 3:
        colorPick='#fff9ce';
        break;
      case 2:
        colorPick='#ffe1ce';
        break;
      case 1:
        colorPick='#f1d3c8';
        break;
      case 0:
        colorPick='#ffc3b8';
        break;
      default:
        colorPick='#d7ffce';
        break;
    }
    var bPick =  (fridgeBlock.chosen)?"2px solid": "0px solid";
    var colorStyle={
      backgroundColor: colorPick,
      border:bPick
    }
    return (
      <div 
        className={blockType} 
        key={`fridge-${fridgeBlock.id}`} 
        onClick={(e)=>{this.intoQueue(e,fridgeBlock.id,fridgeBlock.name,fridgeBlock.chosen)}}>        
        <div className="fridge-block" style={colorStyle}> 
          <div className="fridge-block-name">
            {fridgeBlock.name}
          </div>
          <div className="fridge-block-day">
            due in: {fridgeBlock.day}
          </div>
        </div>
      </div>
    )
  }

  render() {
    let listArr = this.props.fridge;
    var listArrRender = listArr.map(this.createList);
    return (
        <div>
          <div className="fridge-list">
            {listArrRender}
          </div>
        </div>
    );
  }
}

export default Fridge;