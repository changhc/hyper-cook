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

      case 0:
        colorPick='#ff4b3f';
        break;
      case 1:
        colorPick='#ff753f';
        break;
      case 2:
        colorPick='#ff983f';
        break;
      case 3:
        colorPick='#ffab3f';
        break;
      case 4:
        colorPick='#7fb532';
        break;
      case 5:
      default:
        colorPick='#2db54a';
        break;
    }
    var bPick =  (fridgeBlock.chosen)?"4px solid #3d3d3d": "0px solid";
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