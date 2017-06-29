import React, { Component, } from 'react';
import './App.css';
import Fridge from './Fridge.js';
import Recipe from './Recipe.js';
import Chatroom from './Chatroom.js';
import './rccalendar.css';
import deleteIcon from './delete.png';
import addIcon from './add.png';
import logoutIcon from './logout.png';
import SweetAlert from 'react-bootstrap-sweetalert';
import Calendar from 'rc-calendar';
import enUS from 'rc-calendar/lib/locale/en_US';
import './rc.css';
import TimePickerPanel from 'rc-time-picker/lib/Panel';

import moment from 'moment';
import 'moment/locale/zh-cn';
import 'moment/locale/en-gb';
function generateUUID () { // Public Domain/MIT		
    var d = new Date().getTime();		
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){		
        d += performance.now(); //use high-precision timer if available		
    }		
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {		
        var r = (d + Math.random() * 16) % 16 | 0;		
        d = Math.floor(d / 16);		
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);		
    });		
}
class App extends Component {
  constructor(){
    super();
    this.state={
      fridge:[],
      deletemode: false,
      queue:[],
      recipeList:[],
      count:5,
      alert: null,
      newDay: 0,
      newName: "New",
      //
      chatLog: [
        {id: 0,from: 0, say:"Hi, HyperCook chatbot at your service"},
        {id: 1,from: 1, say:"I bought an egg that will due in 7 days"},
        {id: 2,from: 0, say:"OK, I will add it on your list."}
        ],
      chatCount: 3,
      visibleChatRoom: false,
      chatInput: "",
      //
      userId: "ric", 
    }

    this.intoQueue=this.intoQueue.bind(this);
    this.fetchRecipeByQueue=this.fetchRecipeByQueue.bind(this);
    this.fetchRecipeByName=this.fetchRecipeByName.bind(this);
    
    this.deleteSwitch=this.deleteSwitch.bind(this);
    
    this.getFridge=this.getFridge.bind(this);
    this.addFridge=this.addFridge.bind(this);
    this.deleteFridge=this.deleteFridge.bind(this);
    this.deleteFridgeByName=this.deleteFridgeByName.bind(this);

    this.addFridgeAlert=this.addFridgeAlert.bind(this);
    this.onRecieveName=this.onRecieveName.bind(this);
    this.onRecieveDate=this.onRecieveDate.bind(this);
    this.onStandaloneSelect=this.onStandaloneSelect.bind(this);
    this.hideAlert=this.hideAlert.bind(this);

    this.chatroomSwitch=this.chatroomSwitch.bind(this);
    this.changeChatInput=this.changeChatInput.bind(this);
    this.sendChatInput=this.sendChatInput.bind(this);
    this.fetchChatBot=this.fetchChatBot.bind(this);

    this.logout=this.logout.bind(this);
    this.apiUrl="http://localhost:3000/api/";
  }
  componentDidMount(){
    this.getFridge();
  }
  
