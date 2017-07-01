import React, { Component } from 'react';
import he from 'he';
class Recipe extends Component {
  constructor(){
    super();
    this.createList=this.createList.bind(this);
    this.openWindow=this.openWindow.bind(this);
  }
  openWindow(url){
    window.open(url, "_blank");
  }
  createList(recipeBlock){
    return (
      <div 
        className="recipe-block-container" 
        key={`recipe-${recipeBlock.title}`}>
        <div className="recipe-block-title">
          {he.decode(recipeBlock.title)}
        </div>
        <div className="recipe-block-img" 
        onClick={()=>{this.openWindow(recipeBlock.url)}}>
          <img 
            src={recipeBlock.img}
            alt={recipeBlock.url}
          />
        </div>
      </div>
    )
  }

  render() {
    let listArr = this.props.recipe;
    var listArrRender = listArr.map(this.createList);
    return (
        <div>
          <div className="recipe-list">
            {listArrRender}
          </div>
        </div>
    );
  }
}

export default Recipe;