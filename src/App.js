import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

      this.update(response, -1, false);
    })
    // open the request with the verb and the url
    const moves_as_string = this.moves.join(',');
    //xhr.open('GET', `http://127.0.0.1:1234/moves/${moves_as_string}`);
    const url = `https://vgomgu3y7ez6yv2eyt2x3idfmu0ptzmc.lambda-url.us-east-1.on.aws?moves=${moves_as_string}&depth=${Math.max(2, this.props.depth)}`
    xhr.open('GET', url);
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

    if (JSON.stringify(temp) === hash){
      if (!player){
        alert("Pass")
      }
      this.moves.push(81);
    } else {
      this.moves.push(coords.x*9+coords.y)
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
    <div className="App" style={{fontFamily: 'fantasy', color: 'white'}}>
      <Board depth={depth}/>
      <div style={{display: 'flex'}}>
        <div style={{flex: 1, padding: '10px', display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
          <h1 style={{flex: 1, textAlign: 'center', justifyContent: 'center'}}>
            Andrew W. Mackenzie 
          </h1>
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
            <FontAwesomeIcon icon={faDiscord}/>
            <div style={{marginLeft: '10px', marginRight: '20px'}}>dandelion4#3240</div>
            <FontAwesomeIcon icon={faGithub}/>
            <div style={{marginLeft: '10px', marginRight: '20px'}}>amackenzie1</div>
            <FontAwesomeIcon icon={faEnvelope}/>
            <div style={{marginLeft: '10px'}}>andrew.mackenzie@mail.mcgill.ca</div>
          </div>
          <div style={{display: 'flex'}}>
            <h2>About me</h2>
          </div>
          <div style={{display: 'flex'}}>
            <div>
              <div className='myPicture' style={{flex: 1, borderRadius: '10px'}}/>
              <div style={{padding: '5px'}}>
              </div>
            </div>
            <div style={{paddingLeft: '20px', fontWeight: '500', flex: 4}}>
              <div>
              I'm currently a master's student at McGill under Courtney and Elliot Paquette, graduating spring 2024. My research looks at the
              limiting behaviour of asynchronous gradient descent on quadratic problems.
              </div>
              <br/>
              <div>
              I will delightedly work on optimization (smooth or combinatorial), RL, generative models, or cryptography at any time of day or night. 
              I can also be tempted by classical analysis, physics simulations, probability theory, or any other crunchy math.
              </div>

            </div>
          </div>
          <h2>AlphaGo</h2>
          <div style={{color: 'white'}}>
            On the right is a reimplementation of <a href="https://www.deepmind.com/blog/alphazero-shedding-new-light-on-chess-shogi-and-go" target="_blank">AlphaZero</a>. The heuristic function is unexpectedly
            good: it can play superfically sane-looking Go using no search. The backend code is on <a href="https://github.com/amackenzie1/AlphaGo9.git" target="_blank">Github</a>. 
          </div>
        </div>
        <div style={{flex: 1}}>
          <div style={{padding: '30px', alignContent: 'center', justifyContent: 'center' , display: 'flex', flex: 1}}>
            <div style={{display: 'flex', flexDirection: 'column', marginRight: '10px'}}>
              <div style={{flex: 1}}/>
              <div># ResNet evaluations</div>
            </div>
            <input type="number" value={depth} onChange={(e) => setDepth(e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