  findTarget(array, id){
    for (let i = 0, l = array.length; i < l; i++)
      if (array[i].id === id)
          return i;
  }
  findTargetName(array, name){
    for (let i = 0, l = array.length; i < l; i++)
      if (array[i].name === name)
          return i;
  }
  checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  }
  fetchRecipeByQueue(queue){
    //let queue=this.state.queue;
    let recipeList = [];
    fetch(`${this.apiUrl}ingredient`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "ingredient":queue
      }),
    }).then(this.checkStatus)
    .then(response=>response.json())
    .then(resObj=>{
      recipeList=resObj.recipe;
      this.setState({
        recipeList,
      })
    });
  }
  fetchRecipeByName(name){
    let recipeList = [];
    fetch(`${this.apiUrl}recipe`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "title": name
      }),
    }).then(this.checkStatus)
    .then(response=>response.json())
    .then(resObj=>{
      recipeList=resObj.recipe;
      this.setState({
        recipeList,
      })
    });
  }
  intoQueue(id,name,chosen){
    let fridge = this.state.fridge;
    let queue = [];
    let target = this.findTarget(fridge, id);
    fridge[target].chosen=!chosen;
    for(let i=0; i<fridge.length; i++){
      if(fridge[i].chosen){
        queue.push(fridge[i].name);
      }
    }
    this.setState({fridge,queue,},()=>{this.fetchRecipeByQueue(this.state.queue)})
  }

  addFridgeAlert(){ 
    if(this.state.deletemode === false) {
      this.setState({
      alert:(<SweetAlert
            input
            showCancel
            title="Ingredient"
            required
            validationMsg="You must enter your ingredient!"
            onConfirm={this.onRecieveName}
            onCancel={this.hideAlert}
        />)});
    }else{
      this.setState({
      alert:(<SweetAlert
            title="Please switch off delete mode"
            onConfirm={this.hideAlert}
      />)});
    }
  }
  onStandaloneSelect(value) {
    const now = moment();
    now.locale('zh-cn').utcOffset(8);
    // console.log('onStandaloneSelect');
    // console.log(value && value.format(format));
    var duration = moment.duration(value.diff(now));
    var newDay = Math.ceil(duration.asDays());
    this.setState({newDay,})
  }
  onRecieveName(value){
    const format = 'YYYY-MM-DD';
    const now = moment();
    now.locale('zh-cn').utcOffset(8);
    function getFormat(time) {
      return time ? format : 'YYYY-MM-DD';
    }
    const timePickerElement = <TimePickerPanel defaultValue={moment('00:00:00', 'HH:mm:ss')} />;
    function disabledDate(current) {
      if (!current) {
        // allow empty select
        return false;
      }
      const date = moment();
      date.hour(0);
      date.minute(0);
      date.second(0);
      return current.valueOf() < date.valueOf();  // can not select days before today
    } 
    this.setState({
      newName:value,
      alert:(<SweetAlert
          showCancel
          custom
          title="Expired date"
          onConfirm={this.onRecieveDate}
          onCancel={this.hideAlert}
      ><div className="calendar-div">
        <Calendar
          showWeekNumber={false}
          locale={enUS}
          defaultValue={now}
          showToday
          formatter={getFormat(true)}
          showOk={false}
          timePicker={timePickerElement}
          onSelect={this.onStandaloneSelect}
          disabledDate={disabledDate}
        />
      </div>

      
      </SweetAlert>)})
    
  }
  onRecieveDate(){
    this.addFridge(this.state.newName,this.state.newDay);
    this.setState(
      {
        alert:(<SweetAlert
          success
          title="Finish"
          onConfirm={this.hideAlert}
        />)
      }
    )
  }
  hideAlert(){
    this.setState({alert:null})
  }
  deleteSwitch(){
    this.setState({deletemode:!this.state.deletemode})
  }

  getFridge() {
    fetch('/api/foodStorage', {
      credentials: 'same-origin'		
    })		
    .then(res => res.json())		
    .then(d => {		
      let chosen=false;		
      const storage = d.ingredients;				
      const foodArray = storage.map(ig =>{	
        return({		
          id: ig.id,		
          name: ig.name,		
          day: ig.day,		
          chosen,		
        });		
      });
      return foodArray;		
    })		
    .then(data => this.setState({ fridge: data }))		
    .catch(err => console.log(err));
  }

  addFridge(name,day){
    if(this.state.deletemode === false) {
      let id =generateUUID();
      let fridge=this.state.fridge;
      let newFood={
        id,
        name,
        day,
        chosen: false,
      }
      fridge.push(newFood);

      fetch(`/api/foodStorage`, {		
        credentials: 'same-origin',		
        method: 'put',		
        headers: {		
          'Accept': 'application/json',		
          'Content-Type': 'application/json',		
        },		
        body: JSON.stringify({		
          delete:this.state.deletemode,		
          id,		
          name,		
          day,		
        }),		
      })
      .then(()=> this.setState({
          fridge,
          count:this.state.count+1,
        }))
      .catch(err => console.log(err));
    }
  }
  deleteFridge(id){
    let fridge = this.state.fridge;
    let queue = this.state.queue;
    let target = this.findTarget(fridge, id);
    if (fridge[target].chosen===true){
      let queueTarget = this.findTargetName(queue, fridge.name);
      queue.splice(queueTarget,1);
    }
    fridge.splice(target,1);

    fetch(`/api/foodStorage`, {		
        credentials: 'same-origin',		
        method: 'put',		
        headers: {		
          'Accept': 'application/json',		
          'Content-Type': 'application/json',		
        },		
        body: JSON.stringify({		
          delete: this.state.deletemode,		
          id,		
        }),		
      })
      .then(() => this.setState({fridge, queue}))
      .catch(err => console.log(err));
  }
  deleteFridgeByName(name){
    let fridge = this.state.fridge;
    let queue = this.state.queue;
    let target = this.findTarget(fridge, name);
    if (fridge[target].chosen===true){
      let queueTarget = this.findTargetName(queue, fridge.name);
      queue.splice(queueTarget,1);
    }
    fridge.splice(target,1);
    this.setState({fridge,queue})
  }

  chatroomSwitch(){
    this.setState({visibleChatRoom:!this.state.visibleChatRoom})
  }
  changeChatInput(chatInput){
    this.setState({chatInput,})
  }
  sendChatInput(){
    let chatInput = this.state.chatInput;
    if(chatInput.trim() === "" || chatInput === null){
    }
    else{
      let chatLog=this.state.chatLog;
      let newLog={
        id: this.state.chatCount,
        from: 1,
        say: this.state.chatInput,
      }
      chatLog.push(newLog);
      this.fetchChatBot(this.state.chatInput);
      this.setState({
        chatLog,
        chatCount: this.state.chatCount+1,
        chatInput: "",
      })
    }   
  }
  fetchChatBot(text){
    console.log(text);
    fetch(`${this.apiUrl}message`, {
      method: 'post',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "userId": this.state.userId,
        "say": text,
      }),
    }).then(this.checkStatus)
    .then(response=>response.json())
    .then(resObj=>{
      let botSay=resObj.say;
      let newLog={
        id: this.state.chatCount,
        from: 0,
        say: botSay,
      }

      let chatLog = this.state.chatLog;
      chatLog.push(newLog);
      this.setState({
        chatLog,
        chatCount: this.state.chatCount+1,
      });
      
      let action = resObj.action;
      let entities = resObj.entities;
      switch(action){
        case "AddIngredient":
          //this.addFridge(entities.ingredient, entities.day);
          this.getFridge();
          break;
        case "DeleteIngredient":
          //this.deleteFridgeByName(entities.ingredient);
          this.getFridge();
          break;
        case "FindRecipe":
          this.fetchRecipeByName(entities.food);
          break;
        case "None":
        case "Greetings":
        default:
          break;
      }
    })
    .catch(error=>{
      console.log('message fail...')
      console.log(error);
      let errorTextArray = [
        '(no respond)Nope, the bot is not working right now :(',
        '(no respond)have you checked your network connection?',
        '(no respond)Sorry, maybe server was shut down :o',
        '(no respond)The bot cannot reply you because of some technical issue...'
      ];
      let randomNumber = Math.floor(Math.random()*errorTextArray.length);
      let newLog={
        id: this.state.chatCount,
        from: -1,
        say: errorTextArray[randomNumber],
      }
      let chatLog = this.state.chatLog;
      chatLog.push(newLog);
      this.setState({
        chatLog,
        chatCount: this.state.chatCount+1,
      })
    });
  }
  logout(){
    fetch(`/logout`, {
      method: 'POST',
      redirect: 'follow',
      credentials: 'same-origin'		
    }).then(
      (response)=>{
        console.log(response);
        let redirecturl =response.url;
        window.location.replace(redirecturl);
      }
    )
    .catch(error=>{
      console.log('message fail...')
      console.log(error);
    })
  }
  render() {
    return (
      <div className="App">        
        {this.state.alert}
        <div className="App-top">
          <div className="logout-div" onClick={this.logout}>
            <img className="logout-icon" src={logoutIcon} alt="@"/>
            <div className="logout">logout</div>
          </div>
        </div>
        <div className="App-header">
          HyperCook
        </div>
        <div className="main-body">
          <div className="fridge">
            <div>
              <img className="icon" src={addIcon} alt="add" onClick={this.addFridgeAlert}/>
              <img className="icon" src={deleteIcon} onClick={this.deleteSwitch} alt="delete"/>
              <Fridge 
                fridge={this.state.fridge}
                deletemode={this.state.deletemode}
                intoQueue={this.intoQueue}
                deleteFridge={this.deleteFridge}
                >
              </Fridge>
            </div>
          </div>
          <div className="recipe">
            <Recipe
              recipe={this.state.recipeList}
            />
          </div>
        </div>
        <Chatroom 
          chatLog={this.state.chatLog}
          chatInput={this.state.chatInput}
          chatroomSwitch={this.chatroomSwitch}
          visibleChatRoom={this.state.visibleChatRoom}
          changeChatInput={this.changeChatInput}
          sendChatInput={this.sendChatInput}
        />
      </div>
    );
  }
}


export default App;