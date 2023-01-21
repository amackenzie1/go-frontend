var board = [[1, 1, 1, -1, 0, 0, 0, 0, 0],
              [-1, -1, -1, 0, 0, 0, 0, 0, 0],  
              [1, 1, 1, 0, 1, 0, 0, 0, 0],
              [0, 0, 1, 0, 1, 0, 0, 0, 0],
              [0, 0, 1, 0, 1, 0, 0, 0, 0],
              [0, 0, 1, 0, 1, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0]]

function kids(position){
  var potentials = [];
  if (position.x < 8){
    potentials.push({x: position.x + 1, y: position.y})
  }
  if (position.x > 0){
    potentials.push({x: position.x-1, y: position.y})
  }
  if (position.y < 8){
    potentials.push({x: position.x, y: position.y+1})
  }
  if (position.y > 0){
    potentials.push({x: position.x, y: position.y-1})
  }
  return potentials;
}

function live(board, position){
  for (let p of kids(position)){
    if (board[p.x][p.y] === 0){
      return true;
    }
  }
  return false;
}

function set_in(set, value){
    for (let item of set){
        if (JSON.stringify(item) === JSON.stringify(value)){
            return true;
        }
    }
    return false;
}

function set_delete(set, value){
    for (let item of set){
        if (JSON.stringify(item) === JSON.stringify(value)){
            set.delete(item);
        }
    }
}

function search(root, all_positions){
  var result = [root];
  var children = kids(root);
  for (const e of children){
    if (set_in(all_positions, e)){
      set_delete(all_positions, e);
      result = result.concat(search(e, all_positions));
    }
  }
  return result;
}

function get_ccs(board, who){
  var ccs = new Set();
  var all_positions = new Set();
  for (var i = 0; i < 9; i++){
    for (var j = 0; j < 9; j++){
      if (board[i][j] === who){
        all_positions.add({x: i, y: j});
      }
    }
  }
  while (all_positions.size > 0){
    var root = all_positions.values().next().value;
    all_positions.delete(root);
    ccs.add(search(root, all_positions));
  }
  return ccs;
}

function half_clean(board, who){
  var onedeaths = [];
  var components = get_ccs(board, who);
  for (let i of components){
    var alive = false;
    for (let j of i){
      alive = alive || live(board, j);
    }
    if (!alive){
      for (let j of i){
        board[j.x][j.y] = 0;
      }
      if (i.length === 1){
        onedeaths.push(i[0]);
      }
    }
  }
  return [board, onedeaths];
}

function clean_board(board, who){
  var onedeaths = [];
  var result = half_clean(board, who*-1);
  board = result[0];
  onedeaths = onedeaths.concat(result[1]);
  result = half_clean(board, who);
  return [result[0], onedeaths];
}

export default clean_board;