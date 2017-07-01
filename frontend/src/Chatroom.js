import React, { Component } from 'react';
class Chatroom extends Component {
  constructor(){
    super();
    this.createList = this.createList.bind(this);
    this.changeChatInput=this.changeChatInput.bind(this);
    this.sendChatInput=this.sendChatInput.bind(this);
  }
  intoQueue(e,id,name,chosen){

  }
  changeChatInput(chatInput){
    this.props.changeChatInput(chatInput);
  }
  sendChatInput(){
    this.props.sendChatInput();
  }
  createList(sayBlock){
    let blockType= "sayblock-from-bot";
    if(sayBlock.from===1){
      blockType= "sayblock-from-user";
    }else if (sayBlock.from===-1)
      blockType= "sayblock-from-error";
    return (
      <div 
        className={blockType} 
        key={`sayblock-${sayBlock.id}`}>        
        {sayBlock.say}
      </div>
    )
  }
  scrollToBottom(){
    this.messagesEnd.scrollIntoView({ behavior: 'smooth' })
  }
  componentDidUpdate() {
    this.scrollToBottom();
  }
  componentDidMount() {
    this.scrollToBottom();
  }
  render() {
    let visibleChatRoom = this.props.visibleChatRoom;
    let listArr = this.props.chatLog;
    var listArrRender = listArr.map(this.createList);
    let chatroomSayblockListType = "chatroom-main";
    if(!visibleChatRoom){
      chatroomSayblockListType="chatroom-main-invisible";
    }
    return (
        <div className="chatroom">
          <div className="chatroom-title" onClick={this.props.chatroomSwitch}>
            HyberCook ChatBot
          </div>
          <div className={chatroomSayblockListType}> 
            <div className="chatroom-sayblock-list">
              {listArrRender}
              <div className="dummy" style={{ float:"left", clear: "both" }}
              ref={(el) => { this.messagesEnd = el; }} />
            </div>
            <div className="chatroom-input-div">
              <input className="chatroom-input"
                value={this.props.chatInput}
                onChange={
                  (e)=>{this.changeChatInput(e.target.value)}}
                onKeyPress={
                  (e)=>{
                  let key= e.keyCode || e.which;
                  if(key===13)
                     this.sendChatInput();
                  }}
              />
              <button className="chatroom-input-send-button" onClick={this.sendChatInput}>Send</button>
            </div>
          </div>

        </div>
    );
  }
}

export default Chatroom;