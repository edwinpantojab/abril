function getRandomInt(min, max) {
  // Asegurar que los parámetros son números enteros
  min = Math.ceil(min);
  max = Math.floor(max);

  // Generar un número aleatorio dentro del rango especificado
  const randomMultiplier = Math.random();
  const randomInteger = Math.floor(randomMultiplier * (max - min + 1)) + min;
  return randomInteger;
}

function generateSequence() {
  const records = ["I", "J", "L", "O", "S", "T", "Z"];

  while (records.length) {
    const rand = getRandomInt(0, records.length - 1);
    const name = records.splice(rand, 1)[0];
    tetrominoSequence.push(name);
  }
}

// obtener el siguiente tetrominó en la secuencia
function getNextTetromino() {
  if (tetrominoSequence.length === 0) {
    generateSequence();
  }

  const name = tetrominoSequence.pop();
  const array = tetrominos[name];

  const col = playfield[0].length / 2 - Math.ceil(array[0].length / 2);

  const row = name === "I" ? -1 : -2;

  return {
    name: name, // nombre de la pieza (L, O, etc.)
    matrix: array, // la matriz de rotación actual
    row: row, // fila actual (comienza fuera de la pantalla)
    col: col, // columna actual
  };
}

function rotate(matrix) {
  const N = matrix.length - 1;
  const result = matrix.map((row, i) => row.map((val, j) => matrix[N - j][i]));

  return result;
}

function isValidMove(matrix, cellRow, cellCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (
        matrix[row][col] &&
        // fuera de los límites del juego
        (cellCol + col < 0 ||
          cellCol + col >= playfield[0].length ||
          cellRow + row >= playfield.length ||
          playfield[cellRow + row][cellCol + col])
      ) {
        return false;
      }
    }
  }

  return true;
}

function placeTetromino() {
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {
        if (tetromino.row + row < 0) {
          return showGameOver();
        }

        playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
      }
    }
  }

  for (let row = playfield.length - 1; row >= 0; ) {
    if (playfield[row].every(cell => !!cell)) {
      // drop every row above this one
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          playfield[r][c] = playfield[r - 1][c];
        }
      }
    } else {
      row--;
    }
  }

  tetromino = getNextTetromino();
}

function showGameOver() {
  cancelAnimationFrame(rAF);
  gameOver = true;

  context.fillStyle = "black";
  context.globalAlpha = 0.75;
  context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

  context.globalAlpha = 1;
  context.fillStyle = "white";
  context.font = "36px monospace";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("GAME OVER!", canvas.width / 2, canvas.height / 2);
}

const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const grid = 32;
const tetrominoSequence = [];

const playfield = [];

for (let row = -2; row < 20; row++) {
  playfield[row] = [];

  for (let col = 0; col < 10; col++) {
    playfield[row][col] = 0;
  }
}

const tetrominos = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
};
// le da color a los retrominos o fichas del juego
const colors = {
  I: "white",
  O: "white",
  T: "white",
  S: "white",
  Z: "white",
  J: "white",
  L: "white",
};

let count = 0;
let tetromino = getNextTetromino();
let rAF = null;
let gameOver = false;

function loop() {
  rAF = requestAnimationFrame(loop);
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playfield[row][col]) {
        const name = playfield[row][col];
        context.fillStyle = colors[name];

        context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
      }
    }
  }

  // dibujar el tetromino activo
  if (tetromino) {
    // El tetromino cae cada 35 cuadros
    if (++count > 35) {
      tetromino.row++;
      count = 0;

      // coloca la pieza si se topa con algo
      if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
        tetromino.row--;
        placeTetromino();
      }
    }

    context.fillStyle = colors[tetromino.name];

    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {
          // drawing 1 px smaller than the grid creates a grid effect
          context.fillRect(
            (tetromino.col + col) * grid,
            (tetromino.row + row) * grid,
            grid - 1,
            grid - 1
          );
        }
      }
    }
  }
}

// escucha los eventos del teclado para mover el tetromino activo
document.addEventListener("keydown", function (e) {
  if (gameOver) return;

  // teclas de flecha izquierda y derecha (mover)
  if (e.which === 37 || e.which === 39) {
    const col = e.which === 37 ? tetromino.col - 1 : tetromino.col + 1;

    if (isValidMove(tetromino.matrix, tetromino.row, col)) {
      tetromino.col = col;
    }
  }

 // tecla de flecha hacia arriba (rotar)
  if (e.which === 38) {
    const matrix = rotate(tetromino.matrix);
    if (isValidMove(matrix, tetromino.row, tetromino.col)) {
      tetromino.matrix = matrix;
    }
  }

  // tecla de flecha hacia abajo (soltar)
  if (e.which === 40) {
    const row = tetromino.row + 1;

    if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
      tetromino.row = row - 1;

      placeTetromino();
      return;
    }

    tetromino.row = row;
  }
});

let score = 0;

// actualiza la puntuación y la muestra en la pantalla
function updateScore() {
  const scoreElement = document.getElementById("score");
  scoreElement.innerHTML = `Score: ${score}`;
}

// Pon el tetromino en el campo de juego
function placeTetromino() {
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {
        // fin del juego si la pieza tiene alguna parte fuera de la pantalla
        if (tetromino.row + row < 0) {
          return showGameOver();
        }

        playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
      }
    }
  }

  // comprueba si hay borrados de línea comenzando desde abajo y avanzando hacia arriba
for (let row = playfield.length - 1; row >= 0; ) {
  if (playfield[row].every(cell => !!cell)) {
    // incrementa la puntuación y actualiza la visualización
    score += 10;
    updateScore();

    // Suelta cada fila por encima

    for (let r = row; r >= 0; r--) {
      for (let c = 0; c < playfield[r].length; c++) {
        playfield[r][c] = playfield[r - 1][c];
      }
    }

    // reproduce el sonido al borrar la fila
    document.getElementById("borrar-fila-audio").play();
  } else {
    row--;
  }
}


  tetromino = getNextTetromino();
}

// generar la visualización de la puntuación inicial
updateScore();

document.getElementById("reset-button").addEventListener("click", () => {
  // restablecer el campo de juego
  for (let row = -2; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      playfield[row][col] = 0;
    }
  }

  // restablecer la secuencia de tetromino
  tetrominoSequence.length = 0;

  // Consigue el primer tetromino
  tetromino = getNextTetromino();

  // restablecer el estado del juego
  gameOver = false;
  score = 0;
  lines = 0;
  level = 1;

 // limpia la pantalla de fin de juego
  context.clearRect(0, canvas.height / 2 - 30, canvas.width, 60);

  
  // inicia el ciclo del juego
  rAF = requestAnimationFrame(gameLoop);
});

const audio = new Audio('sonido4.ogg');
audio.playbackRate = 2;

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    audio.currentTime = 0; // asegura que el sonido se reinicie cada vez que se presiona una tecla
    audio.play();
  }
});



// obtener los botones por su id
const pauseBtn = document.getElementById('pause-btn');
// const inicioBtn = document.getElementById('inicio-btn');
const reanudarBtn = document.getElementById('reanudar-btn');

// agregar un evento click al botón de pausa
pauseBtn.addEventListener('click', function() {
  // detener el juego
  cancelAnimationFrame(rAF);
});

// agregar un evento click al botón de inicio
// inicioBtn.addEventListener('click', function() {
//   // reiniciar el juego
//   resetGame();
//   // iniciar el juego
//   rAF = requestAnimationFrame(loop);
// });

// agregar un evento click al botón de reanudar
reanudarBtn.addEventListener('click', function() {
  // reanudar el juego
  rAF = requestAnimationFrame(loop);
});


