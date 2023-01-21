import { Component, useState } from 'react';
import './App.css';
import clean_board from "./clean";

var turn = 1;
var recent_onedeaths = [];
var board = [[0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0],  
              [0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0]]

function set_in(set, value){
  for (let item of set){
      if (JSON.stringify(item) === JSON.stringify(value)){
          return true;
      }
  }
  return false;
}              


class Piece extends Component {
  constructor(props) {
    super(props);
    this.state = {color: props.color};
    this.onClick = this.onClick.bind(this);
  }

  onClick(){
    if (turn === 1 && this.state.color === 0 && !set_in(recent_onedeaths, this.props.coords)){
      turn = -1;
      this.setState(() => (
        {color: 1}
      ), () => {
        this.props.update(this.props.coords, 1, true);
      });
    } else {
      console.log(this.state.color);
    }
  }

  getInterior(){
    if (this.state.color === 1){
      return <div className="piece"></div>;
    } else if (this.state.color === -1){
      return <div className="piece2"></div>;
    } else {
      return <div className="empty"></div>;
    }
  }

  render() {
    return (
      <div className="box" onClick={this.onClick} style={{}}>
        {this.getInterior()}
      </div>
    );
  }
}


class Board extends Component {
  constructor(props){
    super(props);
    this.state = {board: board};
    this.setState = this.setState.bind(this);
    this.update = this.update.bind(this);
    this.moves = [];
  }

  getServerMove(move) {
    // create a new XMLHttpRequest
    var xhr = new XMLHttpRequest()

    // get a callback when the server responds
    xhr.addEventListener('load', () => {
      // update the state of the component with the result here
      console.log(JSON.parse(xhr.responseText));
      turn = 1;
      this.update(JSON.parse(xhr.responseText), -1, false);
    })
    // open the request with the verb and the url
    xhr.open('GET', `http://127.0.0.1:1234/move/${move}`);
    // send the request
    xhr.send();
  }

  getStatelessServerMove(move) {
    // create a new XMLHttpRequest
    var xhr = new XMLHttpRequest()

    // get a callback when the server responds
    xhr.addEventListener('load', () => {
      // update the state of the component with the result here
      const response = JSON.parse(xhr.responseText);
      console.log(response);
      turn = 1;

      this.moves.push(response.x * 9 + response.y)
      this.update(response, -1, false);
    })
    // open the request with the verb and the url
    this.moves.push(move);
    const moves_as_string = this.moves.join(',');
    //xhr.open('GET', `http://127.0.0.1:1234/moves/${moves_as_string}`);
    xhr.open('GET', `https://vgomgu3y7ez6yv2eyt2x3idfmu0ptzmc.lambda-url.us-east-1.on.aws?moves=${moves_as_string}&depth=${this.props.depth}`);
    // send the request
    xhr.send();
  }

  update(coords, value, player){
    const hash = JSON.stringify(this.state.board);
    var temp = this.state.board;
    if (coords.x*9 + coords.y < 81 && temp[coords.x][coords.y] === 0){
      temp[coords.x][coords.y] = value;
    }

    var result = clean_board(temp, player ? 1 : -1);
    recent_onedeaths = result[1];
    temp = result[0];

    if (JSON.stringify(temp) === hash && player === -1){
      alert("Pass")
    }

    this.setState(() => (
      {board: temp}
    ), () => {
      if (player){
        this.getStatelessServerMove(coords.x*9+coords.y)
      }});
  }

  makeBoard(){
    var myboard = []
    for (var i = 0; i < 9; i++){
      for (var j = 0; j < 9; j++){
        myboard.push(<Piece key={`${turn}${i}${j}`} 
                            coords={{x: i, y: j}} 
                            color={board[i][j]}
                            update={this.update}/>);
      }
    }
    return myboard;
  }

  render(){
    return (
      <div>
        <div className="board">
        {this.makeBoard()}
       </div>
      </div>
      
    )
  }
}
function App() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', `http://127.0.0.1:1234/refresh`);
  xhr.send();
  const [depth, setDepth] = useState(5);
  return (
    <div className="App">
      <Board depth={depth}/>
      <div style={{padding: '30px', alignContent: 'center', justifyContent: 'center' , display: 'flex'}}>
        <div style={{display: 'flex', flexDirection: 'column', marginRight: '10px'}}>
          <div style={{flex: 1}}/>
          <div># ResNet evaluations</div>
        </div>
        <input type="number" value={depth} onChange={(e) => setDepth(e.target.value)} />
      </div>
    </div>
  );
}

export default App;
